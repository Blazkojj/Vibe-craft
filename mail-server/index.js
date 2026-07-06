import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.MAIL_API_KEY;

if (!API_KEY) {
  console.error('Brak MAIL_API_KEY w .env — wygeneruj losowy ciąg i ustaw go');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'poczta2666244.home.pl',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: parseInt(process.env.SMTP_PORT || '465', 10) === 465,
  auth: {
    user: process.env.SMTP_USER || 'support@zenexcode.pl',
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify().then(() => {
  console.log('[SMTP] Połączenie z serwerem poczty OK');
}).catch((err) => {
  console.error('[SMTP] Błąd połączenia:', err.message);
});

function auth(req, res, next) {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Nieautoryzowany' });
  }
  next();
}

app.get('/health', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ ok: true, smtp: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, smtp: 'error', error: err.message });
  }
});

app.get('/test-send', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"Zenexcode Test" <${process.env.SMTP_USER || 'support@zenexcode.pl'}>`,
      to: process.env.SMTP_USER || 'support@zenexcode.pl',
      subject: 'Test SMTP — Zenexcode mail-server',
      text: 'To jest testowa wiadomość z serwera mailowego Zenexcode.',
    });
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('[TEST-SEND] Błąd:', err);
    res.status(500).json({ ok: false, error: err.message, code: err.code, command: err.command });
  }
});

app.post('/send-order-email', auth, async (req, res) => {
  const {
    email, planName, price, creditsLabel, validUntil, nick, orderId
  } = req.body || {};

  if (!email || !planName || !price) {
    return res.status(400).json({ error: 'Brak wymaganych pól: email, planName, price' });
  }

  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Potwierdzenie zakupu — Zenexcode</title>
</head>
<body style="margin:0;padding:0;background:#1C1E24;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#E5E7EB;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1C1E24;padding:2rem 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#22252C;border:1px solid #2C2F36;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#FF6B00;padding:1.5rem 2rem;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:1.4rem;font-weight:800;letter-spacing:-0.02em;">ZENEXCODE</h1>
          <p style="margin:0.25rem 0 0;color:rgba(255,255,255,0.85);font-size:0.8rem;">Platforma do tworzenia pluginów Minecraft z AI</p>
        </td></tr>
        <tr><td style="padding:2rem;">
          <h2 style="margin:0 0 1rem;color:#fff;font-size:1.2rem;">Dziękujemy za zakup! 🎉</h2>
          <p style="margin:0 0 1rem;color:#9CA3AF;font-size:0.95rem;line-height:1.6;">
            Cześć <strong style="color:#E5E7EB;">${nick || 'Witaj'}</strong>,
            potwierdzamy otrzymanie Twojej wpłaty i aktywowaliśmy Twój pakiet na koncie Zenexcode.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1C1E24;border:1px solid #2C2F36;border-radius:8px;margin:1.25rem 0;">
            <tr><td style="padding:1rem 1.25rem;border-bottom:1px solid #2C2F36;">
              <span style="color:#6B7280;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Pakiet</span>
              <div style="color:#FF6B00;font-size:1.05rem;font-weight:700;margin-top:0.25rem;">${planName}</div>
            </td></tr>
            <tr><td style="padding:1rem 1.25rem;border-bottom:1px solid #2C2F36;">
              <span style="color:#6B7280;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Kwota wpłaty</span>
              <div style="color:#E5E7EB;font-size:1.05rem;font-weight:600;margin-top:0.25rem;">${price} zł</div>
            </td></tr>
            <tr><td style="padding:1rem 1.25rem;border-bottom:1px solid #2C2F36;">
              <span style="color:#6B7280;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Kredyty / Tokeny</span>
              <div style="color:#E5E7EB;font-size:1.05rem;font-weight:600;margin-top:0.25rem;">${creditsLabel || '—'}</div>
            </td></tr>
            <tr><td style="padding:1rem 1.25rem;">
              <span style="color:#6B7280;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;">Pakiet ważny do</span>
              <div style="color:#22C55E;font-size:1.05rem;font-weight:600;margin-top:0.25rem;">${validUntil || '—'}</div>
            </td></tr>
          </table>

          <p style="margin:1.25rem 0 0.5rem;color:#9CA3AF;font-size:0.85rem;line-height:1.6;">
            Twoje konto zostało zasobone i jest gotowe do pracy. Zaloguj się w panelu, aby zacząć korzystać z AI.
          </p>

          <div style="text-align:center;margin:1.5rem 0;">
            <a href="https://zenexcode.pl/dashboard" style="background:#FF6B00;color:#fff;text-decoration:none;padding:0.75rem 1.5rem;border-radius:8px;font-weight:600;display:inline-block;font-size:0.9rem;">Otwórz panel →</a>
          </div>

          ${orderId ? `<p style="margin:1.5rem 0 0;color:#4B5563;font-size:0.72rem;font-family:monospace;">Nr zamówienia: ${orderId}</p>` : ''}
        </td></tr>
        <tr><td style="padding:1.25rem 2rem;background:#1C1E24;border-top:1px solid #2C2F36;">
          <p style="margin:0;color:#6B7280;font-size:0.78rem;line-height:1.6;text-align:center;">
            Pozdrawiamy,<br><strong style="color:#9CA3AF;">Zespół Zenexcode</strong><br>
            <a href="https://zenexcode.pl" style="color:#FF6B00;text-decoration:none;">zenexcode.pl</a> ·
            <a href="mailto:support@zenexcode.pl" style="color:#FF6B00;text-decoration:none;">support@zenexcode.pl</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  const text = `ZENEXCODE — Potwierdzenie zakupu

Cześć ${nick || ''},

Dziękujemy za zakup! Twój pakiet został aktywowany.

Pakiet: ${planName}
Kwota: ${price} zł
Kredyty: ${creditsLabel || '—'}
Ważny do: ${validUntil || '—'}

Zaloguj się na https://zenexcode.pl/dashboard aby korzystać.

Pozdrawiamy,
Zespół Zenexcode
support@zenexcode.pl
${orderId ? `Nr zamówienia: ${orderId}` : ''}
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: `"Zenexcode" <${process.env.SMTP_USER || 'support@zenexcode.pl'}>`,
      to: email,
      subject: `Potwierdzenie zakupu — pakiet ${planName} | Zenexcode`,
      text,
      html,
    });
    console.log(`[MAIL] Wysłano do ${email} (msgid=${info.messageId})`);
    res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('[MAIL] Błąd wysyłki:', err);
    res.status(500).json({
      error: 'Błąd wysyłki SMTP',
      details: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[mail-server] słucha na porcie ${PORT}`);
});
