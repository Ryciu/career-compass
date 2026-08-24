import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import VoiceQuestion from "@/components/VoiceQuestion";
import { QUESTION_TEXT, questionIndex } from "@/data/coachQuestions";
import { afterModule } from "@/lib/sessionRun";
import { Loader2, Check, Pencil, X, ChevronRight, MessageSquare } from "lucide-react";

const MODULE_MAP = {
  "who-am-i": "session1",
  sport: "sport",
  gaming: "gaming",
  money: "money",
  "decision-ownership": "decision_ownership",
};

export default function OpenModule() {
  const { moduleId } = useParams();
  const moduleKey = MODULE_MAP[moduleId];
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [responses, setResponses] = useState([]); // [{question_id, question_text, first_response, reflection_response, saved}]
  const [current, setCurrent] = useState(null); // next unanswered question
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false); // session marked complete
  const [editingId, setEditingId] = useState(null); // question_id open for explicit edit
  const [skipped, setSkipped] = useState([]); // question_ids advanced past without answering

  const loadOrStart = useCallback(async () => {
    setLoading(true);
    setEditingId(null);
    setSkipped([]);
    try {
      // Module-scoped restore: collect EVERY response ever given for this module
      // (newest per question), across any session, so re-entry never shows blank.
      const all = await base44.entities.Response.filter({ module: moduleKey }, "-created_date");
      const byId = new Map();
      all.forEach((r) => { if (r.question_id && !byId.has(r.question_id)) byId.set(r.question_id, r); });
      const mapped = [...byId.values()].map((r) => ({
        question_id: r.question_id,
        question_text: r.question_text || QUESTION_TEXT[r.question_id] || r.question_id,
        first_response: r.first_response || "",
        reflection_response: r.reflection_response || "",
        saved: r,
      }));
      setResponses(mapped);

      // Active session: prefer an in_progress one (to continue), else newest.
      let sessions = await base44.entities.AssessmentSession.filter({ module: moduleKey }, "-created_date");
      let s = sessions.find((x) => x.status === "in_progress") || sessions[0];
      if (!s) {
        s = await base44.entities.AssessmentSession.create({ module: moduleKey, status: "in_progress", started_at: new Date().toISOString() });
      }
      setSession(s);

      if (s.status === "complete") {
        setDone(true);
        setCurrent(null);
      } else {
        setDone(false);
        await fetchNext(s.id, mapped);
      }
    } finally {
      setLoading(false);
    }
  }, [moduleKey]);

  async function fetchNext(sessionId, answered) {
    try {
      const res = await base44.functions.invoke("coachNextTurn", {
        module: moduleKey,
        answered: answered.map((a) => ({ question_id: a.question_id, first_response: a.first_response, reflection_response: a.reflection_response })),
        contradictions: [],
      });
      const out = res?.data;
      if (!out) return;
      if (out.done) {
        setDone(true);
        setCurrent(null);
      } else {
        setCurrent({ question_id: out.question_id, question_text: out.question_text, first_instinct: out.first_instinct });
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { loadOrStart(); }, [loadOrStart]);

  // Advance to the next question WITHOUT answering the current one, so the
  // user can move through individual questions instead of being forced to
  // complete the whole module before reviewing/editing.
  function skipQuestion() {
    if (!current) return;
    const id = current.question_id;
    const payload = [
      ...responses.map((r) => ({ question_id: r.question_id, first_response: r.first_response, reflection_response: r.reflection_response })),
      { question_id: id, first_response: "", reflection_response: "" },
    ];
    if (!skipped.includes(id)) setSkipped((p) => [...p, id]);
    setCurrent(null);
    setLoading(true);
    fetchNext(session.id, payload).finally(() => setLoading(false));
  }

  async function handleSave(data) {
    setSaving(true);
    try {
      // Explicit edit of an existing answer
      if (editingId) {
        const ex = responses.find((r) => r.question_id === editingId);
        if (ex?.saved?.id) {
          const record = await base44.entities.Response.update(ex.saved.id, {
            first_response: data.first_response,
            reflection_response: data.reflection_response || "",
            input_mode: data.input_mode,
            audio_file_url: data.audio_file_url || "",
            latency_ms: data.latency_ms,
            audio_duration_seconds: data.audio_duration_seconds,
          });
          setResponses((prev) => prev.map((r) => r.question_id === editingId ? { ...r, first_response: record.first_response, reflection_response: record.reflection_response, saved: record } : r));
        }
        setEditingId(null);
        return;
      }

      // New answer
      const existing = responses.find((r) => r.question_id === current.question_id && r.saved?.id);
      let record;
      if (existing?.saved?.id) {
        record = await base44.entities.Response.update(existing.saved.id, {
          first_response: data.first_response,
          reflection_response: data.reflection_response || "",
          input_mode: data.input_mode,
          audio_file_url: data.audio_file_url || "",
          latency_ms: data.latency_ms,
          audio_duration_seconds: data.audio_duration_seconds,
        });
      } else {
        record = await base44.entities.Response.create({
          session_id: session.id,
          question_id: current.question_id,
          question_text: current.question_text,
          module: moduleKey,
          first_response: data.first_response,
          reflection_response: data.reflection_response,
          input_mode: data.input_mode,
          audio_file_url: data.audio_file_url,
          latency_ms: data.latency_ms,
          audio_duration_seconds: data.audio_duration_seconds,
        });
      }
      const nextAnswered = [
        ...responses.filter((r) => r.question_id !== current.question_id),
        { question_id: current.question_id, question_text: current.question_text, first_response: record.first_response, reflection_response: record.reflection_response, saved: record },
      ];
      setResponses(nextAnswered);
      setCurrent(null);
      await fetchNext(session.id, nextAnswered);
    } finally {
      setSaving(false);
    }
  }

  async function completeModule() {
    if (session && session.status !== "complete") {
      await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });
    }
    afterModule(navigate);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  const editing = editingId ? responses.find((r) => r.question_id === editingId) : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Saved answers — read-only by default; edit opens on explicit click */}
      {responses.length > 0 && (
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Your saved answers</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">{responses.length} answered</span>
              {!editingId && (
                <Button onClick={completeModule} size="sm" className="h-8 rounded-full gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Save & complete
                </Button>
              )}
            </div>
          </div>
          {responses.map((r, i) => {
            if (editingId === r.question_id) {
              return (
                <div key={r.question_id} className="rounded-2xl border border-primary/40 bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-primary font-medium">
                      Question {questionIndex(moduleKey, r.question_id) || i + 1}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-7 px-2 text-muted-foreground gap-1">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </div>
                  <VoiceQuestion
                    key={`edit-${r.question_id}`}
                    question={r.question_text}
                    savedResponse={r.saved}
                    onSave={handleSave}
                  />
                </div>
              );
            }
            return (
              <div key={r.question_id} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-medium tabular-nums">
                      {questionIndex(moduleKey, r.question_id) || "·"}
                    </span>
                    <p className="font-heading text-[17px] text-foreground leading-snug">{r.question_text}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingId(r.question_id); setCurrent(null); }} className="h-8 px-2.5 text-muted-foreground hover:text-primary shrink-0 gap-1.5">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                </div>
                <div className="mt-3 pl-10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Your answer</span>
                  </div>
                  {r.first_response ? (
                    <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">{r.first_response}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No answer recorded yet.</p>
                  )}
                  {r.reflection_response && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line border-t border-border pt-3">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70 block mb-1">Reflection</span>{r.reflection_response}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active editing goes above inside the list; new-question flow below */}
      {!editingId && (
        done ? (
          <div className="max-w-xl mx-auto text-center py-10 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl mb-3">Module complete.</h1>
            <p className="text-muted-foreground mb-8">Your answers are saved above. Tap Edit on any question to revise it.</p>
            <Button onClick={completeModule} className="rounded-full h-12 px-6">Back to dashboard</Button>
          </div>
        ) : current ? (
          <>
            <div className="mb-2 text-sm text-muted-foreground">Question {responses.length + 1}</div>
            {saving && <div className="flex justify-center mb-3"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
            <VoiceQuestion
              key={current.question_id}
              question={current.question_text}
              firstInstinct={current.first_instinct}
              onSave={handleSave}
            />
            <Button variant="ghost" onClick={skipQuestion} className="w-full text-muted-foreground">
              Skip to next question
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your coach is considering the best next question…</p>
            <Button variant="outline" onClick={() => fetchNext(session.id, responses)} className="rounded-full mt-2">Try again</Button>
          </div>
        )
      )}

      {!editingId && !done && responses.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button variant="ghost" onClick={completeModule} className="rounded-full text-muted-foreground gap-1">
            Finish & back to dashboard <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}