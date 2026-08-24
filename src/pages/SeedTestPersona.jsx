import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Sparkles, AlertCircle } from "lucide-react";

export default function SeedTestPersona() {
  const navigate = useNavigate();
  const [state, setState] = useState("idle"); // idle | loading | ok | error
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  async function run() {
    setState("loading");
    setError("");
    setSummary(null);
    try {
      const res = await base44.functions.invoke("seedTestPersona", {});
      const data = res?.data || {};
      if (data?.error) throw new Error(data.error);
      setSummary(data);
      setState("ok");
    } catch (err) {
      setError(err?.message || "Seeding failed.");
      setState("error");
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-8">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h1 className="font-heading text-3xl mb-3">Load test persona</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          This loads a complete fictional assessment record (profile, all modules,
          inventories, simulations) onto your account and marks every module complete.
          You can then open <span className="text-foreground font-medium">Analysis</span> and
          generate Career DNA, hypotheses and the final report as if you had completed it yourself.
        </p>

        {state === "idle" && (
          <Button onClick={run} className="rounded-full h-12 px-8">Load test persona</Button>
        )}

        {state === "loading" && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Seeding your assessment data…
          </div>
        )}

        {state === "ok" && summary && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-medium">Assessment data loaded.</span>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 text-sm space-y-2">
              {summary.riasecScores && (
                <div>
                  <span className="text-muted-foreground">RIASEC:</span>{" "}
                  <span className="font-medium">{Object.entries(summary.riasecScores).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ")}</span>
                </div>
              )}
              {summary.values && (
                <div>
                  <span className="text-muted-foreground">Top values:</span>{" "}
                  <span className="font-medium">{summary.values.join(", ")}</span>
                </div>
              )}
              {summary.driversRanked && (
                <div>
                  <span className="text-muted-foreground">Top drivers:</span>{" "}
                  <span className="font-medium">{summary.driversRanked.map((d) => `${d.driver} ${d.score}`).join(" · ")}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 max-w-xs">
              <Button onClick={() => navigate("/app/analysis")} className="rounded-full h-11">Generate my results</Button>
              <Button variant="outline" onClick={() => navigate("/app")} className="rounded-full h-11">Back to dashboard</Button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              <p className="font-medium mb-1">Seeding failed.</p>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}