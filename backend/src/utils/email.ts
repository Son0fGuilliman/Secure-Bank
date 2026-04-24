import dns from 'dns';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

// ─── Lazy-initialized transporter (resolve IPv4 secara eksplisit) ───
let cachedTransporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
    if (cachedTransporter) return cachedTransporter;

    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const secure = port === 465;

    // Resolve hostname ke IPv4 secara eksplisit
    // Alpine Linux (musl) mengabaikan dns-result-order, jadi kita harus manual
    let resolvedHost = host;
    try {
        const addresses = await dns.promises.resolve4(host);
        if (addresses.length > 0) {
            resolvedHost = addresses[0];
            console.log(`📧 Resolved ${host} → IPv4: ${resolvedHost}`);
        }
    } catch (err) {
        console.warn(`⚠️ IPv4 resolve gagal untuk ${host}, pakai hostname langsung`);
    }

    cachedTransporter = nodemailer.createTransport({
        host: resolvedHost,
        port,
        secure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            // Wajib: TLS verifikasi tetap pakai hostname asli, bukan IP
            servername: host,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 10_000,
    });

    console.log(`📧 Email transport ready: ${resolvedHost}:${port} (secure=${secure})`);
    return cachedTransporter;
}

export const sendOTPEmail = async (
    email: string,
    nama: string,
    otp: string
): Promise<void> => {
    const transporter = await getTransporter();
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
    const transporter = await getTransporter();
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