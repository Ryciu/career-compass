import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import Layout from "@/components/Layout";
import { Loader2, ShieldAlert, ChevronRight } from "lucide-react";

// Admin / Research view (Polish). Role-protected: only renders for admins.
export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.entities.User.list();
        setUsers(u);
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  async function selectUser(u) {
    setSelectedUser(u);
    setLoadingData(true);
    try {
      // Service-role reads would be ideal, but app-user token already sees all records here.
      const sessions = await base44.entities.AssessmentSession.list("-created_date");
      const mySessions = sessions.filter((s) => s.created_by_id === u.id);
      const profile = (await base44.entities.Profile.list()).find((p) => p.created_by_id === u.id);
      const responses = [];
      for (const s of mySessions) {
        const r = await base44.entities.Response.filter({ session_id: s.id });
        responses.push(...r);
      }
      const scores = (await base44.entities.AssessmentScore.list()).filter((s) => s.created_by_id === u.id);
      const sims = (await base44.entities.SimulationResult.list()).filter((s) => s.created_by_id === u.id);
      const evidence = (await base44.entities.EvidenceItem.list()).filter((e) => e.created_by_id === u.id);
      const contradictions = (await base44.entities.Contradiction.list()).filter((c) => c.created_by_id === u.id);
      const hypo = (await base44.entities.CareerHypothesis.list("-fit_score")).filter((h) => h.created_by_id === u.id);
      const report = (await base44.entities.Report.list()).find((r) => r.created_by_id === u.id);
      const vsAnalysis = (await base44.entities.VisualStoryAnalysis.list()).filter((v) => v.created_by_id === u.id);
      const vsStoryboard = (await base44.entities.VisualStoryboard.list()).filter((v) => v.created_by_id === u.id);
      const vsBriefs = (await base44.entities.SlideBrief.list("-slide_number")).filter((v) => v.created_by_id === u.id);
      const vsPrompts = (await base44.entities.SlidePrompt.list("-slide_number")).filter((v) => v.created_by_id === u.id);
      const vsAssets = (await base44.entities.GeneratedVisualAsset.list("slide_number")).filter((v) => v.created_by_id === u.id);
      setData({ sessions: mySessions, profile, responses, scores, sims, evidence, contradictions, hypo, report, vsAnalysis, vsStoryboard, vsBriefs, vsPrompts, vsAssets });
    } finally {
      setLoadingData(false);
    }
  }

  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="text-center py-20">
          <ShieldAlert className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl mb-2">Brak dostępu.</h1>
          <p className="text-muted-foreground">Ten widok jest dostępny tylko dla administratorów.</p>
          <Link to="/app" className="inline-flex items-center gap-1 text-primary mt-4">Wróć do aplikacji <ChevronRight className="w-4 h-4" /></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Widok badacza / administratora</span>
          <h1 className="font-heading text-3xl mt-1">Panel badań (PL)</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium mb-3">Użytkownicy ({users.length})</h2>
              <div className="space-y-1.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${selectedUser?.id === u.id ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    <div className="font-medium truncate">{u.full_name || u.email}</div>
                    <div className="text-xs text-muted-foreground">{u.role}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              {!selectedUser ? (
                <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground text-sm">
                  Wybierz użytkownika po lewej, aby zobaczyć pełne dane oceny.
                </div>
              ) : loadingData ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <AdminUserData user={selectedUser} data={data} />
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function AdminUserData({ user, data }) {
  const { profile, sessions, responses, scores, sims, evidence, contradictions, hypo, report, vsAnalysis, vsStoryboard, vsBriefs, vsPrompts, vsAssets } = data;
  return (
    <div className="space-y-5">
      <ProfileCard profile={profile} user={user} />
      <SessionsCard sessions={sessions} />
      <ResponsesCard responses={responses} />
      <ScoresCard scores={scores} />
      <SimsCard sims={sims} />
      <EvidenceCard evidence={evidence} />
      <ContradictionsCard contradictions={contradictions} />
      <CrossValidationCard report={report} />
      <HypoCard hypo={hypo} />
      <VisualStoryCard analysis={vsAnalysis} storyboard={vsStoryboard} briefs={vsBriefs} prompts={vsPrompts} assets={vsAssets} />
      <ReportCard report={report} />
    </div>
  );
}

function VisualStoryCard({ analysis, storyboard, briefs, prompts, assets }) {
  const pipelineStages = [
    { label: "Analiza", count: analysis.length },
    { label: "Storyboard", count: storyboard.length },
    { label: "Briefy", count: briefs.length },
    { label: "Prompty", count: prompts.length },
    { label: "Grafiki", count: assets.length },
  ];
  return (
    <Card title="Potok wizualny (Visual Story)">
      <div className="flex flex-wrap gap-2 mb-4">
        {pipelineStages.map((s) => (
          <span key={s.label} className={`text-xs px-2 py-1 rounded-full ${s.count > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {s.label}: {s.count}
          </span>
        ))}
      </div>
      {assets.length === 0 && briefs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Brak danych potoku wizualnego. Uruchom pipeline na stronie Visual Story.</p>
      ) : (
        <div className="space-y-4">
          {analysis[0]?.stories?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Wybrane historie (analiza)</p>
              <div className="space-y-1">
                {analysis[0].stories.slice(0, 10).map((st, i) => (
                  <div key={i} className="text-sm border-b border-border pb-1">
                    <span className="font-medium">{st.slide_title || st.story_title || `Slajd ${i + 1}`}</span>
                    {st.infographic_type && <span className="text-xs text-muted-foreground"> · {st.infographic_type}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {briefs.map((b) => {
            const prompt = prompts.find((p) => p.slide_number === b.slide_number);
            const asset = assets.find((a) => a.slide_number === b.slide_number);
            return (
              <div key={b.id} className="rounded-xl border border-border p-3">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-xs text-muted-foreground tabular-nums">Slajd {b.slide_number}</span>
                    <h4 className="font-heading text-sm">{b.slide_title}</h4>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {asset && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${asset.generation_status === "complete" ? "bg-primary/10 text-primary" : asset.generation_status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                        gen: {asset.generation_status}
                      </span>
                    )}
                    {prompt && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${prompt.validation_status === "valid" ? "bg-primary/10 text-primary" : prompt.validation_status === "invalid" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                        wal: {prompt.validation_status}
                      </span>
                    )}
                  </div>
                </div>
                {asset?.generated_asset_url && (
                  <img src={asset.generated_asset_url} alt={asset.title} className="w-full rounded-lg mb-2 max-h-48 object-cover" />
                )}
                {b.core_message && <p className="text-xs text-muted-foreground mb-1">{b.core_message}</p>}
                {b.short_takeaway && <p className="text-xs italic text-foreground/80">→ {b.short_takeaway}</p>}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex gap-2 text-sm"><span className="text-muted-foreground min-w-28">{label}:</span><span className="font-medium">{value || "—"}</span></div>;
}

function ProfileCard({ profile, user }) {
  return (
    <Card title="Profil">
      <div className="space-y-1">
        <Row label="Imię" value={profile?.first_name} />
        <Row label="Wiek" value={profile?.age} />
        <Row label="Etap edukacji" value={profile?.education_stage} />
        <Row label="Kraj obecny" value={profile?.current_country} />
        <Row label="Kraj docelowy" value={profile?.target_country} />
        <Row label="Email" value={user?.email} />
      </div>
    </Card>
  );
}

function SessionsCard({ sessions }) {
  return (
    <Card title={`Sesje (${sessions.length})`}>
      <div className="space-y-2">
        {sessions.map((s) => (
          <div key={s.id} className="flex justify-between text-sm">
            <span>{s.module}</span>
            <span className={s.status === "complete" ? "text-primary" : "text-muted-foreground"}>{s.status}</span>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-sm text-muted-foreground">Brak sesji.</p>}
      </div>
    </Card>
  );
}

function ResponsesCard({ responses }) {
  return (
    <Card title={`Surowe odpowiedzi (${responses.length})`}>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {responses.map((r) => (
          <div key={r.id} className="text-sm border-b border-border pb-2">
            <div className="text-xs text-muted-foreground mb-1">{r.module} · {r.question_id} · {r.input_mode}</div>
            <p className="mb-1"><span className="text-muted-foreground">Pierwsza:</span> {r.first_response}</p>
            {r.reflection_response && <p><span className="text-muted-foreground">Refleksja:</span> {r.reflection_response}</p>}
            {(r.latency_ms || r.audio_duration_seconds) && (
              <p className="text-xs text-muted-foreground mt-1">latencja {r.latency_ms}ms · dźwięk {r.audio_duration_seconds}s</p>
            )}
          </div>
        ))}
        {responses.length === 0 && <p className="text-sm text-muted-foreground">Brak odpowiedzi.</p>}
      </div>
    </Card>
  );
}

function ScoresCard({ scores }) {
  return (
    <Card title={`Wyniki (${scores.length})`}>
      <div className="space-y-2">
        {scores.map((s) => (
          <div key={s.id} className="text-sm">
            <span className="font-medium">{s.module}</span>
            <pre className="text-xs bg-muted rounded p-2 mt-1 overflow-x-auto">{JSON.stringify(s.scores, null, 2)}</pre>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SimsCard({ sims }) {
  return (
    <Card title={`Symulacje (${sims.length})`}>
      <div className="space-y-3">
        {sims.map((s) => (
          <div key={s.id} className="text-sm border-b border-border pb-2">
            <div className="font-medium">{s.simulation_type}{s.wildcard_domain ? ` · ${s.wildcard_domain}` : ""}</div>
            <p className="text-xs text-muted-foreground mt-1">cieszysz się: {s.enjoyment}/10 · powtórzyłbyś: {s.repeat_willingness}/10</p>
            <p className="text-xs mt-1 line-clamp-3">{s.response_text}</p>
            {s.evaluation?.overall_simulation_performance != null && (
              <p className="text-xs text-primary mt-1">Ocena AI: {s.evaluation.overall_simulation_performance}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function EvidenceCard({ evidence }) {
  return (
    <Card title={`Pozycje dowodowe (${evidence.length})`}>
      <div className="space-y-2">
        {evidence.map((e) => (
          <div key={e.id} className="text-sm border-b border-border pb-2">
            <div className="flex gap-2 flex-wrap items-center">
              <span className={`text-xs px-1.5 py-0.5 rounded ${e.strength === "strong" ? "bg-primary/10 text-primary" : e.strength === "medium" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{e.strength}</span>
              <span className="text-xs text-muted-foreground">{e.domain}</span>
              <span className={`text-xs ${e.supports_or_contradicts === "contradicts" ? "text-destructive" : "text-muted-foreground"}`}>{e.supports_or_contradicts}</span>
            </div>
            <p className="mt-1">{e.claim}</p>
          </div>
        ))}
        {evidence.length === 0 && <p className="text-sm text-muted-foreground">Brak dowodów.</p>}
      </div>
    </Card>
  );
}

function ContradictionsCard({ contradictions }) {
  return (
    <Card title={`Sprzeczności (${contradictions.length})`}>
      <div className="space-y-2">
        {contradictions.map((c) => (
          <div key={c.id} className="text-sm border-b border-border pb-2">
            <p>{c.description}</p>
            {c.follow_up_question && <p className="text-xs text-muted-foreground mt-1">PytanieFollow-up: {c.follow_up_question}</p>}
          </div>
        ))}
        {contradictions.length === 0 && <p className="text-sm text-muted-foreground">Brak sprzeczności.</p>}
      </div>
    </Card>
  );
}

function HypoCard({ hypo }) {
  return (
    <Card title={`Hipotezy (${hypo.length})`}>
      <div className="space-y-2">
        {hypo.map((h) => (
          <div key={h.id} className="text-sm border-b border-border pb-2 flex justify-between">
            <span className="font-medium">{h.career_family}</span>
            <span className="text-muted-foreground">{h.hypothesis_type} · {Math.round(h.fit_score||0)}/{Math.round(h.confidence_score||0)}%</span>
          </div>
        ))}
        {hypo.length === 0 && <p className="text-sm text-muted-foreground">Brak hipotez.</p>}
      </div>
    </Card>
  );
}

function ReportCard({ report }) {
  return (
    <Card title="Raport końcowy (PL)">
      {!report ? <p className="text-sm text-muted-foreground">Brak raportu.</p> : (
        <div>
          {report.full_markdown_pl ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">{report.full_markdown_pl}</div>
          ) : (
            <p className="text-sm">Raport wygenerowany po polsku pojawi się tutaj po wygenerowaniu wyników (wymaga sekretów OpenAI).</p>
          )}
        </div>
      )}
    </Card>
  );
}

function CrossValidationCard({ report }) {
  const flags = report?.sections?.cross_validation || [];
  if (!flags.length) {
    return (
      <Card title="Walidacja krzyżowa">
        <p className="text-sm text-muted-foreground">Brak flag walidacji krzyżowej.</p>
      </Card>
    );
  }
  return (
    <Card title={`Walidacja krzyżowa (${flags.length})`}>
      <div className="space-y-2">
        {flags.map((f, i) => (
          <div key={i} className="text-sm border-b border-border pb-2">
            <span className={`text-xs px-1.5 py-0.5 rounded mr-2 ${f.type === "contradiction" ? "bg-destructive/10 text-destructive" : f.type === "alignment" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>{f.type}</span>
            <span>{f.description}</span>
            {f.follow_up_question && <p className="text-xs text-muted-foreground mt-1">Follow-up: {f.follow_up_question}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}