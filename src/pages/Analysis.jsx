import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { MODULES } from "@/data/modules";
import { crossValidate } from "@/lib/crossValidation";

async function ensureSession(moduleKey) {
  let s = (await base44.entities.AssessmentSession.filter({ module: moduleKey }))[0];
  if (!s) s = await base44.entities.AssessmentSession.create({ module: moduleKey, status: "in_progress", started_at: new Date().toISOString() });
  return s;
}

async function collectResponses() {
  const sessions = await base44.entities.AssessmentSession.list();
  const openModules = ["session1", "sport", "gaming", "money", "decision_ownership"];
  const resByModule = {};
  for (const mk of openModules) {
    const s = sessions.find((x) => x.module === mk);
    if (s) {
      const responses = await base44.entities.Response.filter({ session_id: s.id });
      resByModule[mk] = responses.map((r) => ({ question_id: r.question_id, first_response: r.first_response, reflection_response: r.reflection_response }));
    }
  }
  const scores = await base44.entities.AssessmentScore.list();
  const sims = await base44.entities.SimulationResult.list();
  return { resByModule, scores, sims };
}

async function buildBundle() {
  const { resByModule, scores, sims } = await collectResponses();
  // Gather existing evidence
  let priorEvidence = [];
  try { priorEvidence = await base44.entities.EvidenceItem.filter({}); } catch {}

  const evidenceByModule = {};
  for (const mk of Object.keys(resByModule)) {
    try {
      const res = await base44.functions.invoke("analyzeModule", {
        module: mk,
        responses: resByModule[mk],
        priorEvidence: priorEvidence.map((e) => ({ domain: e.domain, claim: e.claim })),
      });
      const items = res?.data?.evidence_items || [];
      for (const it of items) {
        let created;
        try {
          created = await base44.entities.EvidenceItem.create({
            claim: it.claim,
            domain: it.domain,
            supporting_excerpt: it.supporting_excerpt || "",
            source_response_id: it.source_question_id || mk,
            source_module: mk,
            strength: it.strength || "weak",
            supports_or_contradicts: it.supports_or_contradicts || "neutral",
          });
        } catch {}
      }
      evidenceByModule[mk] = items;
    } catch {}
  }

  const allEvidence = await base44.entities.EvidenceItem.filter({});
  let contradictions = [];
  try { contradictions = await base44.entities.Contradiction.filter({}); } catch {}
  // Save new contradictions from analysis (single merge per fresh run)
  for (const mk of Object.keys(resByModule)) {
    const res = await base44.functions.invoke("analyzeModule", {
      module: mk, responses: resByModule[mk],
      priorEvidence: allEvidence.map((e) => ({ domain: e.domain, claim: e.claim })),
    }).catch(() => ({ data: {} }));
    const cons = res?.data?.contradictions || [];
    for (const c of cons) {
      const exists = contradictions.some((x) => x.description === c.description);
      if (!exists) {
        try {
          await base44.entities.Contradiction.create({
            description: c.description,
            dimension_a: c.dimension_a || "",
            dimension_b: c.dimension_b || "",
            follow_up_question: c.follow_up_question || "",
            status: "unresolved",
          });
        } catch {}
      }
    }
  }

  const evidence = await base44.entities.EvidenceItem.filter({});
  const finalContradictions = await base44.entities.Contradiction.filter({});
  const scoreMap = {};
  for (const s of scores) scoreMap[s.module] = { scores: s.scores, raw_data: s.raw_data };
  const simResults = sims.map((s) => ({ simulation_type: s.simulation_type, response_text: s.response_text, enjoyment: s.enjoyment, repeat_willingness: s.repeat_willingness, evaluation: s.evaluation }));

  // Cross-validation across structured tests + open-ended evidence + simulations.
  const crossFlags = crossValidate({ scoreMap, sjt: scoreMap["sjt"], drivers: scoreMap["career_drivers"], evidence, simulations: simResults });
  for (const f of crossFlags) {
    if (f.type === "contradiction" || f.type === "uncertainty") {
      const exists = finalContradictions.some((x) => x.description === f.description);
      if (!exists) {
        try {
          await base44.entities.Contradiction.create({
            description: f.description,
            dimension_a: f.dimension_a || "",
            dimension_b: f.dimension_b || "",
            follow_up_question: f.follow_up_question || "",
            status: "unresolved",
          });
        } catch {}
      }
    }
  }
  const finalContradictionsXV = await base44.entities.Contradiction.filter({});

  const bundle = {
    evidence_items: evidence.map((e) => ({ id: e.id, claim: e.claim, domain: e.domain, strength: e.strength, supports_or_contradicts: e.supports_or_contradicts, source_module: e.source_module, supporting_excerpt: e.supporting_excerpt })),
    contradictions: finalContradictionsXV.map((c) => ({ id: c.id, description: c.description, follow_up_question: c.follow_up_question, status: c.status })),
    scores: scoreMap,
    sjt: scoreMap["sjt"] ? scoreMap["sjt"].scores : null,
    career_drivers: scoreMap["career_drivers"] ? scoreMap["career_drivers"].scores : null,
    cross_validation: crossFlags,
    simulations: simResults,
  };

  // Generate Career DNA
  const dnaRes = await base44.functions.invoke("generateCareerDna", bundle);
  const careerDna = dnaRes?.data?.career_dna || {};

  // Generate hypotheses
  const hypRes = await base44.functions.invoke("generateCareerHypotheses", { ...bundle, career_dna: careerDna });
  const hypotheses = hypRes?.data?.hypotheses || [];

  // Save hypotheses
  const existingHyps = await base44.entities.CareerHypothesis.filter({});
  for (const h of existingHyps) { try { await base44.entities.CareerHypothesis.delete(h.id); } catch {} }
  for (const h of hypotheses) {
    try { await base44.entities.CareerHypothesis.create(h); } catch {}
  }

  // Generate final report
  const reportBundle = { ...bundle, career_dna: careerDna, hypotheses };
  const reportRes = await base44.functions.invoke("generateFinalReport", reportBundle);
  const reportData = reportRes?.data || {};

  const reportPayload = {
    report_language: "en",
    status: "complete",
    career_dna: careerDna,
    sections: {
      executive_summary: reportData.executive_summary,
      energizers: reportData.energizers,
      demonstrated_strengths: reportData.demonstrated_strengths,
      work_environment_fit: reportData.work_environment_fit,
      values_summary: reportData.values_summary,
      important_contradictions: reportData.important_contradictions,
      top_hypotheses_summary: reportData.top_hypotheses_summary,
      wildcard_hypotheses_summary: reportData.wildcard_hypotheses_summary,
      weak_fit_directions: reportData.weak_fit_directions,
      what_we_still_do_not_know: reportData.what_we_still_do_not_know,
      motivational_drivers: reportData.motivational_drivers,
      sjt_behavioral_patterns: reportData.sjt_behavioral_patterns,
      where_tests_disagree: reportData.where_tests_disagree,
      cross_validation: crossFlags.map((f) => ({ type: f.type, description: f.description, follow_up_question: f.follow_up_question })),
    },
    education_direction: { type: reportData.education_direction_type, implication: reportData.education_implication },
    experiments: reportData.experiments || [],
    action_plan_30_day: reportData.action_plan_30_day || [],
    twelve_month_direction: reportData.twelve_month_direction || "",
    full_markdown_en: reportData.executive_summary || "",
    full_markdown_pl: reportData.full_markdown_pl || "",
  };
  let existingReport = (await base44.entities.Report.filter({}))[0];
  if (existingReport) await base44.entities.Report.update(existingReport.id, reportPayload);
  else await base44.entities.Report.create(reportPayload);

  return true;
}

export default function Analysis() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  const [modules, setModules] = useState([]);

  useEffect(() => {
    (async () => {
      const sessions = await base44.entities.AssessmentSession.list();
      const missing = MODULES.filter((m) => !sessions.some((s) => s.module === m.id && s.status === "complete"));
      setModules(missing);
    })();
  }, []);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      setStage("Analysing your responses…");
      await buildBundle();
      setComplete(true);
    } catch (err) {
      setError(err.message || "Generation failed. Ensure OPENAI_API_KEY and model secrets are set.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-6">
        {modules.length > 0 && !generating && (
          <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-5 mb-6">
            <div className="flex gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Some modules aren't complete yet.</p>
                <p>For honest results, complete all modules first: {modules.map((m) => m.label).join(", ")}.</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/app")}>Go to dashboard</Button>
          </div>
        )}

        {!complete && !generating && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl mb-3">Let's generate your results.</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your coach will analyse every response, surface evidence and contradictions, then produce your Career DNA,
              career hypotheses, and a full report.
            </p>
            <Button onClick={generate} disabled={modules.length > 0} className="rounded-full h-12 px-8">
              Generate my Career DNA
            </Button>
          </div>
        )}

        {generating && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">{stage}</p>
            <p className="text-xs text-muted-foreground/60">This processes your full assessment — it may take a minute.</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {complete && (
          <div className="text-center py-12 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl mb-3">Your results are ready.</h1>
            <div className="flex flex-col gap-2 max-w-xs mx-auto mt-6">
              <Button onClick={() => navigate("/app/career-dna")} variant="default" className="rounded-full h-11">View Career DNA</Button>
              <Button onClick={() => navigate("/app/hypotheses")} variant="outline" className="rounded-full h-11">Career Hypotheses</Button>
              <Button onClick={() => navigate("/app/report")} variant="outline" className="rounded-full h-11">Final Report</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}