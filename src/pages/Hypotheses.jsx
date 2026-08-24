import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Layout, { NoReport } from "@/pages/CareerDna";
import { ResultNav } from "./CareerDna";
import { Loader2 } from "lucide-react";
import { fitCategory } from "@/lib/scoring";

export default function Hypotheses() {
  const [hyps, setHyps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await base44.entities.Report.filter({});
        setHasReport(!!r[0]);
        const h = await base44.entities.CareerHypothesis.list("-fit_score");
        setHyps(h);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Layout>;
  if (!hasReport) return <Layout><NoReport /></Layout>;

  const strongest = hyps.filter((h) => h.hypothesis_type === "strongest");
  const wildcards = hyps.filter((h) => h.hypothesis_type === "wildcard");
  const weak = hyps.filter((h) => h.hypothesis_type === "weak_current_fit");

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ResultNav active="hypotheses" />
        <h1 className="font-heading text-3xl mb-2">Career Hypotheses</h1>
        <p className="text-muted-foreground mb-8">Honest directions with explicit uncertainty — not a verdict.</p>

        <Section title="Top fit directions" items={strongest} accent />
        <Section title="Wildcards — non-obvious directions" items={wildcards} />
        {weak.length > 0 && <Section title="Currently weak fit" items={weak} muted />}

        {hyps.length === 0 && <p className="text-muted-foreground">No hypotheses found. Try regenerating from the Analysis page.</p>}
      </div>
    </Layout>
  );
}

function Section({ title, items, accent, muted }) {
  if (!items?.length) return null;
  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{title}</h2>
      <div className="space-y-3">
        {items.map((h, i) => <HypothesisCard key={h.id || i} h={h} accent={accent} muted={muted} />)}
      </div>
    </div>
  );
}

function HypothesisCard({ h, accent, muted }) {
  const cat = fitCategory(h.fit_score || 0);
  return (
    <div className={`rounded-2xl border bg-card p-5 ${accent ? "border-primary/30" : muted ? "border-border opacity-80" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-heading text-xl">{h.career_family}</h3>
          {h.example_roles?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{h.example_roles.join(" · ")}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-1 ${accent ? "bg-primary/10 text-primary" : muted ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"}`}>{cat}</span>
          <p className="text-2xl font-heading tabular-nums">{Math.round(h.fit_score || 0)}</p>
          <p className="text-xs text-muted-foreground">fit · {Math.round(h.confidence_score || 0)}% conf</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
        <Bar label="Interest" v={h.interest_fit} />
        <Bar label="Strengths" v={h.strength_fit} />
        <Bar label="Work style" v={h.work_style_fit} />
        <Bar label="Values" v={h.values_fit} />
        <Bar label="Simulation" v={h.simulation_fit} />
        <Bar label="Lifestyle" v={h.lifestyle_fit} />
      </div>

      {h.supporting_evidence?.length > 0 && <Block title="Supporting" items={h.supporting_evidence} />}
      {h.contradictory_evidence?.length > 0 && <Block title="Contradictory" items={h.contradictory_evidence} />}
      {h.unknowns?.length > 0 && <Block title="Unknowns" items={h.unknowns} />}

      {h.reality_check && <p className="text-sm text-muted-foreground mt-3 italic">{h.reality_check}</p>}
      {h.suggested_experiment && (
        <div className="mt-3 rounded-xl bg-primary/5 border border-primary/20 p-3">
          <p className="text-xs font-medium text-primary mb-0.5">Suggested experiment</p>
          <p className="text-sm">{h.suggested_experiment}</p>
        </div>
      )}
      {h.education_implication && (
        <div className="mt-2 rounded-xl bg-muted/40 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Education implication</p>
          <p className="text-sm">{h.education_implication}</p>
        </div>
      )}
    </div>
  );
}

function Bar({ label, v }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground tabular-nums">{Math.round(v || 0)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary/70" style={{ width: `${v || 0}%` }} />
      </div>
    </div>
  );
}
function Block({ title, items }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
      <ul className="space-y-1">
        {items.map((it, i) => <li key={i} className="text-sm text-foreground/90 flex gap-2"><span className="text-muted-foreground">·</span>{it}</li>)}
      </ul>
    </div>
  );
}