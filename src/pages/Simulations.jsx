import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SIMULATIONS } from "@/data/assessment";
import ModuleShell from "@/components/ModuleShell";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ChevronLeft, Pencil } from "lucide-react";

const ORDER = ["business", "interior", "sport", "digital"];

// Concrete micro-task for each wildcard domain, so the user knows what to actually do.
const WILDCARD_TASKS = {
  "sales": "A potential client is unsure about a product that costs AUD 1,200/year. Write the opening message you'd send to start the conversation, and the one question you'd ask first.",
  "real estate": "A young couple with a AUD 600k budget wants their first home but can't choose between a city apartment and a house further out. Draft how you'd help them decide in the first 20-minute call.",
  "event management": "You have 3 weeks and AUD 3,000 to organise a 60-person networking evening for under-25s in Brisbane. Outline the plan, the biggest risk, and how you'd handle it.",
  "project management": "A 3-person student team is 2 weeks behind on a 6-week app build. Write how you'd get them back on track this week.",
  "operations": "A small café is losing money on food waste. Describe what you'd measure this week and the first change you'd test.",
  "marketing": "Launch a 2-week campaign to get 100 Brisbane students to try a new study app with zero paid ads. Describe the idea and what you'd post first.",
  "data/analysis": "You get a spreadsheet of 500 customer orders. Tell me the first three questions you'd try to answer from it, and why each matters.",
  "hospitality": "A guest messages at 11pm upset that their room is noisy and they can't sleep. Write your reply and the next step you'd take with the hotel.",
  "content creation": "You have 1 week to grow a short-form video account about everyday fitness for 18–25s to its first real followers. Outline the content angle and your first three video ideas.",
  "product management": "Students complain an app is confusing. Describe how you'd decide what to fix first, and how you'd know the change worked.",
};

export default function Simulations() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState({}); // { type: result }
  const [response, setResponse] = useState("");
  const [followUps, setFollowUps] = useState({});
  const [enjoyment, setEnjoyment] = useState(5);
  const [repeat, setRepeat] = useState(5);
  const [saving, setSaving] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  // On mount, load saved simulations so a refresh/publish keeps finished steps
  // and resumes from the first unfinished one.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = await base44.entities.SimulationResult.list();
        const map = {};
        saved.forEach((r) => { if (r.simulation_type) map[r.simulation_type] = r; });
        if (!active) return;
        setResults(map);
        const startIdx = ORDER.findIndex((t) => !map[t]);
        if (startIdx === -1) {
          setAllDone(true);
          // ensure the simulations session is marked complete
          try {
            const session = (await base44.entities.AssessmentSession.filter({ module: "simulations" }))[0];
            if (session) {
              if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });
            } else {
              await base44.entities.AssessmentSession.create({ module: "simulations", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
            }
          } catch {}
        } else {
          setIdx(startIdx);
        }
      } catch {
        if (active) setIdx(0);
      } finally {
        if (active) setLoadingInit(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const simKey = ORDER[idx];
  const sim = SIMULATIONS[simKey];
  const wildcardDomain = React.useMemo(() => {
    if (simKey !== "wildcard") return "";
    const done = Object.values(results).map((r) => r.wildcard_domain);
    const remaining = SIMULATIONS.wildcard.wildcard_domains.filter((d) => !done.includes(d));
    return remaining[Math.floor(Math.random() * remaining.length)] || "marketing";
    // eslint-disable-next-line
  }, [simKey]);

  async function saveCurrent() {
    setSaving(true);
    try {
      let existing = (await base44.entities.SimulationResult.filter({ simulation_type: simKey }))[0];
      const payload = {
        simulation_type: simKey,
        wildcard_domain: simKey === "wildcard" ? wildcardDomain : "",
        response_text: response,
        enjoyment,
        repeat_willingness: repeat,
        follow_up_responses: followUps,
        evaluation: {},
      };
      let record;
      if (existing) record = await base44.entities.SimulationResult.update(existing.id, payload);
      else record = await base44.entities.SimulationResult.create(payload);

      const next = { ...results, [simKey]: record };
      setResults(next);

      // Evaluate in background (non-blocking) — never lose the answer if eval fails
      base44.functions.invoke("evaluateSimulation", {
        simulation_type: simKey,
        prompt: simKey === "wildcard" ? `${sim.prompt} Domain: ${wildcardDomain}.\n\n${WILDCARD_TASKS[wildcardDomain] || ""}` : sim.prompt,
        response_text: response,
        follow_up_responses: followUps,
      }).then((res) => {
        if (res?.data?.overall_simulation_performance != null) {
          base44.entities.SimulationResult.update(record.id, { evaluation: res.data });
        }
      }).catch(() => {});

      if (idx + 1 < ORDER.length) {
        setIdx(idx + 1);
        // Pre-fill the next step from whatever is already saved for it
        // (empty defaults if it's a fresh step) — never wipe earlier answers.
        applyResult(next[ORDER[idx + 1]]);
      } else {
        let session = (await base44.entities.AssessmentSession.filter({ module: "simulations" }))[0];
        if (!session) session = await base44.entities.AssessmentSession.create({ module: "simulations", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
        else if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });
        setAllDone(true);
      }
    } finally {
      setSaving(false);
    }
  }

  // Pre-fill the inputs from a saved SimulationResult so the user can edit
  // or leave answers as-is and move on — never type them from scratch.
  function applyResult(r) {
    setResponse(r?.response_text || "");
    setFollowUps(r?.follow_up_responses || {});
    setEnjoyment(r?.enjoyment ?? 5);
    setRepeat(r?.repeat_willingness ?? 5);
  }

  function loadStep(i) {
    setAllDone(false);
    setIdx(i);
    applyResult(results[ORDER[i]]);
  }

  if (loadingInit) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-3xl mb-3">All simulations complete.</h1>
        <p className="text-muted-foreground mb-8">Four mini-tasks done. Your responses (with enjoyment and willingness) are saved.</p>
        <div className="space-y-2 mb-6 text-left">
          {ORDER.map((t, i) => {
            const s = SIMULATIONS[t];
            return (
              <button key={t} type="button" onClick={() => { setAllDone(false); loadStep(i); }}
                className="w-full flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">{i + 1}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{s.label}</div>
                  <div className="text-sm text-muted-foreground">Saved — tap to review or edit</div>
                </div>
                <Pencil className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => navigate("/app")} variant="outline" className="rounded-full h-12 px-6">Back to dashboard</Button>
        </div>
      </div>
    );
  }

  const wildcardTask = simKey === "wildcard" ? (WILDCARD_TASKS[wildcardDomain] || "") : "";
  const fullPrompt = simKey === "wildcard"
    ? `${sim.prompt}\n\nYour domain: ${wildcardDomain}.\n\n${wildcardTask}`
    : sim.prompt;

  return (
    <ModuleShell
      title={sim.label}
      subtitle="Simulation — how do you perform, and how does it feel?"
      step={idx + 1}
      totalSteps={ORDER.length}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {ORDER.map((t, i) => (
            <button key={t} type="button" onClick={() => loadStep(i)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${i === idx ? "bg-primary text-primary-foreground" : results[t] ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {i + 1}
            </button>
          ))}
        </div>
        {idx > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => loadStep(idx - 1)} className="gap-1 px-2 text-muted-foreground">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-card border border-border p-6 whitespace-pre-line text-[15px] leading-relaxed">{fullPrompt}</div>
      {simKey === "wildcard" && (
        <div className="rounded-xl bg-accent/60 border border-accent p-4 text-sm text-accent-foreground leading-relaxed">
          <span className="font-medium">Why this task?</span> This simulation is deliberately placed in a field you haven't mentioned as an interest. We're not testing whether you already like it — we're checking for hidden strengths or unexpected enjoyment. Treat the scenario above as a real request, write what you'd actually do, then rate honestly how it felt. There are no wrong answers.
        </div>
      )}

      <div className="space-y-4 mt-5">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your response…"
          className="w-full min-h-[200px] rounded-xl border border-border bg-card p-4 text-[15px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {sim.follow_ups?.map((q, i) => (
          <div key={i}>
            <label className="text-sm font-medium block mb-1.5">{q}</label>
            <textarea
              value={followUps[i] || ""}
              onChange={(e) => setFollowUps({ ...followUps, [i]: e.target.value })}
              placeholder="Your answer…"
              className="w-full min-h-[80px] rounded-xl border border-border bg-muted/30 p-3 text-[15px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="text-sm font-medium block mb-2">How much did you enjoy this?</label>
            <input type="range" min={1} max={10} value={enjoyment} onChange={(e) => setEnjoyment(Number(e.target.value))} className="w-full accent-primary" />
            <p className="text-center text-sm text-primary font-medium tabular-nums mt-1">{enjoyment}/10</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="text-sm font-medium block mb-2">Would you do this again?</label>
            <input type="range" min={1} max={10} value={repeat} onChange={(e) => setRepeat(Number(e.target.value))} className="w-full accent-primary" />
            <p className="text-center text-sm text-primary font-medium tabular-nums mt-1">{repeat}/10</p>
          </div>
        </div>

        <Button onClick={saveCurrent} disabled={saving || !response.trim()} className="w-full h-12 rounded-full">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : idx + 1 < ORDER.length ? "Save & next simulation" : "Save & finish"}
        </Button>
      </div>
    </ModuleShell>
  );
}