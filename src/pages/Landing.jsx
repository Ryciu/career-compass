import React from "react";
import { Link, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Compass, ArrowRight } from "lucide-react";

export default function Landing() {
  const [authed, setAuthed] = React.useState(null);
  React.useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed);
  }, []);
  if (authed) return <Navigate to="/app" replace />;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 h-16 flex items-center justify-between max-w-3xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="font-heading text-lg tracking-tight">Career Compass</span>
        </div>
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-2xl mx-auto text-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground border border-border rounded-full px-3 py-1 bg-card">
            Evidence-driven career coaching
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl leading-[1.1] text-foreground">
            Find direction through<br />
            evidence — not a quiz.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Career Compass behaves like an excellent human career coach. It collects behavioral evidence,
            challenges assumptions, identifies contradictions, and generates honest career hypotheses —
            with explicit uncertainty.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/register" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 h-12 text-sm font-medium hover:opacity-90 transition-opacity">
              Begin your assessment <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground h-12 px-4">
              Continue where you left off
            </Link>
          </div>
          <p className="text-xs text-muted-foreground pt-4">Private by default. Your responses are never shared without your action.</p>
        </div>
      </main>

      <footer className="px-6 py-8 text-center text-xs text-muted-foreground max-w-3xl mx-auto">
        Career Compass is not a clinical assessment or a therapy product.
      </footer>
    </div>
  );
}