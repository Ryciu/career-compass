import React from "react";
import Layout, { NoReport, useReport, ResultNav } from "@/pages/CareerDna";
import { Loader2 } from "lucide-react";

const DIRECTION_LABELS = {
  university_degree: "University degree",
  vocational_vet: "Vocational / VET training",
  professional_certification: "Professional certification",
  portfolio_based: "Portfolio-based path",
  work_experience: "Work experience",
  apprenticeship: "Apprenticeship",
  entrepreneurial_experiment: "Entrepreneurial experiment",
  unclear_explore_first: "Unclear — explore first",
};

export default function Education() {
  const { report, loading } = useReport();
  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Layout>;
  if (!report) return <Layout><NoReport /></Layout>;

  const dir = report.education_direction || {};
  const type = DIRECTION_LABELS[dir.type] || "Unclear — explore first";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ResultNav active="education" />
        <h1 className="font-heading text-3xl mb-2">Education Direction</h1>
        <p className="text-muted-foreground mb-8">What type of education the evidence suggests — separate from the career decision.</p>

        <div className="rounded-2xl border border-border bg-card p-6 mb-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Suggested type</p>
          <h2 className="font-heading text-2xl text-primary mb-3">{type}</h2>
          {dir.implication && <p className="text-[15px] leading-relaxed text-muted-foreground">{dir.implication}</p>}
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <h3 className="font-medium mb-1.5">Remember</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A career decision and an education decision are separate. The evidence here suggests a starting point —
            not a verdict. University is never automatically the best path, and nothing here is a recommendation to commit
            to expensive education before testing it with a real experiment.
          </p>
        </div>
      </div>
    </Layout>
  );
}