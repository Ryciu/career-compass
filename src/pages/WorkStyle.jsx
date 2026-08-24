import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { WORK_STYLE_PAIRS } from "@/data/assessment";
import ModuleShell from "@/components/ModuleShell";
import { Button } from "@/components/ui/button";
import { afterModule } from "@/lib/sessionRun";
import { Loader2 } from "lucide-react";

export default function WorkStyle() {
  const navigate = useNavigate();
  const [values, setValues] = useState(() => Object.fromEntries(WORK_STYLE_PAIRS.map((p) => [p.id, 4])));
  const [saving, setSaving] = useState(false);

  async function complete() {
    setSaving(true);
    try {
      let session = (await base44.entities.AssessmentSession.filter({ module: "work_style" }))[0];
      if (!session) session = await base44.entities.AssessmentSession.create({ module: "work_style", status: "complete", started_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      else if (session.status !== "complete") await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });
      const payload = { module: "work_style", scores: { midpoint: 4 }, raw_data: values, session_id: session.id };
      let existing = (await base44.entities.AssessmentScore.filter({ module: "work_style" }))[0];
      if (existing) await base44.entities.AssessmentScore.update(existing.id, payload);
      else await base44.entities.AssessmentScore.create(payload);
      afterModule(navigate);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModuleShell title="Work Style" subtitle="Drag each slider toward your preference. 1 = strong left, 7 = strong right." step={7} totalSteps={9}>
      <div className="space-y-5">
        {WORK_STYLE_PAIRS.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex justify-between items-center mb-3 text-sm">
              <span className="text-muted-foreground">{p.left}</span>
              <span className="text-muted-foreground">{p.right}</span>
            </div>
            <input
              type="range" min={1} max={7} step={1}
              value={values[p.id]}
              onChange={(e) => setValues({ ...values, [p.id]: Number(e.target.value) })}
              className="w-full accent-primary"
            />
            <div className="text-center mt-1.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-medium tabular-nums">{values[p.id]}</span>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={complete} disabled={saving} className="w-full h-12 rounded-full mt-6">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Complete"}
      </Button>
    </ModuleShell>
  );
}