// api/contact.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  // ---- CORS headers ----
  res.setHeader('Access-Control-Allow-Origin', '*'); // 👈 允許任何來源（開發方便）
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // ---- Method check ----
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, message, _gotcha } = req.body || {};
    if (_gotcha) return res.status(200).json({ ok: true }); // 蜜罐防 bot

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: 'name, email, message は必須です。' });
    }

    if (!process.env.RESEND_API_KEY || !process.env.TO_EMAIL) {
      return res
        .status(500)
        .json({ error: 'メール送信用の環境変数が未設定です。' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM =
      (process.env.FROM_EMAIL && process.env.FROM_EMAIL.trim()) ||
      'onboarding@resend.dev';
    const TO = process.env.TO_EMAIL;

    await resend.emails.send({
      from: `Contact Form <${FROM}>`,
      to: [TO],
      reply_to: email,
      subject: 'サイトからのお問い合わせ',
      html: `
        <h3>新しいお問い合わせ</h3>
        <p><b>お名前:</b> ${escapeHtml(name)}</p>
        <p><b>メール:</b> ${escapeHtml(email)}</p>
        <p><b>内容:</b><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
      text: `お名前: ${name}\nメール: ${email}\n内容:\n${message}`,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('送信エラー:', err);
    return res.status(500).json({ error: '送信エラーが発生しました。' });
  }
}

function escapeHtml(s = '') {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        m
      ]
  );
}
