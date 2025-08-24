// ===== Session memory (clears when tab closes or logout) =====
const chatlog = document.getElementById('chatlog');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const ttsToggle = document.getElementById('tts-toggle');

// Restore past messages this session
const sess = sessionStorage.getItem('nkondo_session');
let history = sess ? JSON.parse(sess) : [];
history.forEach(m => append(m.role, m.text));

function persist(){ sessionStorage.setItem('nkondo_session', JSON.stringify(history)); }

function append(role, text){
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'me':'bot'}`;
  div.textContent = text;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
}

async function sendMessage(){
  const text = (input.value||'').trim();
  if(!text) return;
  input.value='';
  history.push({role:'user', text});
  append('user', text);
  persist();

  try{
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        message: text,
        history: history.slice(-10) // small window
      })
    });
    if(!res.ok){ throw new Error('Network'); }
    const data = await res.json();
    const reply = data.reply || 'Sorry, I could not answer that just now.';

    history.push({role:'assistant', text: reply});
    append('assistant', reply);
    persist();

    if(ttsToggle.checked){ speak(reply, detectLang(text)); }
  }catch(e){
    const fallback = 'I’m having trouble reaching the AI right now. Please try again.';
    history.push({role:'assistant', text: fallback});
    append('assistant', fallback);
    persist();
  }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => { if(e.key==='Enter') sendMessage(); });

// ===== Voice input (hold to talk on desktop) =====
let rec;
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  rec = new SR();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = 'en-ZA';
  rec.onresult = e => {
    const transcript = e.results[0][0].transcript;
    input.value = transcript;
    sendMessage();
  };
}

voiceBtn.addEventListener('mousedown', ()=> rec && rec.start());
voiceBtn.addEventListener('mouseup',   ()=> rec && rec.stop());
voiceBtn.addEventListener('touchstart',()=> rec && rec.start(), {passive:true});
voiceBtn.addEventListener('touchend',  ()=> rec && rec.stop());

// ===== Text-to-speech (friendly teacher voice) =====
function speak(text, lang){
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang || 'en-ZA';
  const voices = speechSynthesis.getVoices();
  const pref = voices.find(v => /South Africa|en-ZA|Female/i.test(v.name+v.lang)) || voices[0];
  if(pref) u.voice = pref;
  u.rate = 0.95; u.pitch = 1.0;
  speechSynthesis.speak(u);
}

// Simple language detection by characters/keywords
function detectLang(sample){
  const s = sample.toLowerCase();
  if(/(yebo|sawubona|ngiyabonga)/.test(s)) return 'zu-ZA';
  if(/(dumelang|ke a leboga)/.test(s)) return 'tn-ZA';
  if(/(molo|enkosi)/.test(s)) return 'xh-ZA';
  if(/(dumela|kea leboha)/.test(s)) return 'st-ZA';
  return 'en-ZA';
}

// ===== Rooms (demo, linkable + local notes) =====
const roomName = document.getElementById('room-name');
const createRoom = document.getElementById('create-room');
const joinRoom = document.getElementById('join-room');
const roomLink = document.getElementById('room-link');
const roomArea = document.querySelector('.room-area');
const roomTitle = document.getElementById('room-title');
const roomNotes = document.getElementById('room-notes');

function getRoomFromHash(){
  const id = location.hash.startsWith('#room=') ? decodeURIComponent(location.hash.slice(6)) : null;
  return id;
}

function openRoom(id){
  roomTitle.textContent = 'Room: ' + id;
  roomArea.hidden = false;
  roomNotes.value = localStorage.getItem('room:'+id) || '';
  roomNotes.oninput = () => localStorage.setItem('room:'+id, roomNotes.value);
}

createRoom.addEventListener('click', () => {
  const id = (roomName.value||'').trim() || ('Room-'+Math.random().toString(36).slice(2,8));
  const url = location.origin + location.pathname + '#room=' + encodeURIComponent(id);
  roomLink.innerHTML = `Share this link: <a href="${url}">${url}</a>`;
  openRoom(id);
  location.hash = '#room=' + encodeURIComponent(id);
});

joinRoom.addEventListener('click', () => {
  const id = (roomName.value||'').trim();
  if(!id) return alert('Enter a room name to open');
  location.hash = '#room=' + encodeURIComponent(id);
  openRoom(id);
});

window.addEventListener('hashchange', () => {
  const r = getRoomFromHash();
  if(r) openRoom(r);
});

const initialRoom = getRoomFromHash();
if(initialRoom) openRoom(initialRoom);

// ===== FAQ render =====
const FAQ = [{"q": "What is Nkondo Schooling?", "a": "An online space where learners and teachers meet for live classes, study socially, and get instant AI help."}, {"q": "Can learners study without a teacher?", "a": "Yes. Learners can create and join study rooms via shareable links to revise together at any time."}, {"q": "Does it support South African languages?", "a": "Yes. The voice bot can understand and reply in English, isiZulu, Sesotho, isiXhosa and more (browser voices permitting)."}, {"q": "Does Nkondo AI remember chats?", "a": "It remembers during your logged-in session and clears when you log out or close the tab."}, {"q": "How is this different from Zoom/Teams?", "a": "Nkondo adds an always-on tutor, social study rooms, and voice-enabled Q&A designed for schoolwork."}];
const faqList = document.getElementById('faq-list');
FAQ.forEach(item => {
  const d = document.createElement('details');
  const s = document.createElement('summary'); s.textContent = item.q;
  const p = document.createElement('p'); p.textContent = item.a;
  d.appendChild(s); d.appendChild(p);
  faqList.appendChild(d);
});
