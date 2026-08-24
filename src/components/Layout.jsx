import React from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Compass } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const sessions = await base44.entities.AssessmentSession.list();
        const modules = ["session1", "sport", "gaming", "money", "decision_ownership", "riasec", "work_style", "values", "simulations"];
        const done = sessions.filter((s) => s.status === "complete");
        const pct = Math.round((done.length / modules.length) * 100);
        if (active) setProgress(pct);
      } catch {}
    })();
    return () => { active = false; };
  }, [location.pathname]);

  async function handleLogout() {
    await base44.auth.logout();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <span className="font-heading text-lg tracking-tight text-foreground">Career Compass</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
            </div>
            {user?.role === "admin" && (
              <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
            )}
            <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 py-8">{children}</main>
    </div>
  );
}