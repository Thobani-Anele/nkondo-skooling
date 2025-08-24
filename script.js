const chatlog = document.getElementById("chatlog");

function sendMessage() {
  const input = document.getElementById("userInput");
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage("You", userText);
  input.value = "";

  setTimeout(() => {
    const botResponse = getBotResponse(userText);
    appendMessage("Nkondo Bot", botResponse);
    speak(botResponse);
  }, 500);
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatlog.appendChild(msg);
  chatlog.scrollTop = chatlog.scrollHeight;
}

function getBotResponse(input) {
  input = input.toLowerCase();

  if (input.includes("hello") || input.includes("hi")) {
    return "Hello there! I'm your friendly teacher bot. How can I help you today?";
  }
  if (input.includes("study")) {
    return "You can create or join study rooms to learn with friends or meet new people!";
  }
  if (input.includes("teacher")) {
    return "Teachers can host live classes here, just like Zoom or Teams, but better!";
  }
  if (input.includes("language")) {
    return "I support multiple South African languages! Try asking me in isiZulu, Sesotho, or Afrikaans.";
  }
  return "That's a great question! I'm still learning, but soon I'll be able to answer much more.";
}

// Voice recognition
function startVoice() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Sorry, your browser doesn't support voice input.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    sendMessage();
  };
}

// Text-to-speech
function speak(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  synth.speak(utterance);
}