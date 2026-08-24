import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2, RotateCcw, Plus, Volume2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

// Displays a single open question, supports voice-first + text, first_response + reflection.
// Calls onSave({ first_response, reflection_response, input_mode, audio_file_url, latency_ms, audio_duration_seconds })
export default function VoiceQuestion({ question, firstInstinct, onSave, savedResponse }) {
  const rec = useVoiceRecorder();
  const [textMode, setTextMode] = useState(!!savedResponse?.first_response && !savedResponse?.audio_file_url);
  const [firstResponse, setFirstResponse] = useState(savedResponse?.first_response || "");
  const [reflection, setReflection] = useState(savedResponse?.reflection_response || "");
  const [showReflection, setShowReflection] = useState(!!savedResponse?.reflection_response);
  const [showFirstInstinctPrompt, setShowFirstInstinctPrompt] = useState(firstInstinct && !savedResponse);
  const startTimeRef = useRef(Date.now());
  const commitLockRef = useRef(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setShowFirstInstinctPrompt(firstInstinct && !savedResponse);
  }, [question]);

  // When transcription completes, populate first response (first instinct path).
  useEffect(() => {
    if (rec.transcript && !firstResponse) {
      setFirstResponse(rec.transcript);
    }
  }, [rec.transcript]);

  const latencyMs = () => Date.now() - startTimeRef.current;

  const mode = () => {
    if (rec.audioUrl && firstResponse !== rec.transcript) return "voice_plus_edit";
    if (rec.audioUrl) return "voice";
    return "text";
  };

  async function handleSave() {
    if (commitLockRef.current) return;
    commitLockRef.current = true;
    try {
      await onSave({
        first_response: firstResponse,
        reflection_response: showReflection ? reflection : "",
        input_mode: mode(),
        audio_file_url: rec.audioUrl || "",
        latency_ms: latencyMs(),
        audio_duration_seconds: rec.duration || 0,
      });
    } finally {
      commitLockRef.current = false;
    }
  }

  function speak(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card border border-border p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <p className="font-heading text-xl sm:text-2xl text-foreground leading-snug flex-1">{question}</p>
          <button
            onClick={() => speak(question)}
            className="shrink-0 mt-1 text-muted-foreground hover:text-primary transition-colors"
            title="Listen to the question"
            aria-label="Listen to the question"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {showFirstInstinctPrompt && (
          <p className="mt-4 text-sm text-primary/80 italic">
            Don't search for the ideal answer. Start answering intuitively.
          </p>
        )}
      </div>

      {rec.isRecording && (
        <div className="flex items-center justify-center gap-3 py-8 rounded-2xl bg-primary/5 border border-primary/20">
          <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <span className="text-primary font-medium tabular-nums">{rec.duration}s</span>
          <Button size="sm" variant="outline" onClick={rec.stopRecording}>
            <Square className="w-4 h-4 mr-1.5" /> Stop
          </Button>
        </div>
      )}

      {rec.isProcessing && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Transcribing your answer…</span>
        </div>
      )}

      {rec.error && (
        <p className="text-sm text-muted-foreground bg-muted/50 border border-border rounded-xl p-3">{rec.error}</p>
      )}

      {!rec.isRecording && !rec.isProcessing && (
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            variant="default"
            className="h-14 rounded-full text-base gap-2.5 w-full"
            onClick={rec.startRecording}
          >
            <Mic className="w-5 h-5" />
            {firstResponse ? "Record again" : "Record your answer"}
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setTextMode(true)}
          >
            Type instead
          </Button>
        </div>
      )}

      {(firstResponse || textMode) && !rec.isRecording && !rec.isProcessing && (
        <div className="space-y-3 animate-in fade-in duration-300">
          {(rec.audioUrl || textMode) && (
            <p className="text-sm text-muted-foreground">
              {rec.audioUrl ? "This is how I understood your answer:" : "Your answer:"}
            </p>
          )}
          <textarea
            value={firstResponse}
            onChange={(e) => setFirstResponse(e.target.value)}
            placeholder="Write your answer…"
            className="w-full min-h-[140px] rounded-xl border border-border bg-background p-4 text-[15px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex flex-wrap gap-2">
            {showReflection ? (
              <>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Add a reflection — anything you want to add or nuance?"
                  className="w-full min-h-[100px] rounded-xl border border-border bg-muted/30 p-4 text-[15px] leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={handleSave} disabled={!firstResponse.trim()} className="ml-auto">
                  Save
                </Button>
                {rec.audioUrl && !rec.isProcessing && (
                  <Button variant="outline" onClick={rec.startRecording}>
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Record again
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowReflection(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> I want to add something
                </Button>
                <Button onClick={handleSave} disabled={!firstResponse.trim()} className="ml-auto">
                  Save
                </Button>
                {rec.audioUrl && !rec.isRecording && (
                  <Button variant="ghost" onClick={rec.startRecording}>
                    <RotateCcw className="w-4 h-4 mr-1.5" /> Record again
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}