import React from "react";
import Layout, { NoReport, useReport, ResultNav } from "@/pages/CareerDna";
import { Loader2 } from "lucide-react";

export default function ActionPlan() {
  const { report, loading } = useReport();
  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Layout>;
  if (!report) return <Layout><NoReport /></Layout>;

  const plan = report.action_plan_30_day || [];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ResultNav active="action-plan" />
        <h1 className="font-heading text-3xl mb-2">30-Day Action Plan</h1>
        <p className="text-muted-foreground mb-8">Concrete steps for the next month — small enough to start now.</p>

        {plan.length === 0 && <p className="text-muted-foreground">No plan generated. Try regenerating from the Analysis page.</p>}

        <div className="space-y-3">
          {plan.map((p, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{p.title}</h3>
                  {p.description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.description}</p>}
                  {p.timing && <p className="text-xs text-muted-foreground mt-2">When: {p.timing}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {report.twelve_month_direction && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">12-Month Direction</h3>
            <p className="text-[15px] leading-relaxed">{report.twelve_month_direction}</p>
          </div>
        )}
      </div>
    </Layout>
  );
}