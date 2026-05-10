# 🛠️ Helpdesk IT Support AI

Chatbot bantuan teknis berbasis AI yang dirancang khusus untuk membantu **pengguna awam, pegawai kantoran, dan tenaga kesehatan** menyelesaikan masalah IT sehari-hari dengan cepat, ramah, dan mudah dipahami.

Jawaban disajikan **singkat, to-the-point, dan interaktif** seperti percakapan WhatsApp, tanpa penjelasan teknis bertele-tele yang membingungkan.

---

## 📌 Mengapa Aplikasi Ini Dibuat?
- 🎯 **Target Pengguna Sibuk**: Pegawai & tenaga kesehatan tidak punya waktu membaca panduan panjang.
- 💬 **Bahasa Manusiawi**: Menghindari jargon IT. Jika ada istilah teknis, langsung dijelaskan dengan analogi sederhana.
- ⚡ **Respon Cepat**: Maksimal 3–5 kalimat per solusi. Langkah lanjutan ditawarkan bertahap jika diperlukan.
- 🔒 **Privasi Terjaga**: Tidak menyimpan data sensitif, riwayat chat hanya tersimpan sementara di browser pengguna.

---

## 🛠️ Teknologi yang Digunakan
| Komponen | Teknologi |
|----------|-----------|
| **Backend** | Node.js + Express.js |
| **AI Engine** | Google Gemini API (`gemini-2.5-flash`) |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Penyimpanan Lokal** | `localStorage` dengan sistem auto-expire |
| **Environment** | `dotenv` untuk konfigurasi aman |
| **Styling** | CSS Modern (Flexbox/Grid, CSS Variables, Animasi ringan) |

---

## ✨ Fitur Utama
| Fitur | Deskripsi |
|-------|-----------|
| 💬 **AI Respon Singkat & Solutif** | Jawaban langsung ke inti, format percakapan santai-profesional |
| 🎯 **Quick Action Buttons** | Tombol siap-klik untuk masalah umum: WiFi, Printer, Password, Email, dll |
| 💾 **Riwayat Chat Tersimpan Otomatis** | Tetap ada saat reload/disconnect. Otomatis dihapus setelah 24 jam |
| 📱 **Responsive & Modern UI** | Tampilan bersih, font mudah dibaca, nyaman di HP/Tablet/Desktop |
| ⌨️ **Keyboard Friendly** | `Enter` = kirim, `Shift+Enter` = baris baru |
| ⏳ **Typing Indicator & Loading State** | Animasi "sedang mengetik" & disable input saat proses |
| 🛡️ **Keamanan & Privacy** | Input di-sanitasi, tidak minta password/data pribadi, safety settings Gemini aktif |
| 🔄 **Error Handling Ramah** | Pesan error jelas + saran menghubungi IT langsung jika gagal |

---

## 🚀 Cara Menjalankan

### 1. Persyaratan
- Node.js `v18` atau lebih baru
- API Key Google Gemini ([dapatkan di AI Studio](https://aistudio.google.com/))

### 2. Instalasi
```bash
# Clone atau unduh proyek ini
cd helpdesk-it-support

# Install dependencies
npm install

3. Konfigurasi Environment
Buat file .env di root folder:

GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000

4. Jalankan Server

npm start
# atau
node index.js

5. Akses Aplikasi
Buka browser dan kunjungi:
👉 http://localhost:3000

Sistem Penyimpanan Riwayat Chat

    Data percakapan disimpan di localStorage browser pengguna.
    Auto-expire: Data otomatis dihapus setelah 24 jam dari pesan terakhir.
    Aman untuk privasi: Tidak dikirim ke server, tidak bisa diakses perangkat lain.
    Catatan: Jika localStorage penuh atau dibersihkan browser, riwayat akan hilang. Ini sesuai desain untuk menjaga privasi & kepatuhan kebijakan IT rumah sakit/kantor.