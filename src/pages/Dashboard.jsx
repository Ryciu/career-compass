import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { MODULES, PHASES } from "@/data/modules";
import { Check, ChevronRight, Lock, Sparkles } from "lucide-react";
import ProgressTracker from "@/components/ProgressTracker";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const p = await base44.entities.Profile.filter({}).then((r) => r[0]);
        const s = await base44.entities.AssessmentSession.list();
        setProfile(p);
        setSessions(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusOf = (id) => {
    const forModule = sessions.filter((x) => x.module === id);
    if (forModule.some((s) => s.status === "complete")) return "complete";
    if (forModule.some((s) => s.status === "in_progress")) return "in_progress";
    return "new";
  };

  const completedCount = MODULES.filter((m) => statusOf(m.id) === "complete").length;
  const allComplete = completedCount === MODULES.length;
  const inProgressAny = MODULES.some((m) => statusOf(m.id) === "in_progress");

  const firstUnfinished = MODULES.find((m) => statusOf(m.id) !== "complete");

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          {profile?.first_name ? `Welcome back, ${profile.first_name}.` : "Welcome."}
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl leading-tight">Your career compass.</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
          We collect evidence before conclusions. Move through each module at your own pace —
          your progress saves automatically.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(completedCount / MODULES.length) * 100}%` }} />
          </div>
          <span className="text-sm text-muted-foreground tabular-nums">{completedCount}/{MODULES.length}</span>
        </div>
      </div>

      <ProgressTracker modules={MODULES} statusOf={statusOf} />

      <div className="space-y-2">
        {MODULES.map((m, idx) => {
          const status = statusOf(m.id);
          const locked = false; // all open modules accessible; gating only on results
          return (
            <Link
              key={m.id}
              to={locked ? "#" : m.route}
              className={`block rounded-2xl border bg-card p-5 transition-all ${status === "complete" ? "border-border opacity-90" : "border-border hover:border-primary/40 hover:shadow-sm"} ${locked ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${status === "complete" ? "bg-primary text-primary-foreground" : status === "in_progress" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {status === "complete" ? <Check className="w-5 h-5" /> : <span className="text-sm font-medium">{idx + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground truncate">{m.label}</h3>
                    {status === "in_progress" && <span className="text-xs text-primary">In progress</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{m.subtitle}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className={`rounded-2xl border p-6 transition-all ${allComplete ? "border-primary/40 bg-primary/5" : "border-dashed border-border bg-card opacity-60"}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            {allComplete ? <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">Analysis & Results</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {allComplete
                ? "All modules complete. Let's generate your Career DNA, hypotheses, and report."
                : `Complete all ${MODULES.length} modules to unlock your results. We never reveal career hypotheses before the evidence is collected.`}
            </p>
            {allComplete ? (
              <Link to="/app/analysis" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
                Generate my results <ChevronRight className="w-4 h-4" />
              </Link>
            ) : firstUnfinished ? (
              <Link to={firstUnfinished.route} className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                Continue: {firstUnfinished.label} <ChevronRight className="w-4 h-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}