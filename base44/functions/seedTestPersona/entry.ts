import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { seedPersona } from "../../shared/seedPersona.ts";

// Seeds the full test persona assessment data for the INVOKING user.
// Because createClientFromRequest uses the caller's auth context, every
// created record is owned by whoever invokes the function — so a test user
// running it keeps the builder's account clean.
//
// After seeding, the user opens /app/analysis and clicks Generate; the
// analysis pipeline (analyzeModule -> Career DNA -> Hypotheses -> Final Report)
// runs as that same user and persists results to their account.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const result = await seedPersona(base44);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message || 'seedTestPersona error' }, { status: 500 });
  }
}