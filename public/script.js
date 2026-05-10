/** @format */

const API_URL = "/api/chat";
const STORAGE_KEY = "it_support_chat_history";
const EXPIRY_HOURS = 24; // Data otomatis dihapus setelah 24 jam

let conversationHistory = [];

// DOM Elements
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");

//  Inisialisasi
window.addEventListener("DOMContentLoaded", () => {
  input.focus();
  setupQuickActions();
  loadChatHistory();
});

function saveChatHistory(history) {
  const data = {
    history: history,
    savedAt: Date.now(),
    expiresAt: Date.now() + EXPIRY_HOURS * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("⚠️ Gagal menyimpan riwayat (storage penuh):", e);
  }
}

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return; // Data kadaluarsa
    }

    conversationHistory = data.history;
    conversationHistory.forEach((msg) => appendMessage(msg.role, msg.text));

    // Sembunyikan welcome card jika ada riwayat
    const welcomeCard = document.querySelector(".welcome-card");
    if (welcomeCard) welcomeCard.style.display = "none";
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function clearChatHistory() {
  localStorage.removeItem(STORAGE_KEY);
  conversationHistory = [];
  chatBox.innerHTML = "";
  location.reload(); // Reset UI ke keadaan awal
}

//  Setup Quick Actions
function setupQuickActions() {
  document.querySelectorAll(".quick-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const prompt = e.currentTarget.dataset.prompt;
      if (prompt) {
        input.value = prompt;
        form.requestSubmit();
      }
    });
  });

  // Setup tombol clear jika ada
  document
    .getElementById("clear-chat-btn")
    ?.addEventListener("click", clearChatHistory);
}

// Handle form submit
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);

  const welcomeCard = document.querySelector(".welcome-card");
  if (welcomeCard) welcomeCard.style.display = "none";

  input.value = "";
  conversationHistory.push({ role: "user", text: userMessage });
  saveChatHistory(conversationHistory); // Simpan segera

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation: conversationHistory }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    const botReply =
      data.result ||
      data.response ||
      "Maaf, saya tidak bisa memproses permintaan ini.";

    appendMessage("bot", botReply);
    conversationHistory.push({ role: "model", text: botReply });
    saveChatHistory(conversationHistory); // Simpan setelah bot menjawab
  } catch (error) {
    console.error("Chat error:", error);
    appendMessage(
      "bot",
      `⚠️ Maaf, terjadi kendala: ${error.message}. Silakan coba lagi atau hubungi tim IT secara langsung.`,
    );
    conversationHistory.pop(); // Hapus pesan terakhir jika gagal
  } finally {
    setLoading(false);
    input.focus();
  }
});

//  Render pesan
function appendMessage(sender, text) {
  const msgWrapper = document.createElement("div");
  msgWrapper.classList.add("message-wrapper", sender);

  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = formatMessage(text);

  const timestamp = document.createElement("span");
  timestamp.classList.add("timestamp");
  timestamp.textContent = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  msgWrapper.appendChild(msg);
  msgWrapper.appendChild(timestamp);
  chatBox.appendChild(msgWrapper);

  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
}

// Format pesan aman
function formatMessage(text) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br>").replace(/  /g, "&nbsp;&nbsp;");
}

// Loading state
function setLoading(isLoading) {
  input.disabled = isLoading;
  if (sendBtn) sendBtn.disabled = isLoading;

  if (isLoading) {
    const loadingId = "loading-" + Date.now();
    const loadingMsg = document.createElement("div");
    loadingMsg.classList.add("message-wrapper", "bot", "loading");
    loadingMsg.id = loadingId;
    loadingMsg.innerHTML = `
      <div class="message bot typing" role="status" aria-label="Sedang mengetik">
        <span class="typing-dot" aria-hidden="true"></span>
        <span class="typing-dot" aria-hidden="true"></span>
        <span class="typing-dot" aria-hidden="true"></span>
      </div>
      <small class="typing-text">Sedang memproses...</small>
    `;
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    chatBox.dataset.loadingId = loadingId;
  } else {
    const loadingId = chatBox.dataset.loadingId;
    if (loadingId) {
      document.getElementById(loadingId)?.remove();
      delete chatBox.dataset.loadingId;
    }
  }
}

// Keyboard shortcut
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});
