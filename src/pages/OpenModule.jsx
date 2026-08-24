import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import VoiceQuestion from "@/components/VoiceQuestion";
import { Loader2, Check } from "lucide-react";

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
  const [responses, setResponses] = useState([]); // [{question_id, question_text, first_response, reflection_response, ...}]
  const [current, setCurrent] = useState(null); // current question { question_id, question_text, first_instinct, done }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const loadOrStart = useCallback(async () => {
    setLoading(true);
    try {
      let s = (await base44.entities.AssessmentSession.filter({ module: moduleKey })).filter((x) => x.status === "in_progress")[0];
      if (!s) {
        s = await base44.entities.AssessmentSession.create({ module: moduleKey, status: "in_progress", started_at: new Date().toISOString() });
      }
      setSession(s);
      const existing = await base44.entities.Response.filter({ session_id: s.id });
      const mapped = existing.map((r) => ({
        question_id: r.question_id, question_text: r.meta_question_text || r.question_id,
        first_response: r.first_response, reflection_response: r.reflection_response, saved: r,
      }));
      setResponses(mapped);
      await fetchNext(s.id, mapped);
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
      // graceful: if coach fails, fall back to a deterministic next question later
      console.error(err);
    }
  }

  useEffect(() => { loadOrStart(); }, [loadOrStart]);

  async function handleSave(data) {
    setSaving(true);
    try {
      const existing = responses.find((r) => r.question_id === current.question_id && r.saved?.id);
      let record;
      if (existing?.saved?.id) {
        // Never overwrite first_response. Update only reflection + metadata.
        record = await base44.entities.Response.update(existing.saved.id, {
          reflection_response: data.reflection_response || existing.saved.reflection_response,
          input_mode: data.input_mode,
          audio_file_url: data.audio_file_url || existing.saved.audio_file_url,
          latency_ms: data.latency_ms,
          audio_duration_seconds: data.audio_duration_seconds,
        });
      } else {
        record = await base44.entities.Response.create({
          session_id: session.id,
          question_id: current.question_id,
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
        { question_id: current.question_id, question_text: current.question_text, first_response: data.first_response, reflection_response: data.reflection_response, saved: record },
      ];
      setResponses(nextAnswered);
      setCurrent(null);
      await fetchNext(session.id, nextAnswered);
    } finally {
      setSaving(false);
    }
  }

  async function completeModule() {
    if (session) {
      await base44.entities.AssessmentSession.update(session.id, { status: "complete", completed_at: new Date().toISOString() });
    }
    navigate("/app");
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-heading text-3xl mb-3">Module complete.</h1>
        <p className="text-muted-foreground mb-8">Your answers are saved. You can return to the dashboard or keep exploring.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={completeModule} className="rounded-full h-12 px-6">Back to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-sm text-muted-foreground">
        Question {responses.length + 1}
      </div>
      {current ? (
        <>
          {saving && <div className="flex justify-center mb-3"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>}
          <VoiceQuestion
            key={current.question_id}
            question={current.question_text}
            firstInstinct={current.first_instinct}
            onSave={handleSave}
          />
        </>
      ) : (
        <div className="flex flex-col items-center py-20 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Your coach is considering the best next question…</p>
          <Button variant="outline" onClick={() => fetchNext(session.id, responses)} className="rounded-full mt-2">Try again</Button>
        </div>
      )}
    </div>
  );
}