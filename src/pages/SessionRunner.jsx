import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { SESSIONS_BY_ID, SESSIONS, modulesForSession, isSessionComplete, firstIncompleteInSession } from "@/data/modules";
import { setRunReturn } from "@/lib/sessionRun";
import { Check, ChevronRight, Clock, Sparkles } from "lucide-react";

export default function SessionRunner() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = SESSIONS_BY_ID[sessionId];

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await base44.entities.AssessmentSession.list();
        if (active) setSessions(s);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [sessionId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Nie znaleziono sesji.</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate("/app")}>Wróć do pulpitu</Button>
        </div>
      </Layout>
    );
  }

  const statusOf = (id) => {
    const forModule = sessions.filter((x) => x.module === id);
    if (forModule.some((s) => s.status === "complete")) return "complete";
    if (forModule.some((s) => s.status === "in_progress")) return "in_progress";
    return "new";
  };

  const mods = modulesForSession(session.id);
  const doneCount = mods.filter((m) => statusOf(m.id) === "complete").length;
  const allComplete = isSessionComplete(session.id, statusOf);
  const next = firstIncompleteInSession(session.id, statusOf);
  const pct = Math.round((doneCount / mods.length) * 100);

  function startNext() {
    if (!next) return;
    setRunReturn(session.id);
    navigate(next.route);
  }

  // Next session for the completion CTA
  const isLast = session.n === SESSIONS.length;
  const nextSession = SESSIONS[session.n]; // 1-based n → 0-based index n = next session

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        {/* Session header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Clock className="w-3.5 h-3.5" /> {session.duration}
          </div>
          <h1 className="font-heading text-3xl">{session.title}</h1>
          <p className="text-muted-foreground mt-1.5 leading-relaxed">{session.subtitle}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{doneCount}/{mods.length}</span>
          </div>
        </div>

        {allComplete ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl mb-1">Sesja ukończona</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{session.completeText}</p>
                {isLast ? (
                  <Button onClick={() => navigate("/app/analysis")} className="rounded-full gap-2">
                    Przejdź do wyników <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={() => navigate(`/app/run/${nextSession.id}`)} className="rounded-full gap-2">
                    Sesja {session.n + 1}: {nextSession.label} <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Transition card for the next module */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-xs text-primary uppercase tracking-widest mb-2">
                {next ? `Krok ${doneCount + 1} z ${mods.length}` : "Gotowe"}
              </div>
              <h2 className="font-heading text-2xl mb-1.5">{next ? next.label : "Ukończono"}</h2>
              {next && <p className="text-muted-foreground leading-relaxed">{next.subtitle}</p>}
              <Button onClick={startNext} className="rounded-full h-11 px-6 mt-5 gap-2">
                {doneCount > 0 ? "Kontynuuj" : "Rozpocznij"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Module map */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Moduły w tej sesji</p>
              <div className="space-y-2">
                {mods.map((m, i) => {
                  const st = statusOf(m.id);
                  return (
                    <div key={m.id} className="flex items-center gap-3 text-sm">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${st === "complete" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {st === "complete" ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className={st === "complete" ? "text-muted-foreground" : "text-foreground"}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button onClick={() => navigate("/app")} className="text-sm text-muted-foreground hover:text-foreground">
              ← Wróć do pulpitu
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}