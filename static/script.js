async function sendMessage() {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  const typingIndicator = document.getElementById("typingIndicator");

  const userMessage = input.value.trim();
  if (!userMessage) return;

  const time = new Date().toLocaleTimeString();
  const userBubble = document.createElement("div");
  userBubble.className = "bubble user";
  userBubble.innerHTML = `<strong>You:</strong> ${userMessage}<div class="meta">${time}</div>`;
  chatBox.appendChild(userBubble);
  input.value = "";

  typingIndicator.classList.remove("hidden");

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage })
  });

  const data = await res.json();
  console.log("Raw response from /chat:", data);
  typingIndicator.classList.add("hidden");

  const aiBubble = document.createElement("div");
  aiBubble.className = "bubble ai";
  aiBubble.innerHTML = `<strong>AI:</strong> ${data.response}<div class="meta">${new Date().toLocaleTimeString()}</div>`;

  // Copy button
  const copyBtn = document.createElement("button");
  copyBtn.textContent = "📋 Copy";
  copyBtn.className = "copyBtn";
  copyBtn.onclick = () => navigator.clipboard.writeText(data.response);

  // Emoji bar
  const emojiBar = document.createElement("div");
  emojiBar.className = "emojiBar";
  ["👍", "😂", "❓"].forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.onclick = () => alert(`You reacted with ${emoji}`);
    emojiBar.appendChild(span);
  });

  aiBubble.appendChild(copyBtn);
  aiBubble.appendChild(emojiBar);
  chatBox.appendChild(aiBubble);

  // Create audio player controls
  const audioPlayer = document.createElement("div");
  audioPlayer.className = "audio-player";

  const playPauseBtn = document.createElement("button");
  playPauseBtn.textContent = "▶️ Play";
  playPauseBtn.className = "audio-btn";

  const audio = new Audio('/static/response.mp3');
  let isPlaying = false;

  playPauseBtn.onclick = () => {
    if (!isPlaying) {
      audio.play();
      playPauseBtn.textContent = "⏸️ Pause";
    } else {
      audio.pause();
      playPauseBtn.textContent = "▶️ Play";
    }
    isPlaying = !isPlaying;
  };

  audio.onended = () => {
    playPauseBtn.textContent = "▶️ Play";
    isPlaying = false;
  };

  audioPlayer.appendChild(playPauseBtn);
  aiBubble.appendChild(audioPlayer);


  chatBox.scrollTop = chatBox.scrollHeight;
}

// Voice input with Web Speech API
const micBtn = document.getElementById("micBtn");
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  micBtn.onclick = () => {
    recognition.start();
  };

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userInput").value = transcript;
    sendMessage();
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Speech recognition not supported in this browser.";
}
window.onload = () => {
  document.getElementById("sendBtn").addEventListener("click", sendMessage);
  // ... attach other events here too (like micBtn)
};

