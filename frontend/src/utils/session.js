// Session management utility
// Generates and manages a unique session ID for each user/device

const SESSION_KEY = 'recruit_ai_session_id';

/**
 * Generate a unique session ID
 */
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Get or create a session ID
 * This persists across page reloads via localStorage
 */
export function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Clear the current session (useful for testing)
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Get session headers to include in API requests
 */
export function getSessionHeaders() {
  return {
    'X-Session-ID': getSessionId()
  };
}
