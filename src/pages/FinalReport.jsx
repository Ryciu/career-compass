import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import Layout, { NoReport, useReport, ResultNav } from "@/pages/CareerDna";
import { Loader2, Download, FileDown, FileType } from "lucide-react";
import { downloadReportPdf } from "@/lib/exportReportPdf";
import { downloadReportDocx } from "@/lib/exportReportDocx";

export default function FinalReport() {
  const { report, loading } = useReport();
  const [exporting, setExporting] = useState(false);
  const [profileName, setProfileName] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const p = await base44.entities.Profile.filter({});
        if (p[0]?.first_name) setProfileName(p[0].first_name);
      } catch {}
    })();
  }, []);
  if (loading) return <Layout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div></Layout>;
  if (!report) return <Layout><NoReport /></Layout>;

  const s = report.sections || {};

  async function handleExport(fmt) {
    setExporting(fmt);
    try {
      if (fmt === "pdf") await downloadReportPdf(report, profileName);
      else await downloadReportDocx(report, profileName);
    } finally {
      setExporting(null);
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ResultNav active="report" />
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl mb-2">Your Final Report</h1>
            <p className="text-muted-foreground">The evidence as it currently stands. Not a verdict.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExport("pdf")}
              disabled={!!exporting}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 h-9 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {exporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Pobierz PDF
            </button>
            <button
              onClick={() => handleExport("docx")}
              disabled={!!exporting}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card text-foreground px-4 h-9 text-sm font-medium hover:bg-accent disabled:opacity-60"
            >
              {exporting === "docx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileType className="w-4 h-4" />}
              Pobierz Word
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <Section title="Executive Summary">
            <p className="text-[15px] leading-relaxed">{s.executive_summary}</p>
          </Section>

          {report.career_dna && (
            <Section title="Career DNA">
              <p className="text-[15px] leading-relaxed">{report.career_dna.dominant_interest_pattern}</p>
            </Section>
          )}

          {s.energizers?.length > 0 && <Section title="What seems to energize you"><Bullets items={s.energizers} /></Section>}
          {s.demonstrated_strengths?.length > 0 && <Section title="Demonstrated strengths"><Bullets items={s.demonstrated_strengths} /></Section>}
          {s.work_environment_fit && <Section title="Work environment fit"><p className="text-[15px] leading-relaxed">{s.work_environment_fit}</p></Section>}
          {s.values_summary && <Section title="Values"><p className="text-[15px] leading-relaxed">{s.values_summary}</p></Section>}

          {s.motivational_drivers?.length > 0 && (
            <Section title="Your motivational drivers">
              <div className="space-y-3">
                {s.motivational_drivers.map((d, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{d.driver}</span>
                      {d.category && <span className="text-xs text-primary">{d.category}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{d.interpretation}</p>
                    {d.supporting_evidence?.length > 0 && <p className="text-xs text-muted-foreground mt-1">Evidence: {d.supporting_evidence.join("; ")}</p>}
                    {d.possible_tension && <p className="text-xs text-amber-700 mt-1">Tension: {d.possible_tension}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {s.sjt_behavioral_patterns?.length > 0 && (
            <Section title="How you tend to respond in real situations"><Bullets items={s.sjt_behavioral_patterns} /></Section>
          )}

          {s.where_tests_disagree?.length > 0 && (
            <Section title="Where the tests disagree"><Bullets items={s.where_tests_disagree} /></Section>
          )}

          {s.important_contradictions?.length > 0 && <Section title="Important contradictions"><Bullets items={s.important_contradictions} /></Section>}
          {s.top_hypotheses_summary?.length > 0 && <Section title="Top 3 career hypotheses"><Bullets items={s.top_hypotheses_summary} /></Section>}
          {s.wildcard_hypotheses_summary?.length > 0 && <Section title="Wildcard hypotheses"><Bullets items={s.wildcard_hypotheses_summary} /></Section>}
          {s.weak_fit_directions?.length > 0 && <Section title="Directions currently showing weak fit"><Bullets items={s.weak_fit_directions} /></Section>}
          {s.what_we_still_do_not_know?.length > 0 && <Section title="What we still do not know"><Bullets items={s.what_we_still_do_not_know} /></Section>}

          {report.education_direction?.implication && (
            <Section title="Education implications"><p className="text-[15px] leading-relaxed">{report.education_direction.implication}</p></Section>
          )}
          {report.twelve_month_direction && (
            <Section title="12-month direction"><p className="text-[15px] leading-relaxed">{report.twelve_month_direction}</p></Section>
          )}
        </div>
      </div>
    </Layout>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </div>
  );
}
function Bullets({ items }) {
  return <ul className="space-y-1.5">{items.map((it, i) => <li key={i} className="text-[15px] flex gap-2"><span className="text-muted-foreground">·</span>{it}</li>)}</ul>;
}