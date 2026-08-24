import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { SESSIONS, isSessionComplete, firstIncompleteInSession, modulesForSession } from "@/data/modules";
import { Check, ChevronRight, Lock, Sparkles, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await base44.entities.Profile.filter({}).then((r) => r[0]);
        const s = await base44.entities.AssessmentSession.list();
        if (!active) return;
        setProfile(p);
        setSessions(s);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const statusOf = (id) => {
    const forModule = sessions.filter((x) => x.module === id);
    if (forModule.some((s) => s.status === "complete")) return "complete";
    if (forModule.some((s) => s.status === "in_progress")) return "in_progress";
    return "new";
  };

  const sessionStatus = (s) => {
    if (isSessionComplete(s.id, statusOf)) return "complete";
    if (s.modules.some((m) => statusOf(m) === "in_progress" || statusOf(m) === "complete")) return "in_progress";
    return "new";
  };

  const allSessionsComplete = SESSIONS.every((s) => sessionStatus(s) === "complete");

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {profile?.first_name ? `Witaj z powrotem, ${profile.first_name}.` : "Witaj."}
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl leading-tight">Career Compass</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
          Cztery krótkie sesje. Każda trwa 20–30 minut i zapisuje się sama — możesz przerwać w dowolnym momencie i wrócić później.
        </p>
      </div>

      <div className="space-y-3">
        {SESSIONS.map((s) => {
          const status = sessionStatus(s);
          const mods = modulesForSession(s.id);
          const doneCount = mods.filter((m) => statusOf(m.id) === "complete").length;
          const pct = Math.round((doneCount / mods.length) * 100);
          const next = firstIncompleteInSession(s.id, statusOf);

          return (
            <div
              key={s.id}
              className={`rounded-2xl border bg-card p-5 transition-all ${
                status === "complete" ? "border-primary/30" : "border-border hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-full ${
                    status === "complete" ? "bg-primary text-primary-foreground" : status === "in_progress" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {status === "complete" ? <Check className="w-6 h-6" /> : <span className="font-heading text-lg">{s.n}</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="font-heading text-lg text-foreground">{s.label}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {s.duration}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        status === "complete"
                          ? "bg-primary/10 text-primary"
                          : status === "in_progress"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status === "complete" ? "Ukończona" : status === "in_progress" ? "W trakcie" : "Nie rozpoczęta"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{s.subtitle}</p>

                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{doneCount}/{mods.length}</span>
                  </div>

                  {status === "complete" && (
                    <p className="text-sm text-primary mt-3 leading-relaxed">{s.completeText}</p>
                  )}

                  <div className="mt-4">
                    {status === "complete" ? (
                      <CompletedCTA sessions={SESSIONS} current={s} statusOf={statusOf} />
                    ) : s.id === "profile" ? (
                      <Link
                        to={`/app/run/${s.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                      >
                        {status === "in_progress" ? "Kontynuuj sesję" : "Rozpocznij sesję"}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <Link
                        to={next ? next.route : "#"}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                      >
                        {status === "in_progress" ? "Kontynuuj" : "Rozpocznij"}
                        {next && <span className="text-muted-foreground">— {next.label}</span>}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Your Career Compass — locked until 4 sessions done */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          allSessionsComplete ? "border-primary/40 bg-primary/5" : "border-dashed border-border bg-card"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            {allSessionsComplete ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-xl text-foreground mb-1">Your Career Compass</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {allSessionsComplete
                ? "Wszystkie sesje ukończone. Generujemy Twój Career DNA, hipotezy zawodowe i raport."
                : "Odblokowane po ukończeniu 4 sesji. Tworzymy wnioski dopiero po zebraniu dowodów."}
            </p>
            {allSessionsComplete ? (
              <Link
                to="/app/analysis"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
              >
                Przejdź do wyników <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">Ukończ: {SESSIONS.map((s) => s.label).join(" · ")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletedCTA({ sessions, current, statusOf }) {
  if (current.n === sessions.length) {
    return (
      <Link to="/app/analysis" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all">
        Przejdź do wyników <ChevronRight className="w-4 h-4" />
      </Link>
    );
  }
  const nextSession = sessions[current.n]; // 1-based n → 0-based index = n is next session
  const nextMod = firstIncompleteInSession(nextSession.id, statusOf);
  const to = nextSession.id === "profile" ? `/app/run/${nextSession.id}` : (nextMod ? nextMod.route : "/app");
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all">
      Przejdź do sesji {current.n + 1}: {nextSession.label} {nextMod && nextSession.id !== "profile" && <span className="text-muted-foreground">— {nextMod.label}</span>} <ChevronRight className="w-4 h-4" />
    </Link>
  );
}