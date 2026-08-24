// Minimal session-run orchestration: lets the SessionRunner guide a user
// through a session's modules and have each module return to the runner
// (instead of the dashboard) after completion.
const KEY = "cc_run_return";

export function setRunReturn(sessionId) {
  if (sessionId) sessionStorage.setItem(KEY, sessionId);
}

export function afterModule(navigate) {
  const runId = sessionStorage.getItem(KEY);
  if (runId) {
    sessionStorage.removeItem(KEY);
    navigate(`/app/run/${runId}`);
  } else {
    navigate("/app");
  }
}