document.getElementById('send-btn').addEventListener('click', async () => {
  const input = document.getElementById('user-input').value;
  const chat = document.getElementById('chat-container');
  const p = document.createElement('p'); p.textContent = "You: " + input;
  chat.appendChild(p);
  document.getElementById('user-input').value = "";
  // Placeholder for OpenAI API response
  const response = "Hello! I am your AI tutor. Let's learn together!";
  const p2 = document.createElement('p'); p2.textContent = "AI: " + response;
  chat.appendChild(p2);
});
