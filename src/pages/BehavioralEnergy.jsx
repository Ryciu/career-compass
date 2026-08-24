import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ENERGY_ITEMS, ENERGY_MODES } from "@/data/energyProfile";
import { scoreEnergy } from "@/lib/energyScoring";
import ModuleShell from "@/components/ModuleShell";
import { Button } from "@/components/ui/button";
import { afterModule } from "@/lib/sessionRun";
import { Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL = ENERGY_ITEMS.length;

export default function BehavioralEnergy() {
  const navigate = useNavigate();
  const items = useMemo(() => ENERGY_ITEMS, []);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const existing = (await base44.entities.AssessmentScore.filter({ module: "behavioral_energy" }))[0];
        if (active && existing?.raw_data?.answers) {
          setAnswers(existing.raw_data.answers || {});
          const firstUnanswered = items.findIndex((o) => !existing.raw_data.answers[o.id]);
          setIdx(firstUnanswered === -1 ? 0 : firstUnanswered);
        }
      } catch {} finally {
        if (active) setLoadingInit(false);
      }
    })();
    return () => { active = false; };
  }, [items]);

  const current = items[idx];
  const modeMeta = current ? ENERGY_MODES[current.mode] : null;
  const prevMode = idx > 0 ? items[idx - 1].mode : null;
  const showTransition = current && prevMode !== current.mode;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === TOTAL;

  async function complete() {
    setSaving(true);
    try {
      const result = scoreEnergy(answers);
      let session = (await base44.entities.AssessmentSession.filter({ module: "behavioral_energy" }))[0];
      if (!session) session = await base44.entities.AssessmentSession.create({ module: "behavioral_energy", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      else if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });

      const payload = { module: "behavioral_energy", scores: result, raw_data: { answers }, session_id: session.id };
      let existing = (await base44.entities.AssessmentScore.filter({ module: "behavioral_energy" }))[0];
      if (existing) await base44.entities.AssessmentScore.update(existing.id, payload);
      else await base44.entities.AssessmentScore.create(payload);
      setDone(true);
    } finally {
      setSaving(false);
    }
  }

  if (loadingInit) {
    return (
      <ModuleShell title="Behavioral Energy Profile" subtitle="How you operate, naturally and under pressure." step={13} totalSteps={13}>
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </ModuleShell>
    );
  }

  if (done) {
    return (
      <ModuleShell title="Behavioral Energy Profile" subtitle="Your responses are saved" step={13} totalSteps={13}>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto">
            Completed. Your natural and adapted patterns will be combined with the rest of your Career Compass evidence.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            This is an exploratory Career Compass framework. It is not a clinical, diagnostic, certified, or scientifically definitive psychometric test.
          </p>
          <Button onClick={() => afterModule(navigate)} className="rounded-full h-11 px-6 mt-6">Back to dashboard</Button>
        </div>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title="Behavioral Energy Profile" subtitle="Quick choices about how you tend to act. Some questions ask about normal situations, some about pressured situations where it really counts." step={13} totalSteps={13}>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Choice {idx + 1} of {TOTAL}</span>
        <span>{answeredCount}/{TOTAL} answered</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden mb-5">
        <div className="h-full bg-primary transition-all" style={{ width: `${(answeredCount / TOTAL) * 100}%` }} />
      </div>

      {showTransition && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 mb-4 animate-in fade-in">
          <p className="text-xs uppercase tracking-widest text-primary font-medium mb-1">{modeMeta.label}</p>
          <p className="text-[14px] text-foreground/80 leading-relaxed">{modeMeta.context}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {["a", "b"].map((side) => {
          const opt = current[side];
          const origKey = side.toUpperCase();
          const selected = answers[current.id] === origKey;
          return (
            <button
              key={side}
              onClick={() => setAnswers({ ...answers, [current.id]: origKey })}
              className={`rounded-2xl border p-5 text-left min-h-[110px] transition-all ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/40"}`}
            >
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{origKey}</span>
              <p className="text-[15px] leading-relaxed mt-1.5">{opt.text}</p>
            </button>
          );
        })}
      </div>

      {!showTransition && (
        <p className="text-xs text-muted-foreground/70 mt-4">{modeMeta.label} · {modeMeta.context}</p>
      )}

      <div className="flex gap-2 mt-5">
        <Button variant="ghost" onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="h-11 px-4">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        {idx + 1 < TOTAL ? (
          <Button onClick={() => setIdx(idx + 1)} disabled={!answers[current.id]} className="flex-1 h-11 rounded-full">
            {answers[current.id] ? "Next" : "Choose one"} <ChevronRight className="w-4 h-4" />
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