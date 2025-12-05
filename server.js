// ==========================
// FirePro One AI - Server.js
// ==========================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// OpenAI Client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =====================
// فحص السيرفر
// =====================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "FirePro One AI server is running",
    port: PORT,
  });
});

// ================================
// برومبت تحليل حوادث الحرائق
// ================================
const fireIncidentPrompt = `
أنت خبير محترف في تحليل حوادث الحرائق (Fire Investigation)، ولديك خبرة واسعة 
في NFPA 921 و NFPA 72 و NFPA 70 والكود السعودي والدفاع المدني.

قم بتحليل أي حادث حريق يقدمه المستخدم حسب الخطوات التالية:

1) تحليل وصف الحادث:
- موقع بداية الحريق المحتمل
- العامل المسبب (تماس – شرر – حمل زائد – لهب – تخزين خطير – مادة قابلة)
- العوامل التي ساعدت على الانتشار

2) التحليل الزمني:
- كيف بدأ الحريق؟
- كيف اكتُشف؟
- كيف انتشر؟
- كيف كانت أول استجابة؟

3) تقييم أنظمة السلامة:
- هل يوجد نظام إنذار؟ وهل عمل؟
- هل يوجد رش آلي؟ وهل فشل؟
- عدد الطفايات وحالتها
- توافق الموقع مع NFPA والكود السعودي

4) الأسباب المحتملة:
- قدم 3–5 احتمالات مرتبة حسب القوة

5) الأخطاء البشرية والفنية:
- سوء تشغيل – سوء صيانة – تخزين خطير – قواطع كهربائية – تمديدات تالفة
- أخطاء إدارة الطوارئ

6) التوصيات:
- تحسينات هندسية وتشغيلية
- تدريب الفريق
- تحديث أنظمة السلامة
- خطة منع التكرار

إذا كانت البيانات ناقصة اطلب من المستخدم: نوع المنشأة – وقت الحريق – بدايته – الأنظمة المتوفرة.

ابدأ تحليلًا كاملًا ومنسقًا وواضحًا.
`;

// =============================
// الدالة الرئيسية للمساعد
// =============================
async function handleAssistantRequest(req, res) {
  try {
    const { user, lang = "ar", mode = "chat" } = req.body;

    // قراءة استفسار المستخدم
    const userMessage = user || "";

    // تجهيز الرسائل المرسلة للنموذج
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
          أنت مساعد FirePro One AI المتخصص في:
          - تحليل الحرائق
          - تصميم أنظمة الإنذار
          - مراجعة المخططات
          - التدريب والتأهيل
          - الاستشارات الفنية
          - الكود السعودي والدفاع المدني و NFPA

          إذا احتوى نص المستخدم على:
          (تحليل حريق – تحليل حادث – سبب الحريق – وقع حريق – أسباب الاشتعال)
          فعليك استخدام برومبت تحليل الحوادث التالي:

          ${fireIncidentPrompt}

          أما في الأسئلة الأخرى:
          استخدم خبرتك في أنظمة NFPA والكود السعودي.
          `
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      temperature: 0.4,
    });

    // النص النهائي من المساعد
    const replyText =
      completion.choices?.[0]?.message?.content?.trim() ||
      "لم يتم توليد رد من المساعد.";

    res.json({ reply: replyText });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "حدث خطأ في معالجة الطلب." });
  }
}

// =============================
// نقطة استقبال طلبات الذكاء
// =============================
app.post("/ai", handleAssistantRequest);

// =============================
// تشغيل السيرفر
// =============================
app.listen(PORT, () => {
  console.log(`FirePro One AI server running on port ${PORT}`);
});
