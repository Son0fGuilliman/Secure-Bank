import dns from 'dns';
import nodemailer from 'nodemailer';

// Railway tidak support IPv6 — paksa DNS resolve ke IPv4
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
});

// Log email config on startup (tanpa credentials)
console.log(`📧 Email transport: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}:${process.env.EMAIL_PORT || '587'} (secure=${process.env.EMAIL_PORT === '465'})`);

export const sendOTPEmail = async (
    email: string,
    nama: string,
    otp: string
): Promise<void> => {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Kode OTP Login SecureBank',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px">
        <h2 style="color:#1B3A6B">SecureBank</h2>
        <hr/>
        <p>Halo <strong>${nama}</strong>,</p>
        <p>Kode OTP login kamu:</p>
        <div style="background:#EFF6FF;border:2px solid #2563EB;padding:24px;
                    text-align:center;border-radius:8px;margin:20px 0">
          <span style="font-size:40px;font-weight:bold;letter-spacing:12px;
                       color:#1B3A6B;font-family:monospace">${otp}</span>
        </div>
        <p>Berlaku <strong>5 menit</strong> dan hanya bisa digunakan <strong>sekali</strong>.</p>
        <p style="color:#991B1B;font-size:13px">
          ⚠️ Jangan bagikan kode ini kepada siapapun.
        </p>
      </div>
    `,
    });
};

export const sendTransferNotification = async (
    email: string,
    nama: string,
    type: 'debit' | 'kredit',
    nominal: number,
    txHash: string,
    keterangan?: string
): Promise<void> => {
    const isDebit = type === 'debit';
    const fmt = new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR',
    }).format(nominal);

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `[SecureBank] ${isDebit ? 'Transfer Keluar' : 'Transfer Masuk'} ${fmt}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px">
        <h2 style="color:#1B3A6B">SecureBank</h2>
        <hr/>
        <p>Halo <strong>${nama}</strong>, transaksi berikut berhasil diproses:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px;border:1px solid #E2E8F0;font-weight:bold">Jenis</td>
              <td style="padding:8px;border:1px solid #E2E8F0">${isDebit ? '🔴 Transfer Keluar' : '🟢 Transfer Masuk'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #E2E8F0;font-weight:bold">Nominal</td>
              <td style="padding:8px;border:1px solid #E2E8F0">${fmt}</td></tr>
          ${keterangan ? `<tr><td style="padding:8px;border:1px solid #E2E8F0;font-weight:bold">Keterangan</td>
              <td style="padding:8px;border:1px solid #E2E8F0">${keterangan}</td></tr>` : ''}
          <tr><td style="padding:8px;border:1px solid #E2E8F0;font-weight:bold">Bukti Blockchain</td>
              <td style="padding:8px;border:1px solid #E2E8F0;font-family:monospace;font-size:11px;word-break:break-all">${txHash}</td></tr>
        </table>
      </div>
    `,
    });
};