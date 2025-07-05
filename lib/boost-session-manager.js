const crypto = require('crypto');

class BoostSessionManager {
  constructor(timeoutMs, onPost) {
    this.sessions = {};
    this.posted = new Set();
    this.timeoutMs = timeoutMs;
    this.onPost = onPost;
  }

  getMessageHash(message) {
    return crypto.createHash('sha256').update(message || '').digest('hex').slice(0, 12);
  }

  getSessionId(event) {
    return [
      event.action,
      event.sender,
      event.episode,
      event.podcast,
      this.getMessageHash(event.message)
    ].join('-');
  }

  handleSplit(event) {
    const sessionId = this.getSessionId(event);
    if (!this.sessions[sessionId]) {
      this.sessions[sessionId] = { largest: event, timer: null };
    }
    if ((event.value_msat_total || event.value_msat || 0) > (this.sessions[sessionId].largest.value_msat_total || this.sessions[sessionId].largest.value_msat || 0)) {
      this.sessions[sessionId].largest = event;
    }
    if (this.sessions[sessionId].timer) clearTimeout(this.sessions[sessionId].timer);
    this.sessions[sessionId].timer = setTimeout(() => {
      if (!this.posted.has(sessionId) && this.sessions[sessionId].largest.action === 2 && (this.sessions[sessionId].largest.value_msat_total || this.sessions[sessionId].largest.value_msat) > 0) {
        this.onPost(this.sessions[sessionId].largest, sessionId);
        this.posted.add(sessionId);
      }
      delete this.sessions[sessionId];
    }, this.timeoutMs);
    return sessionId;
  }
}

module.exports = BoostSessionManager; 