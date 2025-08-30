/* Add this script (merge with your existing script.js if you already have one).
   It controls: theme persistence, chat open/close, notebook local save/load, and small UX helpers.
*/

(function () {
  const root = document.documentElement;
  const THEME_KEY = 'nk-theme';
  const NOTE_PREFIX = 'nk-notes-'; // storage key per room: nk-notes-<roomId>

  // --- Theme persistence & toggle ------------------------------------------------
  function applySavedTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light') root.classList.add('light');
    else root.classList.remove('light');
  }
  applySavedTheme();

  document.querySelectorAll('#theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isLight = root.classList.toggle('light');
      localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
      updateThemeButtons();
    });
  });

  function updateThemeButtons(){
    document.querySelectorAll('#theme-toggle').forEach(btn => {
      btn.textContent = root.classList.contains('light') ? '🌤️' : '🌙';
    });
    document.querySelectorAll('.nk-chat-btn').forEach(b => {
      /* chat button uses CSS variables; no text update needed */
    });
  }
  updateThemeButtons();

  // --- Mobile nav toggle (keeps existing behavior) -------------------------------
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // --- Floating assistant behavior ------------------------------------------------
  const chatOpenBtn = document.getElementById('nk-chat-open');
  const chatModal = document.getElementById('nk-chat-modal');
  const chatCloseBtn = document.getElementById('nk-chat-close');
  const chatSendBtn = document.getElementById('nk-send');
  const chatInput = document.getElementById('nk-input');
  const messages = document.getElementById('nk-messages');

  function openChat(){
    if (chatModal) chatModal.setAttribute('aria-hidden','false');
  }
  function closeChat(){
    if (chatModal) chatModal.setAttribute('aria-hidden','true');
  }
  if (chatOpenBtn) chatOpenBtn.addEventListener('click', openChat);
  if (chatCloseBtn) chatCloseBtn.addEventListener('click', closeChat);

  // Very small front-end placeholder for chat -- integrate server call here.
  if (chatSendBtn && chatInput && messages) {
    chatSendBtn.addEventListener('click', async () => {
      const text = chatInput.value && chatInput.value.trim();
      if (!text) return;
      appendMessage('You', text);
      chatInput.value = '';

      appendMessage('Assistant', 'Thinking...');
      // TODO: Replace the following fetch with your backend that calls OpenAI or your AI model.
      // Example: POST /api/assistant with { input: text, context: ... } -> returns assistant reply
      try {
        // placeholder delay + faux response
        await new Promise(r => setTimeout(r, 700));
        // remove the 'Thinking...' and append actual
        const thinking = messages.querySelector('.message.assistant.thinking');
        if (thinking) thinking.remove();
        appendMessage('Assistant', 'This is a placeholder reply. Connect script.js to your AI backend to get real answers.');
      } catch (err) {
        console.error(err);
        appendMessage('Assistant', 'Sorry, something went wrong.');
      }
    });
  }

  function appendMessage(author, text){
    const el = document.createElement('div');
    el.className = 'message ' + (author === 'Assistant' ? 'assistant' : 'user');
    if (author === 'Assistant' && text === 'Thinking...') el.classList.add('thinking');
    el.innerHTML = '<strong>' + escapeHtml(author) + ':</strong> <div>' + escapeHtml(text) + '</div>';
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

  // --- Notebook: local-storage-backed per-room notes -----------------------------
  // Expected usage: virtual classroom pages include an element with id="notebook" and data-room-id="room-123"
  function Notebook(rootEl) {
    this.root = rootEl;
    this.roomId = rootEl && rootEl.dataset && rootEl.dataset.roomId ? rootEl.dataset.roomId : 'default';
    this.storageKey = NOTE_PREFIX + this.roomId;
    this.notes = []; // {id, title, content, updated}
    this.activeId = null;

    // UI pieces
    this.sidebar = rootEl.querySelector('.notebook-sidebar');
    this.editor = rootEl.querySelector('.notebook-editor');
    this.titleInput = rootEl.querySelector('.note-title');
    this.exportBtn = rootEl.querySelector('.note-export');
    this.newBtn = rootEl.querySelector('.note-new');
    this.deleteBtn = rootEl.querySelector('.note-delete');

    // load
    this.loadNotes();
    this.renderSidebar();
    this.bind();
  }
  Notebook.prototype.loadNotes = function(){
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      // create starter note
      this.notes = [{
        id: 'n1',
        title: 'Quick notes',
        content: 'Start your notes here. Everything is saved locally in your browser for this room.',
        updated: Date.now()
      }];
      this.activeId = 'n1';
      this.saveNotes();
    } else {
      try {
        this.notes = JSON.parse(raw);
        this.activeId = this.notes.length ? this.notes[0].id : null;
      } catch(e){
        console.error('Failed to parse notes', e);
        this.notes = [];
      }
    }
  };
  Notebook.prototype.saveNotes = function(){
    localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
  };
  Notebook.prototype.renderSidebar = function(){
    if (!this.sidebar) return;
    this.sidebar.innerHTML = '';
    this.notes.forEach(n => {
      const node = document.createElement('div');
      node.className = 'note-item' + (n.id === this.activeId ? ' active':'' );
      node.dataset.id = n.id;
      node.textContent = n.title || 'Untitled';
      node.addEventListener('click', () => { this.openNote(n.id); });
      this.sidebar.appendChild(node);
    });
    // update editor
    this.openNote(this.activeId);
  };
  Notebook.prototype.openNote = function(id){
    const n = this.notes.find(x => x.id === id);
    if (!n) return;
    this.activeId = n.id;
    if (this.titleInput) this.titleInput.value = n.title;
    if (this.editor) this.editor.innerHTML = n.content;
    this.renderSidebar();
  };
  Notebook.prototype.createNote = function(){
    const id = 'n' + (Date.now());
    const note = { id, title: 'Untitled', content: '', updated: Date.now() };
    this.notes.unshift(note);
    this.activeId = id;
    this.saveNotes();
    this.renderSidebar();
  };
  Notebook.prototype.deleteActive = function(){
    if (!this.activeId) return;
    this.notes = this.notes.filter(n => n.id !== this.activeId);
    this.activeId = this.notes.length ? this.notes[0].id : null;
    this.saveNotes();
    this.renderSidebar();
  };
  Notebook.prototype.exportActive = function(){
    const n = this.notes.find(x => x.id === this.activeId);
    if (!n) return;
    const blob = new Blob([`# ${n.title}\n\n${n.content}`], {type:'text/markdown'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (n.title || 'note') + '.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  Notebook.prototype.bind = function(){
    const self = this;
    if (!this.editor) return;
    // auto-save editor content
    let saveTimer = null;
    this.editor.addEventListener('input', () => {
      if (!self.activeId) return;
      const n = self.notes.find(x => x.id === self.activeId);
      if (!n) return;
      n.content = self.editor.innerHTML;
      n.updated = Date.now();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => { self.saveNotes(); self.renderSidebar(); }, 600);
    });
    if (this.titleInput) {
      this.titleInput.addEventListener('input', () => {
        if (!self.activeId) return;
        const n = self.notes.find(x => x.id === self.activeId);
        if (!n) return;
        n.title = this.titleInput.value;
        n.updated = Date.now();
        self.saveNotes();
        self.renderSidebar();
      });
    }
    if (this.newBtn) this.newBtn.addEventListener('click', () => self.createNote());
    if (this.deleteBtn) this.deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this note?')) self.deleteActive();
    });
    if (this.exportBtn) this.exportBtn.addEventListener('click', () => self.exportActive());
  };

  // Initialize any notebook blocks on the page
  document.querySelectorAll('.notebook').forEach(nEl => {
    new Notebook(nEl);
  });

  // Keyboard shortcut: t toggles theme; n focuses notebook editor if exists
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 't') {
      document.querySelectorAll('#theme-toggle').forEach(b => b.click());
    }
    if (e.key.toLowerCase() === 'n') {
      const ed = document.querySelector('.notebook-editor[contenteditable="true"]');
      if (ed) ed.focus();
    }
  });

  // expose small helpers to window for debugging
  window.Nkondo = window.Nkondo || {};
  window.Nkondo.applySavedTheme = applySavedTheme;

})();