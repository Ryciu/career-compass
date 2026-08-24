import { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Voice recorder using MediaRecorder. Records, uploads via UploadFile, transcribes via backend function.
// Never loses an answer: transcript failures are surfaced, not swallowed.
export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(0);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError("");
    setTranscript("");
    setAudioUrl("");
    setDuration(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: blob.type });
        setIsProcessing(true);
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          setAudioUrl(file_url);
          const res = await base44.functions.invoke("transcribeAudio", { audio_url: file_url });
          const text = res?.data?.transcript || "";
          setTranscript(text);
          if (!text) setError("Transcription returned no text. You can type your answer instead.");
        } catch (err) {
          setError("Transcription failed. You can type your answer instead — your response is not lost.");
        } finally {
          setIsProcessing(false);
        }
      };
      mr.start();
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      setIsRecording(true);
    } catch (err) {
      setError("Microphone access denied or unavailable. You can type your answer instead.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    setIsRecording(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    audioUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    setTranscript,
    _getMr: () => mediaRecorderRef.current,
  };
}