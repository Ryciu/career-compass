// Client-side Word (.doc) export for the Career Compass final report.
// Builds a Word-compatible HTML document and downloads it as .doc — opens
// directly in Microsoft Word / Google Docs / LibreOffice and is fully editable.
// No external dependency required (the `docx` npm package is not installed).

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function bullets(items) {
  if (!items?.length) return "";
  return `<ul style="margin:6px 0 6px 18px; padding:0;">${items
    .map((raw) => {
      let label;
      if (typeof raw === "string") label = raw;
      else if (raw?.driver) label = `<b>${esc(raw.driver)}</b>${raw.category ? ` (${esc(raw.category)})` : ""}: ${esc(raw.interpretation || "")}`;
      else if (raw?.title) label = `<b>${esc(raw.title)}</b>${raw.description ? ` — ${esc(raw.description)}` : ""}`;
      else label = JSON.stringify(raw);
      return `<li style="margin-bottom:4px;">${label}</li>`;
    })
    .join("")}</ul>`;
}

function para(text) {
  return text ? `<p style="margin:0 0 8px 0;">${esc(text)}</p>` : "";
}

function heading(text) {
  return `<h2 style="font-family:Georgia,serif; color:#2a6e54; font-size:15px; margin:18px 0 6px 0; border-bottom:1px solid #cfe0d8; padding-bottom:3px;">${esc(text)}</h2>`;
}

export function downloadReportDocx(report, profileName) {
  const s = report?.sections || {};
  const date = new Date().toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" });

  const body = [
    heading("Executive Summary"),
    para(s.executive_summary),
    report?.career_dna?.dominant_interest_pattern ? heading("Career DNA") + para(report.career_dna.dominant_interest_pattern) : "",
    s.energizers?.length ? heading("What Energizes You") + bullets(s.energizers) : "",
    s.demonstrated_strengths?.length ? heading("Natural Strength Patterns") + bullets(s.demonstrated_strengths) : "",
    s.work_environment_fit ? heading("Work Style") + para(s.work_environment_fit) : "",
    s.values_summary ? heading("Values") + para(s.values_summary) : "",
    s.motivational_drivers?.length ? heading("Motivational Drivers") + bullets(s.motivational_drivers) : "",
    s.sjt_behavioral_patterns?.length ? heading("Situational Behavior") + bullets(s.sjt_behavioral_patterns) : "",
    s.important_contradictions?.length ? heading("Important Contradictions") + bullets(s.important_contradictions) : "",
    s.where_tests_disagree?.length ? heading("Where the Tests Disagree") + bullets(s.where_tests_disagree) : "",
    s.top_hypotheses_summary?.length ? heading("Top 3 Career Hypotheses") + bullets(s.top_hypotheses_summary) : "",
    s.wildcard_hypotheses_summary?.length ? heading("Wildcard Directions") + bullets(s.wildcard_hypotheses_summary) : "",
    s.weak_fit_directions?.length ? heading("Current Lower-Fit Directions") + bullets(s.weak_fit_directions) : "",
    s.what_we_still_do_not_know?.length ? heading("What We Still Don't Know") + bullets(s.what_we_still_do_not_know) : "",
    report?.experiments?.length ? heading("Recommended Real-Life Experiments") + bullets(report.experiments) : "",
    report?.action_plan_30_day?.length ? heading("30-Day Action Plan") + bullets(report.action_plan_30_day) : "",
    report?.twelve_month_direction ? heading("6-12 Month Exploration Plan") + para(report.twelve_month_direction) : "",
    report?.education_direction?.implication ? heading("Education Direction") + para(report.education_direction.implication) : "",
    heading("Dla rodzica") + para("Jak wspierać ten profil bez decydowania za młodego człowieka: nie traktuj wyników jak wyroku — traktuj je jako mapę do testowania. Rozważ eksperymenty zamiast przedwczesnego wyboru kierunku. Nie nadinterpretuj pojedynczych wyników; ufaj tam, gdzie kilka niezależnych źródeł się zgadza."),
  ].join("");

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Career Compass — Raport</title>
<style>body{font-family:Calibri,Arial,sans-serif; font-size:11pt; color:#28201c;} h1{font-family:Georgia,serif; font-size:28pt; color:#1e1c19; margin:0;}</style>
</head>
<body>
<p style="font-family:Georgia,serif; font-size:11pt; color:#786e64; letter-spacing:2px; margin:0;">CAREER COMPASS</p>
<h1>Twój kierunek z zawodami</h1>
${profileName ? `<p style="margin:8px 0 2px 0; color:#504e48;">Przygotowane dla: <b>${esc(profileName)}</b></p>` : ""}
<p style="margin:0 0 24px 0; color:#78736c; font-size:10pt;">${date} — Profil działania, motywacji i ścieżek rozwoju</p>
${body}
</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "career-compass-report.doc";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}