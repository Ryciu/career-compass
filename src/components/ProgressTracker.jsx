import React from "react";
import { Check, Circle, CircleDot } from "lucide-react";

// Compact visual tracker: at-a-glance status for every module, with the
// two new structured modules (SJT, Career Drivers) flagged "New" so users
// see exactly what's left to finish before results unlock.
export default function ProgressTracker({ modules, statusOf }) {
  const done = modules.filter((m) => statusOf(m.id) === "complete");
  const left = modules.filter((m) => statusOf(m.id) !== "complete");
  const pct = modules.length ? Math.round((done.length / modules.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Progress tracker</h2>
        <span className="text-sm text-muted-foreground tabular-nums">{done.length}/{modules.length} done · {pct}%</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {modules.map((m) => {
          const status = statusOf(m.id);
          return (
            <span
              key={m.id}
              title={`${m.label} — ${status === "complete" ? "Complete" : status === "in_progress" ? "In progress" : "Not started"}`}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                status === "complete"
                  ? "bg-primary text-primary-foreground"
                  : status === "in_progress"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {status === "complete" ? <Check className="w-3 h-3" /> : status === "in_progress" ? <CircleDot className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              {m.shortLabel || m.label}
              {(m.id === "sjt" || m.id === "career_drivers") && (
                <span className={`ml-1 rounded px-1 py-0 text-[10px] font-semibold uppercase tracking-wide ${status === "complete" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"}`}>New</span>
              )}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {left.length > 0 ? (
        <p className="text-sm text-muted-foreground mt-3">
          <span className="font-medium text-foreground">{left.length}</span> module{left.length === 1 ? "" : "s"} left to finish:{" "}
          <span className="text-foreground">{left.map((m) => m.label).join(" · ")}</span>
        </p>
      ) : (
        <p className="text-sm text-primary mt-3 font-medium">All modules complete — your results are ready to generate.</p>
      )}
    </div>
  );
}