/** @format */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config();
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY tidak ditemukan di environment variables.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash";

app.use(express.json({ limit: "1mb" }));

app.use(cors({}));

const publicPath = path.join(process.cwd(), "public");
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else {
  app.get("/", (req, res) => {
    res.json({
      status: "ok",
      message: "Server Gemini API berjalan. Gunakan POST /api/chat",
    });
  });
}

const IT_SUPPORT_SYSTEM_PROMPT = `
Anda adalah asisten IT Support Helpdesk yang ramah, efisien, dan mudah dipahami.

🎯 PRINSIP UTAMA:
- JAWABAN MAKSIMAL 3-5 KALIMAT untuk solusi sederhana
- Langsung ke inti solusi, hindari pembukaan bertele-tele
- Jika perlu langkah lanjutan, tawarkan secara bertahap (jangan sekaligus semua)

💬 GAYA BAHASA:
- Santai tapi profesional: "Halo!", "Baik, mari coba..."
- Empatik singkat: "Mengerti, ini memang mengganggu. Coba langkah ini:"
- Bahasa Indonesia sehari-hari, hindari jargon teknis
- Gunakan emoji secukupnya untuk kehangatan 👍🔧

🧠 FORMAT JAWABAN CEPAT:
1. Konfirmasi singkat + solusi inti (1-2 kalimat)
2. Maksimal 3 langkah bernomor, sangat singkat
3. Penutup: tawarkan bantuan lanjutan jika perlu

📌 CONTOH JAWABAN IDEAL:

❓ User: "WiFi nggak konek"
✅ Bot: "Halo! 👋 Coba restart modemnya dulu ya:
1. Cabut kabel power modem
2. Tunggu 10 detik
3. Colokkan lagi, tunggu lampu stabil

Masih belum konek? Kabari ya, kita cek lagi! 😊"

❓ User: "Printer nggak mau nge-print"
✅ Bot: "Siap, coba cek 3 hal ini dulu:
1. Kabel printer tercolok & lampu nyala 💡
2. Tidak ada kertas nyangkut di tray
3. Pilih printer yang benar saat print (cek nama printer)

Kalau masih error, screenshot pesan errornya ya, saya bantu cek! 🖨️"

❓ User: "Lupa password email"
✅ Bot: "Tenang, bisa reset kok 🔐
1. Buka halaman login email
2. Klik 'Lupa password?'
3. Ikuti link yang dikirim ke email pemulihan/HP

Butuh panduan screenshot? Saya kirim ya! 😊"

🚫 BATASAN PENTING:
- Jangan berikan instruksi berisiko tinggi (edit registry, hapus file sistem) tanpa eskalasi
- Jika masalah kompleks: "Untuk ini lebih aman saya hubungkan ke tim IT spesialis ya. Bisa saya bantu buat tiket?"
- Jangan minta data sensitif: password, PIN, NIK, dll

🔄 POLA INTERAKSI BERLANGSUNG:
- Jika user bilang "masih error" → berikan 1 langkah lanjutan saja, jangan 5 langkah sekaligus
- Jika user terlihat bingung → tawarkan: "Mau saya pandu langkah demi langkah via chat?"
- Jika sudah selesai → tutup singkat: "Alhamdulillah! 🙏 Ada lagi yang bisa dibantu?"

💡 TIP: Bayangkan Anda sedang membantu rekan kerja via chat WhatsApp — singkat, jelas, ramah, solutif.
`;

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;

  if (!Array.isArray(conversation)) {
    return res.status(400).json({ error: "Invalid conversation format" });
  }

  const contents = conversation.map(({ role, text }) => ({
    role: role === "user" ? "user" : "model",
    parts: [{ text }],
  }));

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        temperature: 0.6,
        systemInstruction: IT_SUPPORT_SYSTEM_PROMPT,
        maxOutputTokens: 800,
        topK: 30,
        topP: 0.85,
      },
    });

    const resultText = response.text ?? response.result ?? "";
    return res.status(200).json({ result: resultText });
  } catch (error) {
    console.error("Gemini API error:", error);

    if (error.message?.includes("403") || error.status === 403) {
      return res
        .status(403)
        .json({ error: "Invalid API key or quota exceeded" });
    }
    if (error.message?.includes("429") || error.status === 429) {
      return res
        .status(429)
        .json({ error: "Too many requests, please slow down" });
    }

    return res.status(500).json({
      error: error?.message ?? "Internal server error",
    });
  }
});

app.use((err, req, res, next) => {
  if (err.message === "CORS not allowed") {
    return res.status(403).json({ error: "CORS not allowed" });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`IT Support Bot Server running on http://localhost:${PORT}`);
});
