import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";

const COUNTRIES = ["Poland", "Australia", "United Kingdom", "United States", "Germany", "Ireland", "Netherlands", "Canada", "Other"];
const STAGES = [
  { value: "high_school", label: "High school" },
  { value: "gap_year", label: "Gap year / before studies" },
  { value: "vocational", label: "Vocational school" },
  { value: "university", label: "University (current or started)" },
  { value: "working", label: "Working" },
  { value: "other", label: "Other" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ first_name: "", age: "", education_stage: "gap_year", current_country: "Poland", target_country: "Australia", preferred_language: "en" });
  const [saving, setSaving] = useState(false);

  const steps = ["identity", "stage", "location", "review"];

  function next() { setStep((s) => Math.min(s + 1, steps.length - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  async function finish() {
    setSaving(true);
    try {
      const existing = await base44.entities.Profile.filter({}).then((r) => r[0]);
      const payload = { ...form, age: Number(form.age), onboarding_complete: true };
      if (existing) {
        await base44.entities.Profile.update(existing.id, payload);
      } else {
        await base44.entities.Profile.create(payload);
      }
      navigate("/app");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h1 className="font-heading text-3xl mb-2">Let's begin.</h1>
            <p className="text-muted-foreground">A few details — nothing that anchors your direction yet.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Your first name</label>
              <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 h-12 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="First name" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Your age</label>
              <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 h-12 focus:outline-none focus:ring-2 focus:ring-ring" placeholder="e.g. 18" />
            </div>
          </div>
          <Button onClick={next} disabled={!form.first_name || !form.age} className="w-full h-12 rounded-full">
            Continue <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h1 className="font-heading text-3xl mb-2">Where are you now?</h1>
            <p className="text-muted-foreground">Your current education stage.</p>
          </div>
          <div className="grid gap-2">
            {STAGES.map((s) => (
              <button key={s.value} onClick={() => setForm({ ...form, education_stage: s.value })}
                className={`text-left rounded-xl border px-4 py-3.5 transition-colors ${form.education_stage === s.value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={back} className="h-12">Back</Button>
            <Button onClick={next} className="flex-1 h-12 rounded-full">Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h1 className="font-heading text-3xl mb-2">Location.</h1>
            <p className="text-muted-foreground">Where you are now, and where you think you'll live or study.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Current country</label>
              <select value={form.current_country} onChange={(e) => setForm({ ...form, current_country: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 h-12 focus:outline-none focus:ring-2 focus:ring-ring">
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Likely study / living country</label>
              <select value={form.target_country} onChange={(e) => setForm({ ...form, target_country: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 h-12 focus:outline-none focus:ring-2 focus:ring-ring">
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Preferred language</label>
              <select value={form.preferred_language} onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                className="w-full rounded-xl border border-border bg-card px-4 h-12 focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="en">English</option>
                <option value="pl">Polish</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={back} className="h-12">Back</Button>
            <Button onClick={next} className="flex-1 h-12 rounded-full">Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h1 className="font-heading text-3xl mb-2">Before we start.</h1>
            <p className="text-muted-foreground">Everything you share is private by default. No parent, teacher, or advisor sees anything unless you choose to share later.</p>
          </div>
          <Card className="bg-card border-border">
            <CardContent className="p-5 space-y-3 text-sm">
              <div className="flex gap-2.5"><Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" /><p className="text-muted-foreground">Your responses stay yours. Raw answers are never overwritten — even when you refine a reflection.</p></div>
              <div className="flex gap-2.5"><Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" /><p className="text-muted-foreground">This works like coaching, not a test. There are no right answers.</p></div>
              <div className="flex gap-2.5"><Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" /><p className="text-muted-foreground">You can pause anytime and resume exactly where you left off.</p></div>
            </CardContent>
          </Card>
          <Button onClick={finish} disabled={saving} className="w-full h-12 rounded-full">
            {saving ? "Saving…" : "Start coaching"} <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}
    </div>
  );
}