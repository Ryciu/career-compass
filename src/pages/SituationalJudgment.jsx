import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SJT_SCENARIOS } from "@/data/structuredAssessments";
import { scoreSjt } from "@/lib/structuredScoring";
import { shuffle as shuffleArr } from "@/lib/scoring";
import ModuleShell from "@/components/ModuleShell";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL = SJT_SCENARIOS.length;

export default function SituationalJudgment() {
  const navigate = useNavigate();
  const order = useMemo(
    () => SJT_SCENARIOS.map((sc) => ({ sc, options: shuffleArr(sc.options) })),
    []
  );
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const existing = (await base44.entities.AssessmentScore.filter({ module: "sjt" }))[0];
        if (active && existing?.raw_data) {
          setAnswers(existing.raw_data.answers || {});
          const firstUnanswered = order.findIndex((o) => !(existing.raw_data.answers || {})[o.sc.id]);
          setIdx(firstUnanswered === -1 ? 0 : firstUnanswered);
        }
      } catch {} finally {
        if (active) setLoadingInit(false);
      }
    })();
    return () => { active = false; };
  }, [order]);

  const current = order[idx];
  const chosen = answers[current.sc.id];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === TOTAL;

  async function complete() {
    setSaving(true);
    try {
      const { dimension_scores, raw, touched } = scoreSjt(answers);
      let session = (await base44.entities.AssessmentSession.filter({ module: "sjt" }))[0];
      if (!session) session = await base44.entities.AssessmentSession.create({ module: "sjt", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      else if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });

      const payload = { module: "sjt", scores: dimension_scores, raw_data: { answers, raw, touched }, session_id: session.id };
      let existing = (await base44.entities.AssessmentScore.filter({ module: "sjt" }))[0];
      if (existing) await base44.entities.AssessmentScore.update(existing.id, payload);
      else await base44.entities.AssessmentScore.create(payload);
      setDone(true);
    } finally {
      setSaving(false);
    }
  }

  if (loadingInit) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (done) {
    return (
      <ModuleShell title="How You Act in Real Situations" subtitle="Your responses are saved" step={10} totalSteps={11}>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto">
            Completed. Your answers will be combined with the rest of your Career Compass evidence.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            This is an exploratory career tool. It is not a clinical, diagnostic, certified, or scientifically definitive psychometric test.
          </p>
          <Button onClick={() => navigate("/app")} className="rounded-full h-11 px-6 mt-6">Back to dashboard</Button>
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title="How You Act in Real Situations" subtitle="Imagine yourself in each situation and choose the response closest to what you would genuinely do. There are no perfect answers — we're looking for natural patterns." step={10} totalSteps={11}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Scenario {idx + 1} of {TOTAL}</span>
        <span>{answeredCount}/{TOTAL} answered</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden mb-5">
        <div className="h-full bg-primary transition-all" style={{ width: `${(answeredCount / TOTAL) * 100}%` }} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[15px] leading-relaxed">{current.sc.text}</p>
      </div>

      <div className="space-y-2.5 mt-4">
        {current.options.map((opt) => {
          const selected = chosen === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setAnswers({ ...answers, [current.sc.id]: opt.key })}
              className={`w-full text-left rounded-xl border p-4 text-[15px] leading-relaxed transition-all ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/40"}`}
            >
              <span className="font-medium text-muted-foreground mr-1.5">{opt.key}.</span>
              {opt.text}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mt-5">
        <Button variant="ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="h-11 px-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {idx + 1 < TOTAL ? (
          <Button onClick={() => setIdx(idx + 1)} disabled={!chosen} className="flex-1 h-11 rounded-full">
            {chosen ? "Next scenario" : "Choose an answer"} <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={complete} disabled={!allAnswered || saving} className="flex-1 h-11 rounded-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete"}
          </Button>
        )}
      </div>
    </ModuleShell>
  );
}