import React from "react";
import Layout, { NoReport, useReport, ResultNav } from "@/pages/CareerDna";
import { Loader2, Beaker } from "lucide-react";

export default function Experiments() {
  const { report, loading } = useReport();
  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Layout>;
  if (!report) return <Layout><NoReport /></Layout>;

  const experiments = report.experiments || [];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ResultNav active="experiments" />
        <h1 className="font-heading text-3xl mb-2">Experiments</h1>
        <p className="text-muted-foreground mb-8">Inexpensive real-world tests to reduce uncertainty before committing to education.</p>

        {experiments.length === 0 && <p className="text-muted-foreground">No experiments were generated. Try regenerating from the Analysis page.</p>}

        <div className="space-y-3">
          {experiments.map((exp, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Beaker className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1">
                  {exp.domain && <span className="text-xs text-muted-foreground uppercase tracking-wide">{exp.domain}</span>}
                  <h3 className="font-medium">{exp.title}</h3>
                  {exp.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{exp.description}</p>}
                  {exp.success_indicator && (
                    <div className="mt-3 rounded-lg bg-primary/5 border border-primary/20 p-2.5">
                      <p className="text-xs font-medium text-primary mb-0.5">Success indicator</p>
                      <p className="text-sm">{exp.success_indicator}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}