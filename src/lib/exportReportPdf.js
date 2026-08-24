// Client-side A4 PDF export for the Career Compass final report.
// Uses jsPDF (installed) to lay out an editorial-style report from the
// structured report data already on the page. A4 portrait, wrapped text,
// section headings, and bullet lists.

import { jsPDF } from "jspdf";

const PAGE_W = 595.28; // A4 width in pt
const PAGE_H = 841.89;
const M = 56; // margin
const CW = PAGE_W - M * 2;
const ACCENT = [42, 110, 84];

export async function downloadReportPdf(report) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = M;

  const ensure = (need) => {
    if (y + need > PAGE_H - M) {
      doc.addPage();
      y = M;
    }
  };

  const heading = (text) => {
    ensure(46);
    y += 10;
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.text(text, M, y);
    y += 6;
    doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]);
    doc.setLineWidth(0.8);
    doc.line(M, y, M + 36, y);
    y += 16;
    doc.setTextColor(20, 20, 20);
  };

  const para = (text) => {
    if (!text) return;
    const lines = doc.splitTextToSize(String(text), CW);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    for (const ln of lines) {
      ensure(16);
      doc.text(ln, M, y);
      y += 15;
    }
    y += 4;
  };

  const bullets = (items) => {
    if (!items || !items.length) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    for (const raw of items) {
      const label = typeof raw === "string" ? raw : (raw?.label || raw?.driver || JSON.stringify(raw));
      const lines = doc.splitTextToSize("•  " + label, CW - 12);
      for (let i = 0; i < lines.length; i++) {
        ensure(15);
        doc.text(lines[i], M + 4, y);
        y += 15;
      }
      y += 2;
    }
    y += 4;
  };

  // ---- Cover ----
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text("Career Compass", M, M + 60);

  doc.setFont("times", "bold");
  doc.setFontSize(40);
  doc.setTextColor(20, 20, 20);
  doc.text("Career Compass", M, M + 160);
  doc.text("Report", M, M + 205);

  doc.setFont("times", "normal");
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text("Twój profil działania, motywacji i kierunków rozwoju", M, M + 240);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  const date = new Date().toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" });
  doc.text(date, M, M + 300);

  doc.addPage();
  y = M;

  const s = report.sections || {};

  heading("Executive Summary");
  para(s.executive_summary);

  if (report.career_dna?.dominant_interest_pattern) {
    heading("Career DNA");
    para(report.career_dna.dominant_interest_pattern);
  }

  if (s.energizers?.length) { heading("What Energizes You"); bullets(s.energizers); }
  if (s.demonstrated_strengths?.length) { heading("Natural Strength Patterns"); bullets(s.demonstrated_strengths); }
  if (s.work_environment_fit) { heading("Work Style"); para(s.work_environment_fit); }
  if (s.values_summary) { heading("Values"); para(s.values_summary); }

  if (s.motivational_drivers?.length) {
    heading("Motivational Drivers");
    bullets(s.motivational_drivers.map((d) => `${d.driver}${d.category ? ` (${d.category})` : ""}: ${d.interpretation || ""}`));
  }

  if (s.sjt_behavioral_patterns?.length) { heading("Situational Behavior"); bullets(s.sjt_behavioral_patterns); }
  if (s.important_contradictions?.length) { heading("Important Contradictions"); bullets(s.important_contradictions); }
  if (s.where_tests_disagree?.length) { heading("Where the Tests Disagree"); bullets(s.where_tests_disagree); }

  if (s.top_hypotheses_summary?.length) { heading("Top 3 Career Hypotheses"); bullets(s.top_hypotheses_summary); }
  if (s.wildcard_hypotheses_summary?.length) { heading("Wildcard Directions"); bullets(s.wildcard_hypotheses_summary); }
  if (s.weak_fit_directions?.length) { heading("Current Lower-Fit Directions"); bullets(s.weak_fit_directions); }
  if (s.what_we_still_do_not_know?.length) { heading("What We Still Don't Know"); bullets(s.what_we_still_do_not_know); }

  if (report.experiments?.length) { heading("Recommended Real-Life Experiments"); bullets(report.experiments.map((e) => e?.title || e?.description || JSON.stringify(e))); }
  if (report.action_plan_30_day?.length) { heading("30-Day Action Plan"); bullets(report.action_plan_30_day.map((a) => a?.action || a?.title || JSON.stringify(a))); }
  if (report.twelve_month_direction) { heading("6-12 Month Exploration Plan"); para(report.twelve_month_direction); }
  if (report.education_direction?.implication) { heading("Education Direction"); para(report.education_direction.implication); }

  heading("Dla rodzica");
  para("Jak wspierać ten profil bez decydowania za młodego człowieka: nie traktuj wyników jak wyroku — traktuj je jako mapę do testowania. Rozważ eksperymenty zamiast przedwczesnego wyboru kierunku. Nie nadinterpretuj pojedynczych wyników; ufaj tam, gdzie kilka niezależnych źródeł się zgadza.");

  // Page numbers
  const total = doc.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(String(i) + " / " + total, PAGE_W - M, PAGE_H - 30, { align: "right" });
  }

  doc.save("career-compass-report.pdf");
}