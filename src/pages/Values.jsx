import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { VALUES_CARDS } from "@/data/assessment";
import ModuleShell from "@/components/ModuleShell";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export default function Values() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1); // 1: top6, 2: top3, 3: why, 4: done
  const [selected6, setSelected6] = useState([]);
  const [selected3, setSelected3] = useState([]);
  const [reflections, setReflections] = useState({});
  const [saving, setSaving] = useState(false);

  function toggle(arr, setter, card, limit) {
    if (arr.includes(card)) setter(arr.filter((c) => c !== card));
    else if (arr.length < limit) setter([...arr, card]);
  }

  async function complete() {
    setSaving(true);
    try {
      let session = (await base44.entities.AssessmentSession.filter({ module: "values" }))[0];
      if (!session) session = await base44.entities.AssessmentSession.create({ module: "values", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      else if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });
      const payload = {
        module: "values",
        scores: { top_values: selected3 },
        raw_data: { top6: selected6, top3: selected3, reflections },
        session_id: session.id,
      };
      let existing = (await base44.entities.AssessmentScore.filter({ module: "values" }))[0];
      if (existing) await base44.entities.AssessmentScore.update(existing.id, payload);
      else await base44.entities.AssessmentScore.create(payload);
      navigate("/app");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModuleShell title="Values" subtitle="What outcomes genuinely matter to you?" step={8} totalSteps={9}>
      {phase === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Choose your top 6 values — the ones that matter most to you.</p>
          <div className="grid grid-cols-2 gap-2.5">
            {VALUES_CARDS.map((card) => (
              <button
                key={card}
                onClick={() => toggle(selected6, setSelected6, card, 6)}
                className={`rounded-xl border p-4 text-left h-full transition-all ${selected6.includes(card) ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/40"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{card}</span>
                  {selected6.includes(card) && <Check className="w-4 h-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
          <Button onClick={() => setPhase(2)} disabled={selected6.length < 6} className="w-full h-12 rounded-full">
            {selected6.length < 6 ? `Select ${6 - selected6.length} more` : "Continue to top 3"}
          </Button>
        </div>
      )}

      {phase === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">Now narrow to your top 3 — the values that matter above all others.</p>
          <div className="grid grid-cols-2 gap-2.5">
            {selected6.map((card) => (
              <button
                key={card}
                onClick={() => toggle(selected3, setSelected3, card, 3)}
                className={`rounded-xl border p-4 text-left transition-all ${selected3.includes(card) ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/40"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{card}</span>
                  {selected3.includes(card) && <Check className="w-4 h-4 text-primary" />}
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => { setPhase(1); setSelected3([]); }} className="h-12">Back</Button>
            <Button onClick={() => setPhase(3)} disabled={selected3.length < 3} className="flex-1 h-12 rounded-full">
              {selected3.length < 3 ? `Select ${3 - selected3.length} more` : "Continue"}
            </Button>
          </div>
        </div>
      )}

      {phase === 3 && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">For each of your top 3: why is this value important to you?</p>
          {selected3.map((card) => (
            <div key={card}>
              <label className="font-medium block mb-2">{card}</label>
              <textarea
                value={reflections[card] || ""}
                onChange={(e) => setReflections({ ...reflections, [card]: e.target.value })}
                placeholder={`Why does ${card} matter to you?`}
                className="w-full min-h-[100px] rounded-xl border border-border bg-card p-4 text-[15px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setPhase(2)} className="h-12">Back</Button>
            <Button onClick={complete} disabled={saving || selected3.some((c) => !(reflections[c] || "").trim())} className="flex-1 h-12 rounded-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete values"}
            </Button>
          </div>
        </div>
      )}
    </ModuleShell>
  );
}