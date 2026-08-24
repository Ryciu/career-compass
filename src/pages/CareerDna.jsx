import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Loader2, ChevronRight } from "lucide-react";
import { RESULT_ROUTES } from "@/data/modules";

export function useReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    (async () => {
      try {
        const r = await base44.entities.Report.filter({});
        setReport(r[0] || null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return { report, loading };
}

export function ResultNav({ active }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-5 px-5 mb-6 scrollbar-hide">
      {RESULT_ROUTES.map((r) => (
        <Link
          key={r.id}
          to={r.route}
          className={`whitespace-nowrap text-sm rounded-full px-4 py-2 border transition-colors ${active === r.id ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}

export default function CareerDna() {
  const { report, loading } = useReport();
  const dna = report?.career_dna || {};

  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Layout>;

  if (!report || !dna.dominant_interest_pattern) {
    return <Layout><NoReport /></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ResultNav active="career-dna" />
        <h1 className="font-heading text-3xl mb-2">Your Career DNA</h1>
        <p className="text-muted-foreground mb-8">A grounded summary — every claim is traceable to your evidence.</p>

        <div className="space-y-5">
          <Card title="Dominant interest pattern">
            <p className="text-[15px] leading-relaxed">{dna.dominant_interest_pattern}</p>
          </Card>

          {dna.demonstrated_strengths?.length > 0 && (
            <Card title="Demonstrated strengths">
              <List items={dna.demonstrated_strengths} />
            </Card>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <Card title="Energy sources"><List items={dna.energy_sources || []} positive /></Card>
            <Card title="Energy drains"><List items={dna.energy_drains || []} /></Card>
          </div>

          <Card title="Preferred environment"><p className="text-[15px]">{dna.preferred_environment}</p></Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Mini label="Autonomy need" value={dna.autonomy_need} />
            <Mini label="Competition orientation" value={dna.competition_orientation} />
            <Mini label="Social intensity" value={dna.social_intensity} />
            <Mini label="Risk tolerance" value={dna.risk_tolerance} />
            <Mini label="Progress motivation" value={dna.progress_motivation} />
            <Mini label="Physical/activity preference" value={dna.physical_activity_preference} />
            <Mini label="Creativity orientation" value={dna.creativity_orientation} />
            <Mini label="Leadership preference" value={dna.leadership_preference} />
          </div>

          {dna.primary_values?.length > 0 && (
            <Card title="Primary values"><List items={dna.primary_values} /></Card>
          )}

          {dna.potential_blind_spots?.length > 0 && (
            <Card title="Potential blind spots"><List items={dna.potential_blind_spots} /></Card>
          )}

          {dna.motivational_drivers?.length > 0 && (
            <Card title="Motivational drivers">
              <div className="space-y-3">
                {dna.motivational_drivers.map((d, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{d.driver}</span>
                      {d.score_category && <span className="text-xs text-primary">{d.score_category}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.interpretation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {dna.behavioral_tendencies?.length > 0 && (
            <Card title="How you tend to respond in real situations"><List items={dna.behavioral_tendencies} /></Card>
          )}

          {dna.cross_validation_notes?.length > 0 && (
            <Card title="Where the tests disagree"><List items={dna.cross_validation_notes} /></Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Mini({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}
function List({ items, positive }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="text-[15px] flex gap-2">
          <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${positive ? "bg-primary" : "bg-muted-foreground/50"}`} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function NoReport() {
  return (
    <div className="text-center py-12">
      <h1 className="font-heading text-2xl mb-3">No results yet.</h1>
      <p className="text-muted-foreground mb-6">Generate your Career DNA from the Analysis page first.</p>
      <Link to="/app/analysis" className="inline-flex items-center gap-1 text-primary font-medium">Go to analysis <ChevronRight className="w-4 h-4" /></Link>
    </div>
  );
}