import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";

// Generates part of the Polish Markdown summary of the final report for the
// admin/researcher view. It consumes the ALREADY-GENERATED English structured
// report (plus career_dna and hypotheses) — the model just translates/adapts a
// compact source. The report is split into two parts (1 and 2) so each LLM call
// produces ~half the output and finishes well under the platform execution cap;
// the caller concatenates the two parts.
//   part 1 → sections 1-8 (Podsumowanie … Hipotezy dzikie karty)
//   part 2 → sections 9-16 (Kierunki słabe … Czego nadal nie wiemy)
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const enReport = body?.en_report || {};
    const careerDna = body?.career_dna || {};
    const hypotheses = body?.hypotheses || [];
    const part = String(body?.part || "1");

    const sectionsPart1 = `1. Podsumowanie wykonawcze (en_report.executive_summary)
2. Czego praca daje energię (en_report.energizers)
3. Udowodnione mocne strony (en_report.demonstrated_strengths)
4. Dopasowanie środowiska pracy (en_report.work_environment_fit)
5. Podsumowanie wartości (en_report.values_summary)
6. Ważne sprzeczności (en_report.important_contradictions)
7. Hipotezy ścieżek zawodowych — 3 najsilniejsze (z hypotheses typu "strongest": dla każdej — dlaczego może pasować, dowody, dowody przeciwnawe, czego nie wiemy, reality check, tani eksperyment, implikacja edukacyjna, pewność)
8. Hipotezy dzikie karty — 2 (z hypotheses typu "wildcard")`;

    const sectionsPart2 = `9. Kierunki o słabym dopasowaniu obecnie — do 3 (en_report.weak_fit_directions oraz hypotheses typu "weak_current_fit")
10. Sterowniki motywacyjne (en_report.motivational_drivers — z kategorią, interpretacją, dowodami, ewentualnym napięciem)
11. Wzorce behawioralne z SJT (en_report.sjt_behavioral_patterns — 4-6, tylko poparte danymi)
12. Gdzie testy się nie zgadzają (en_report.where_tests_disagree)
13. Implikacja edukacyjna i rekomendowany typ kierunku (en_report.education_direction_type, en_report.education_implication)
14. 30-dniowy plan działania (en_report.action_plan_30_day)
15. Kierunek na 12 miesięcy (en_report.twelve_month_direction)
16. Czego nadal nie wiemy (en_report.what_we_still_do_not_know)`;

    const sections = part === "2" ? sectionsPart2 : sectionsPart1;

    const task = `## TWOJE ZADANIE

Otrzymujesz gotowy, ustrukturyzowany raport w języku angielskim (pole en_report) oraz career_dna i hypotheses. Przetłumacz i zredaguj TYLKO poniższą część raportu jakofragment po polsku w formacie Markdown dla administratora/badacza. Rozpocznij bezpośrednio od nagłówka pierwszej sekcji tej części (bez wstępu). Wiernie oddaj treść — nie wymyślaj nowych wniosków; jeśli czegoś brakuje w źródle, pomiń tę sekcję.

Zachowaj ton FINAL: nigdy "Powinieneś zostać X", tylko "Najsilniejsza obecna hipoteza to…", "Dowody to potwierdzające to…", "To pozostaje niepewne, ponieważ…", "Zanim podejmiesz kosztowną decyzję edukacyjną, przetestuj to przez…".

Uwzględnij TYLKO te sekcje (Markdown ## / ###):
${sections}

CAUTION (PSYCHOMETRIC): ramy eksploracyjne — nigdy język kliniczny, diagnostyczny, certyfikowany ani "naukowo-definitywny". Nie diagnozuj stanów.

Zwróć wyłącznie pole full_markdown_pl zawierające ten fragment raportu jako jeden blok Markdown.`;
    const instructions = COACH_CORE + "\n\n---\n\n" + task;

    const schema = {
      type: "object",
      properties: {
        full_markdown_pl: { type: "string", description: "Fragment raportu po polsku w formacie Markdown" },
      },
      required: ["full_markdown_pl"],
    };

    const input = JSON.stringify({ en_report: enReport, career_dna: careerDna, hypotheses });
    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });
    if (typeof out === "string" && out.trim().startsWith("#")) {
      return Response.json({ full_markdown_pl: out });
    }
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message || 'Polish report error' }, { status: 500 });
  }
}