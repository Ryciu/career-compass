import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";

// Generates the full Polish Markdown summary of the final report for the
// admin/researcher view. This is split from generateFinalReport (which produces
// only the English structured sections) so each LLM call finishes well under the
// platform execution cap. Input: the same report bundle (evidence, contradictions,
// scores, sjt, career_drivers, cross_validation, simulations, career_dna, hypotheses).
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const bundle = body || {};

    const task = `## TWOJE ZADANIE

Napisz pełny raport po polsku w formacie Markdown dla administratora/badacza. Raport musi wiernie odzwierciedlać wnioski z dowodów użytkownika, zachowując ton FINAL (nigdy "Powinieneś zostać X", tylko "Najsilniejsza obecna hipoteza to…", "Dowody to potwierdzające to to…", "To pozostaje niepewne, ponieważ…", "Zanim podejmiesz kosztowną decyzję edukacyjną, przetestuj to przez…").

Struktura raportu (Markdown z nagłówkami ## i ###):
1. Podsumowanie wykonawcze
2. Czego praca daje użytkownikowi energię (energizers)
3. Udowodnione mocne strony
4. Dopasowanie środowiska pracy
5. Podsumowanie wartości
6. Ważne sprzeczności w danych
7. Hipotezy ścieżek zawodowych — 3 najsilniejsze (z: dlaczego może pasować, dowody, dowody przeciwnawe, czego nie wiemy, reality check, tani eksperyment, implikacja edukacyjna, pewność)
8. Hipotezy dzikie karty — 2
9. Kierunki o słabym dopasowaniu obecnie — do 3
10. Sterowniki motywacyjne (z testu wymuszonego wyboru) — 3-5, z kategorią, interpretacją, dowodami, ewentualnym napięciem
11. Wzorce behawioralne z testu oceny sytuacyjnej (SJT) — 4-6 istotnych, tylko poparte danymi
12. Gdzie testy się nie zgadzają — wyraźnie nazwij rozbieżności jako użyteczną informację diagnostyczną
13. Implikacja edukacyjna i rekomendowany typ kierunku (university_degree, vocational_vet, professional_certification, portfolio_based, work_experience, entrepreneurial_experiment, unclear_explore_first)
14. 30-dniowy plan działania
15. Kierunek na 12 miesięcy
16. Czego nadal nie wiemy

CAUTION (PSYCHOMETRIC): ramy eksploracyjne — nigdy język kliniczny, diagnostyczny, certyfikowany ani "naukowo-definitywny". Nie diagnozuj stanów. Nie interpretuj nadmiernie małych różnic; rekomendacja zawodowa nie może opierać się na jednym teście strukturalnym — pewność rośnie dopiero, gdy wynik pojawia się w co najmniej DWÓCH niezależnych źródłach.

Zwróć wyłącznie pole full_markdown_pl zawierające cały powyższy raport jako jeden blok Markdown.`;
    const instructions = COACH_CORE + "\n\n---\n\n" + task;

    const schema = {
      type: "object",
      properties: {
        full_markdown_pl: { type: "string", description: "Pełny raport po polsku w formacie Markdown dla administratora/badacza" },
      },
      required: ["full_markdown_pl"],
    };

    const input = JSON.stringify(bundle);
    const out = await responsesChat({ base44, instructions, input, jsonSchema: schema });
    return Response.json(out);
  } catch (error) {
    return Response.json({ error: error.message || 'Polish report error' }, { status: 500 });
  }
}