import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { STRENGTH_ITEMS } from "@/data/strengths";
import { scoreStrengths } from "@/lib/strengthScoring";
import ModuleShell from "@/components/ModuleShell";
import { Button } from "@/components/ui/button";
import { Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL = STRENGTH_ITEMS.length;

export default function NaturalStrengths() {
  const navigate = useNavigate();
  const items = useMemo(
    () => STRENGTH_ITEMS.map((it) => {
      const flip = Math.random() < 0.5;
      const left = flip ? it.b : it.a;
      const right = flip ? it.a : it.b;
      return { it, left, right, flip };
    }),
    []
  );
  const [choices, setChoices] = useState({});
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const existing = (await base44.entities.AssessmentScore.filter({ module: "natural_strengths" }))[0];
        if (active && existing?.raw_data?.choices) {
          setChoices(existing.raw_data.choices);
          const firstUnanswered = items.findIndex((o) => !existing.raw_data.choices[o.it.id]);
          setIdx(firstUnanswered === -1 ? 0 : firstUnanswered);
        }
      } catch {} finally {
        if (active) setLoadingInit(false);
      }
    })();
    return () => { active = false; };
  }, [items]);

  const current = items[idx];
  const answeredCount = Object.keys(choices).length;
  const allAnswered = answeredCount === TOTAL;

  async function complete() {
    setSaving(true);
    try {
      const result = scoreStrengths(choices);
      let session = (await base44.entities.AssessmentSession.filter({ module: "natural_strengths" }))[0];
      if (!session) session = await base44.entities.AssessmentSession.create({ module: "natural_strengths", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      else if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });

      const payload = { module: "natural_strengths", scores: { normalized: result.normalized, top5: result.top5, supporting: result.supporting }, raw_data: { choices, raw: result.raw, presented: result.presented, ranked: result.ranked }, session_id: session.id };
      let existing = (await base44.entities.AssessmentScore.filter({ module: "natural_strengths" }))[0];
      if (existing) await base44.entities.AssessmentScore.update(existing.id, payload);
      else await base44.entities.AssessmentScore.create(payload);
      setDone(true);
    } finally {
      setSaving(false);
    }
  }

  if (loadingInit) {
    return (
      <ModuleShell title="Natural Strength Patterns" subtitle="Which ways of working come most naturally to you." step={12} totalSteps={13}>
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </ModuleShell>
    );
  }

  if (done) {
    return (
      <ModuleShell title="Natural Strength Patterns" subtitle="Your responses are saved" step={12} totalSteps={13}>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto">
            Completed. Your natural patterns will be combined with the rest of your Career Compass evidence.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            This is an exploratory Career Compass framework. It is not a clinical, diagnostic, certified, or scientifically definitive psychometric test.
          </p>
          <Button onClick={() => navigate("/app")} className="rounded-full h-11 px-6 mt-6">Back to dashboard</Button>
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title="Natural Strength Patterns" subtitle="Pick the statement that more often reflects how you naturally operate. Don't choose the one that sounds more impressive — choose the one that's more genuinely you. There's no Both or Neither." step={12} totalSteps={13}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Pair {idx + 1} of {TOTAL}</span>
        <span>{answeredCount}/{TOTAL} answered</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden mb-5">
        <div className="h-full bg-primary transition-all" style={{ width: `${(answeredCount / TOTAL) * 100}%` }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {["left", "right"].map((side) => {
          const opt = current[side];
          const origKey = opt === current.it.a ? "A" : "B";
          const selected = choices[current.it.id] === origKey;
          return (
            <button
              key={side}
              onClick={() => setChoices({ ...choices, [current.it.id]: origKey })}
              className={`rounded-2xl border p-5 text-left min-h-[120px] transition-all ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/40"}`}
            >
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{origKey}</span>
              <p className="text-[15px] leading-relaxed mt-1.5">{opt.text}</p>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 mt-5">
        <Button variant="ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="h-11 px-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {idx + 1 < TOTAL ? (
          <Button onClick={() => setIdx(idx + 1)} disabled={!choices[current.it.id]} className="flex-1 h-11 rounded-full">
            {choices[current.it.id] ? "Next pair" : "Choose one"} <ChevronRight className="w-4 h-4" />
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