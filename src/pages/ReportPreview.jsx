import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, Printer, ChevronLeft, Globe, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Dedicated, readable report preview with PDF export + print.
export default function ReportPreview() {
  const [report, setReport] = useState(null);
  const [hypotheses, setHypotheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en"); // "en" | "pl"
  const [exporting, setExporting] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await base44.entities.Report.filter({});
        const sorted = (r || []).sort((a, b) =>
          new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date)
        );
        const rep = sorted[0] || null;
        setReport(rep);
        if (rep) {
          const h = await base44.entities.CareerHypothesis.filter({});
          setHypotheses(h || []);
        }
        if (rep?.full_markdown_pl) setLang("pl");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Inject print-only styles so the app chrome hides when printing / exporting.
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "report-preview-print";
    style.textContent = `
      @media print {
        header, .no-print { display: none !important; }
        .report-print-area { max-width: none !important; padding: 0 !important; }
        body { background: #ffffff !important; }
      }
      .pl-report { color: hsl(var(--foreground)); line-height: 1.7; font-size: 15px; }
      .pl-report h1 { font-family: var(--font-heading); font-size: 1.875rem; line-height: 1.2; margin: 2rem 0 1rem; }
      .pl-report h2 { font-family: var(--font-heading); font-size: 1.3rem; margin: 1.75rem 0 .75rem; }
      .pl-report h3 { font-weight: 600; font-size: 1.05rem; margin: 1.25rem 0 .5rem; }
      .pl-report p { margin: .65rem 0; }
      .pl-report ul, .pl-report ol { margin: .5rem 0; padding-left: 1.25rem; }
      .pl-report ul { list-style: disc; }
      .pl-report ol { list-style: decimal; }
      .pl-report li { margin: .3rem 0; }
      .pl-report strong { font-weight: 600; }
      .pl-report h1:first-child { margin-top: 0; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("report-preview-print")?.remove();
  }, []);

  async function downloadPdf() {
    const el = printRef.current;
    if (!el) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, jspdfMod] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const jsPDF = jspdfMod.jsPDF || jspdfMod.default;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const usableW = pageW - margin * 2;
      const imgH = (canvas.height * usableW) / canvas.width;
      let heightLeft = imgH;
      let position = margin;
      pdf.addImage(imgData, "PNG", margin, position, usableW, imgH);
      heightLeft -= pageH - margin * 2;
      while (heightLeft > 0) {
        position = margin - (imgH - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, usableW, imgH);
        heightLeft -= pageH - margin * 2;
      }
      pdf.save("career-compass-report.pdf");
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="text-center py-16">
          <h1 className="font-heading text-2xl mb-3">No report yet.</h1>
          <p className="text-muted-foreground mb-6">Generate your results from the Analysis page first.</p>
          <Link to="/app/analysis" className="text-primary font-medium">Go to analysis →</Link>
        </div>
      </Layout>
    );
  }

  const s = report.sections || {};
  const hasPl = Boolean(report.full_markdown_pl);
  const dna = report.career_dna || {};
  const experiments = report.experiments || s.experiments || [];
  const actionPlan = report.action_plan_30_day || s.action_plan_30_day || [];
  const edu = report.education_direction || {};
  const eduImplication = edu.implication || s.education_implication;
  const eduType = edu.direction_type || s.education_direction_type;

  const byType = (t) => hypotheses.filter((h) => h.hypothesis_type === t);
  const strongest = byType("strongest");
  const wildcards = byType("wildcard");
  const weakFit = byType("weak_current_fit");

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Toolbar (hidden in print / PDF) */}
        <div className="no-print sticky top-16 z-20 -mx-5 px-5 py-3 bg-background/90 backdrop-blur border-b border-border flex items-center justify-between gap-3 flex-wrap mb-6">
          <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            {hasPl && (
              <div className="inline-flex rounded-full border border-border bg-card p-0.5 text-xs">
                <button
                  onClick={() => setLang("pl")}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${lang === "pl" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  PL
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  EN
                </button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()} className="rounded-full">
              <Printer className="w-4 h-4" /> Drukuj
            </Button>
            <Button size="sm" onClick={downloadPdf} disabled={exporting} className="rounded-full">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              {exporting ? "Eksport…" : "Pobierz PDF"}
            </Button>
          </div>
        </div>

        <div ref={printRef} className="report-print-area bg-background space-y-10">
          {lang === "pl" && hasPl ? (
            <PlReport markdown={report.full_markdown_pl} />
          ) : (
            <>
              {/* Header */}
              <header className="pb-6 border-b border-border">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Career Compass</p>
                <h1 className="font-heading text-3xl sm:text-4xl text-foreground leading-tight">Your Career Report</h1>
                <p className="mt-2 text-muted-foreground text-[15px]">
                  The evidence as it currently stands — not a verdict.
                </p>
                {eduType && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Suggested education direction: <span className="font-medium text-foreground">{eduType.replace(/_/g, " ")}</span>
                  </p>
                )}
              </header>

              <Section title="Executive summary">
                <p className="text-[15px] leading-relaxed">{s.executive_summary}</p>
              </Section>

              {dna.dominant_interest_pattern && (
                <Section title="Career DNA — dominant interest pattern">
                  <p className="text-[15px] leading-relaxed">{dna.dominant_interest_pattern}</p>
                  {dna.demonstrated_strengths?.length > 0 && (
                    <div className="mt-4">
                      <SubLabel>Demonstrated strengths</SubLabel>
                      <Bullets items={dna.demonstrated_strengths} />
                    </div>
                  )}
                  {dna.preferred_environment && (
                    <div className="mt-4">
                      <SubLabel>Preferred environment</SubLabel>
                      <p className="text-[15px] leading-relaxed">{dna.preferred_environment}</p>
                    </div>
                  )}
                </Section>
              )}

              {s.energizers?.length > 0 && (
                <Section title="What seems to energize you"><Bullets items={s.energizers} positive /></Section>
              )}
              {s.demonstrated_strengths?.length > 0 && (
                <Section title="Demonstrated strengths"><Bullets items={s.demonstrated_strengths} /></Section>
              )}
              {s.work_environment_fit && (
                <Section title="Work environment fit"><p className="text-[15px] leading-relaxed">{s.work_environment_fit}</p></Section>
              )}
              {s.values_summary && (
                <Section title="Values"><p className="text-[15px] leading-relaxed">{s.values_summary}</p></Section>
              )}

              {s.motivational_drivers?.length > 0 && (
                <Section title="Your motivational drivers">
                  <div className="space-y-3">
                    {s.motivational_drivers.map((d, i) => (
                      <div key={i} className="rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{d.driver}</span>
                          {d.category && <span className="text-xs text-primary uppercase tracking-wide">{d.category}</span>}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{d.interpretation}</p>
                        {d.supporting_evidence?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">Evidence: {d.supporting_evidence.join(" · ")}</p>
                        )}
                        {d.possible_tension && (
                          <p className="text-xs text-amber-700 mt-1">Possible tension: {d.possible_tension}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {s.sjt_behavioral_patterns?.length > 0 && (
                <Section title="How you tend to act in real situations"><Bullets items={s.sjt_behavioral_patterns} /></Section>
              )}
              {s.where_tests_disagree?.length > 0 && (
                <Section title="Where the tests disagree"><Bullets items={s.where_tests_disagree} /></Section>
              )}
              {s.important_contradictions?.length > 0 && (
                <Section title="Important contradictions"><Bullets items={s.important_contradictions} /></Section>
              )}

              {strongest.length > 0 && (
                <Section title="Top career hypotheses (detailed)">
                  <div className="space-y-5">
                    {strongest.map((h, i) => <HypothesisCard key={i} h={h} rank={i + 1} kind="strong" />)}
                  </div>
                </Section>
              )}

              {wildcards.length > 0 && (
                <Section title="Wildcard hypotheses">
                  <div className="space-y-5">
                    {wildcards.map((h, i) => <HypothesisCard key={i} h={h} rank={i + 1} kind="wild" />)}
                  </div>
                </Section>
              )}

              {weakFit.length > 0 && (
                <Section title="Directions currently showing weak fit">
                  <div className="space-y-5">
                    {weakFit.map((h, i) => <HypothesisCard key={i} h={h} rank={i + 1} kind="weak" />)}
                  </div>
                </Section>
              )}

              {(eduImplication || eduType) && (
                <Section title="Education implications">
                  {eduType && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Recommended direction: <span className="font-medium text-foreground">{eduType.replace(/_/g, " ")}</span>
                    </p>
                  )}
                  {eduImplication && <p className="text-[15px] leading-relaxed">{eduImplication}</p>}
                </Section>
              )}

              {experiments.length > 0 && (
                <Section title="Low-cost experiments to test the hypotheses">
                  <div className="space-y-3">
                    {experiments.map((e, i) => (
                      <div key={i} className="rounded-xl border border-border p-4">
                        <p className="font-medium">{e.title}</p>
                        {e.description && <p className="text-sm text-muted-foreground leading-relaxed mt-1">{e.description}</p>}
                        {e.success_indicator && (
                          <p className="text-xs text-primary mt-2">Success signal: {e.success_indicator}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {actionPlan.length > 0 && (
                <Section title="30-day action plan">
                  <div className="space-y-3">
                    {actionPlan.map((a, i) => (
                      <div key={i} className="flex gap-3 rounded-xl border border-border p-4">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{a.title}</p>
                          {a.description && <p className="text-sm text-muted-foreground leading-relaxed mt-1">{a.description}</p>}
                          {a.timing && <p className="text-xs text-primary mt-1">{a.timing}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {report.twelve_month_direction && (
                <Section title="12-month direction">
                  <p className="text-[15px] leading-relaxed">{report.twelve_month_direction}</p>
                </Section>
              )}

              {s.what_we_still_do_not_know?.length > 0 && (
                <Section title="What we still do not know"><Bullets items={s.what_we_still_do_not_know} /></Section>
              )}

              <footer className="pt-6 border-t border-border text-xs text-muted-foreground leading-relaxed">
                This report is an exploratory career tool. It is not clinical, diagnostic, or scientifically definitive.
                Confidence rises only when a finding appears in more than one independent source.
              </footer>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

function PlReport({ markdown }) {
  return (
    <article className="pl-report">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-xl text-foreground">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function SubLabel({ children }) {
  return <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-medium">{children}</p>;
}

function Bullets({ items, positive }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="text-[15px] flex gap-2.5 leading-relaxed">
          <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${positive ? "bg-primary" : "bg-muted-foreground/50"}`} />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

const FIT_LABELS = {
  interest_fit: "Interest",
  strength_fit: "Strength",
  work_style_fit: "Work style",
  values_fit: "Values",
  simulation_fit: "Simulation",
  lifestyle_fit: "Lifestyle",
};

function HypothesisCard({ h, rank, kind }) {
  const fits = ["interest_fit", "strength_fit", "work_style_fit", "values_fit", "simulation_fit", "lifestyle_fit"]
    .filter((k) => typeof h[k] === "number");
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
              {rank}
            </span>
            <span className="font-medium text-foreground text-lg">{h.career_family}</span>
          </div>
          {h.example_roles?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">Example roles: {h.example_roles.join(" · ")}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          {typeof h.fit_score === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-muted-foreground">Fit</span>
              <span className="font-medium">{Math.round(h.fit_score * 100)}%</span>
            </span>
          )}
          {typeof h.confidence_score === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{Math.round(h.confidence_score * 100)}%</span>
            </span>
          )}
        </div>
      </div>

      {fits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
          {fits.map((k) => (
            <div key={k} className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">{FIT_LABELS[k]}</p>
              <p className="text-sm font-medium">{Math.round(h[k] * 100)}%</p>
            </div>
          ))}
        </div>
      )}

      {h.supporting_evidence?.length > 0 && (
        <div className="mt-4">
          <SubLabel>Supporting evidence</SubLabel>
          <Bullets items={h.supporting_evidence} positive />
        </div>
      )}
      {h.contradictory_evidence?.length > 0 && (
        <div className="mt-3">
          <SubLabel>Contrary evidence</SubLabel>
          <Bullets items={h.contradictory_evidence} />
        </div>
      )}
      {h.reality_check && (
        <div className="mt-3">
          <SubLabel>Reality check</SubLabel>
          <p className="text-[15px] leading-relaxed">{h.reality_check}</p>
        </div>
      )}
      {h.unknowns?.length > 0 && (
        <div className="mt-3">
          <SubLabel>What we do not know</SubLabel>
          <Bullets items={h.unknowns} />
        </div>
      )}
      {h.suggested_experiment && kind !== "weak" && (
        <div className="mt-3">
          <SubLabel>Low-cost experiment</SubLabel>
          <p className="text-[15px] leading-relaxed">{h.suggested_experiment}</p>
        </div>
      )}
      {h.education_implication && (
        <div className="mt-3">
          <SubLabel>Education implication</SubLabel>
          <p className="text-[15px] leading-relaxed">{h.education_implication}</p>
        </div>
      )}
    </div>
  );
}