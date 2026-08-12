import type { Registration, User } from '@/types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateCertificatePdf(registration: Registration, user?: User | null) {
  const studentName = escapeHtml(user?.fullName || 'Sinh viên HUFLIT');
  const studentId = escapeHtml(user?.studentId || 'HUFLIT Student');
  const eventTitle = escapeHtml(registration.eventTitle || 'Sự kiện HUFLIT Campus');
  const eventDate = registration.eventStartAt
    ? new Date(registration.eventStartAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('vi-VN');
  const certId = escapeHtml(`CERT-HUFLIT-${registration.id.substring(0, 8).toUpperCase()}`);
  const safeEventDate = escapeHtml(eventDate);

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Giấy Chứng Nhận - ${studentName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Montserrat:wght@400;500;600;700&display=swap');
    
    @page {
      size: A4 landscape;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f4f6f9;
      font-family: 'Montserrat', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .certificate-container {
      width: 1000px;
      height: 700px;
      background: #ffffff;
      padding: 40px;
      box-sizing: border-box;
      position: relative;
      border: 12px solid #1E5AA8;
      outline: 4px solid #C8102E;
      outline-offset: -16px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      background-image: radial-gradient(#1e5aa8 0.5px, transparent 0.5px);
      background-size: 24px 24px;
      background-color: #ffffff;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo {
      height: 65px;
      margin-bottom: 10px;
    }
    .faculty-title {
      font-size: 14px;
      font-weight: 700;
      color: #1E5AA8;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .cert-title {
      font-family: 'Cinzel', serif;
      font-size: 36px;
      font-weight: 800;
      color: #C8102E;
      letter-spacing: 3px;
      margin: 15px 0 5px 0;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 14px;
      color: #555;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .content {
      text-align: center;
      margin-top: 30px;
    }
    .presented-to {
      font-size: 15px;
      color: #666;
      font-style: italic;
    }
    .student-name {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 700;
      color: #1E5AA8;
      margin: 10px 0 5px 0;
      text-transform: uppercase;
      border-bottom: 2px solid #C8102E;
      display: inline-block;
      padding-bottom: 4px;
    }
    .student-id {
      font-size: 14px;
      font-weight: 600;
      color: #444;
      margin-bottom: 25px;
    }
    .reason {
      font-size: 16px;
      color: #333;
      line-height: 1.6;
      max-width: 750px;
      margin: 0 auto;
    }
    .event-title {
      font-weight: 700;
      color: #1E5AA8;
      font-size: 20px;
      display: block;
      margin: 8px 0;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 50px;
      padding: 0 40px;
    }
    .qr-box {
      text-align: center;
    }
    .qr-img {
      width: 90px;
      height: 90px;
      border: 1px solid #ddd;
      padding: 4px;
      background: #fff;
    }
    .cert-id {
      font-size: 10px;
      color: #888;
      margin-top: 4px;
      font-family: monospace;
    }
    .signature-box {
      text-align: center;
    }
    .sig-title {
      font-size: 13px;
      font-weight: 700;
      color: #333;
      text-transform: uppercase;
    }
    .sig-space {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cinzel', serif;
      font-size: 22px;
      color: #1E5AA8;
      font-weight: 700;
      font-style: italic;
    }
    .sig-name {
      font-size: 14px;
      font-weight: 700;
      color: #1E5AA8;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.04;
      width: 400px;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <img src="/fit-huflit.png" class="watermark" alt="Watermark" />
    
    <div class="header">
      <img src="/fit-huflit.png" class="logo" alt="HUFLIT" />
      <div class="faculty-title">TRƯỜNG ĐẠI HỌC NGOẠI NGỮ – TIN HỌC TP. HỒ CHÍ MINH</div>
      <div class="faculty-title" style="color: #C8102E; margin-top: 2px;">KHOA CÔNG NGHỆ THÔNG TIN</div>
      <div class="cert-title">GIẤY CHỨNG NHẬN</div>
      <div class="subtitle">CERTIFICATE OF PARTICIPATION</div>
    </div>

    <div class="content">
      <div class="presented-to">Chứng nhận sinh viên / This is to certify that</div>
      <div class="student-name">${studentName}</div>
      <div class="student-id">Mã số sinh viên (MSSV): ${studentId}</div>
      <div class="reason">
        Đã hoàn thành tham gia sự kiện campus:
        <span class="event-title">"${eventTitle}"</span>
        Diễn ra vào ngày <strong>${safeEventDate}</strong> tại HUFLIT Campus.
      </div>
    </div>

    <div class="footer">
      <div class="qr-box">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://huflit.edu.vn/verify?cert=${certId}" class="qr-img" alt="QR Code" />
        <div class="cert-id">${certId}</div>
      </div>
      <div class="signature-box">
        <div class="sig-title">BCH KHOA CÔNG NGHỆ THÔNG TIN</div>
        <div class="sig-space">HUFLIT FIT</div>
        <div class="sig-name">TRƯỞNG KHOA CNTT</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(htmlContent);
    win.document.close();
  }
}
