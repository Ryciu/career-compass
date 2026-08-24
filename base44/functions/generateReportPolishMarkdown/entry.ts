import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { responsesChat } from "../../shared/openai.ts";
import { COACH_CORE } from "../../shared/coachInstructions.ts";

// Generates the Polish markdown summary from an already-produced structured
// English report. Kept as a separate call so each LLM invocation stays well
// under the platform 120s proxy timeout.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const englishReport = body?.report || {};
    const careerDna = body?.career_dna || {};
    const hypotheses = body?.hypotheses || [];

    const instructions = COACH_CORE + "\n\n---\n\n## YOUR TASK\n\n" +
      "Przetłumacz i zredaguj poniższy strukturalny raport kariery (język angielski) na PEŁNY raport języka polskiego w formacie Markdown. " +
      "To wersja dla administratora/badacza. Używaj tonu eksploracyjnego (hipotezy, nie diagnozy). Nie dodawaj nowych faktów; zachowaj wszystkie sekcje i wszystkie hipotezy zawodowe. " +
      "Struktura: # Tytuł, ## Streszczenie, ## Najmocniejsze hipotezy, ## Hipotezy typu wildcard, ## Słabsze dopasowania, ## Kierunek edukacyjny, ## Eksperymenty, ## Plan 30-dniowy, ## Kierunek 12-miesięczny, ## Czego jeszcze nie wiemy.\n\n" +
      "Zwróć WYŁĄCZNIE poprawny Markdown (jako string). Nie zwracaj JSON.";

    const input = JSON.stringify({ englishReport, careerDna, hypotheses });
    const out = await responsesChat({ base44, instructions, input });
    return Response.json({ full_markdown_pl: typeof out === "string" ? out : String(out) });
  } catch (error) {
    return Response.json({ error: error.message || 'PL report error' }, { status: 500 });
  }
}