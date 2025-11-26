
// ===============================================
//     FirePro One ⚡ AI Assistant Backend (PRO)
// ===============================================

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const path = require("path");
require("dotenv").config();

// ===== إعداد OpenAI =====
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ===== إنشاء تطبيق Express =====
const app = express();
const PORT = 3000;

// ===== ميدل وير =====
app.use(cors());
app.use(express.json());

// ===== تقديم الملفات الثابتة (HTML + CSS + الصور) =====
app.use(express.static(__dirname));

// ===== الصفحة الرئيسية =====
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ===== واجهة المحادثة API =====
app.post("/api/chat", async (req, res) => {
    try {
        const { message, system, lang, mode } = req.body;

        // الاستدعاء لـ OpenAI
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        system ||
                        "You are FirePro One AI Assistant specialized in fire alarm systems, NFPA codes, fire risk assessment, safety consultancy, and emergency response guidance.",
                },
                {
                    role: "user",
                    content: message || "",
                },
            ],
        });

        res.json({
            reply: completion.choices[0].message.content,
        });
    } catch (err) {
        console.error("❌ API Error:", err);
        res.json({
            reply: "⚠ حدث خطأ أثناء الاتصال بالخادم. تأكد من أن الخادم يعمل وأن المفتاح صحيح.",
        });
    }
});

// ===== تشغيل السيرفر =====
app.listen(PORT, () => {
  console.log('FirePro One AI Server running on: http://localhost:' + PORT);
});




