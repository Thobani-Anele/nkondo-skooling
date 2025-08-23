// Chat + AI Helper (client-side demo)
const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

const PROFANITY = ['badword1', 'badword2']; // extend as needed

function addMsg(from, text){
  const item = document.createElement('div');
  item.className = 'chat-item ' + (from === 'You' ? 'me' : '');
  item.innerHTML = `<div class="from">${from}</div><div class="bubble">${text}</div>`;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function aiReply(userText){
  const t = userText.toLowerCase();
  if (PROFANITY.some(w => t.includes(w))) {
    addMsg('AI Bot', 'Message blocked: please keep it respectful.');
    return;
  }
  if (t.includes('where') && t.includes('class')) {
    addMsg('AI Bot', 'The live class is on this page ↓. Scroll to the video panel or use the “Open in new tab” link.');
  } else if (t.includes('join')) {
    addMsg('AI Bot', 'Click “Enter Live Class” at the top or open the direct room link.');
  } else if (t.includes('help')) {
    addMsg('AI Bot', 'You can ask about joining, muting, screen sharing, or using the whiteboard. I also block rude language.');
  } else {
    addMsg('AI Bot', `I heard: “${userText}”. For deeper answers, we’ll connect a full AI later.`);
  }
}

addMsg('AI Bot','Hi! I’m Nkondo Bot. Ask me anything to get started.');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  addMsg('You', text);
  chatInput.value = '';
  setTimeout(()=> aiReply(text), 500);
});

document.querySelectorAll('.bot-actions button').forEach(btn => {
  btn.addEventListener('click', () => {
    const kind = btn.dataset.tip;
    if (kind === 'tips') addMsg('AI Bot','Tip: Use a headset and stable internet for best quality.');
    if (kind === 'rules') addMsg('AI Bot','Rules: Be respectful, stay on topic, and ask clear questions.');
  });
});

// Whiteboard
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
let drawing = false;
let color = document.getElementById('wbColor').value;

function resizeCanvas(){
  // keep internal pixels in sync
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  // reset transform to avoid scale compounding
  ctx.setTransform(1,0,0,1,0,0);
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  ctx.scale(ratio, ratio);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

canvas.addEventListener('pointerdown', (e)=>{
  drawing = true;
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
});
canvas.addEventListener('pointermove', (e)=>{
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();
});
['pointerup','pointerleave','pointercancel'].forEach(ev=>{
  canvas.addEventListener(ev, ()=> drawing = false);
});

document.getElementById('wbColor').addEventListener('change', (e)=>{
  color = e.target.value;
});

document.getElementById('wbClear').addEventListener('click', ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
});
document.getElementById('wbSave').addEventListener('click', ()=>{
  const tmp = document.createElement('a');
  tmp.download = 'whiteboard.png';
  tmp.href = canvas.toDataURL('image/png');
  tmp.click();
});
