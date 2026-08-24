import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { RIASEC_ITEMS, RIASEC_LABELS } from "@/data/assessment";
import { scoreRiasec, shuffle } from "@/lib/scoring";
import ModuleShell from "@/components/ModuleShell";
import { Button, buttonVariants } from "@/components/ui/button";
import { afterModule } from "@/lib/sessionRun";
import { Loader2, Check } from "lucide-react";

const SCALE = [
  { v: 1, label: "Strongly disagree" },
  { v: 2, label: "Disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Agree" },
  { v: 5, label: "Strongly agree" },
];

export default function RIasec() {
  const navigate = useNavigate();
  const items = useMemo(() => shuffle(RIASEC_ITEMS), []);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState(null);
  const answeredCount = Object.keys(answers).length;

  async function complete() {
    setSaving(true);
    try {
      const scores = scoreRiasec(answers);
      let session = (await base44.entities.AssessmentSession.filter({ module: "riasec" }))[0];
      if (!session) session = await base44.entities.AssessmentSession.create({ module: "riasec", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      else if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });

      let existingScore = (await base44.entities.AssessmentScore.filter({ module: "riasec" }))[0];
      const payload = { module: "riasec", scores, raw_data: answers, session_id: session.id };
      if (existingScore) await base44.entities.AssessmentScore.update(existingScore.id, payload);
      else await base44.entities.AssessmentScore.create(payload);

      setResults(scores);
    } finally {
      setSaving(false);
    }
  }

  if (results) {
    const sorted = Object.entries(results).sort((a, b) => b[1] - a[1]);
    return (
      <ModuleShell title="Career Interest Inventory" subtitle="Your exploratory interest profile" step={6} totalSteps={9}>
        <div className="space-y-3">
          {sorted.map(([code, score]) => (
            <div key={code} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{RIASEC_LABELS[code]}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">This is an exploratory inventory, not a certified psychological test.</p>
        <Button className="w-full h-12 rounded-full mt-6" onClick={() => afterModule(navigate)}>Back to dashboard</Button>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title="Career Interest Inventory" subtitle="Rate each statement from 1 (strongly disagree) to 5 (strongly agree). Order is randomized." step={6} totalSteps={9}>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-[15px] mb-3">{idx + 1}. {item.text}</p>
            <div className="grid grid-cols-5 gap-1.5">
              {SCALE.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setAnswers({ ...answers, [item.id]: s.v })}
                  className={`py-2 rounded-lg text-sm transition-colors ${answers[item.id] === s.v ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"}`}
                  title={s.label}
                >
                  {s.v}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {answers[item.id] ? SCALE[answers[item.id] - 1].label : "Tap a number"}
            </p>
          </div>
        ))}
      </div>
      <Button onClick={complete} disabled={answeredCount < items.length || saving} className="w-full h-12 rounded-full mt-6">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : answeredCount < items.length ? `${answeredCount}/${items.length} answered` : "Complete inventory"}
      </Button>
    </ModuleShell>
  );
}