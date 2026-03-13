const nodemailer = require('nodemailer');

// ─── EMAIL CONFIGURATION ──────────────────────────────────────────────────
// Create transporter with Gmail or other SMTP service
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or 'smtp.gmail.com'
    auth: {
      user: process.env.EMAIL_USER, // Your email from .env
      pass: process.env.EMAIL_PASS  // Your app password from .env
    }
  });
};

// ─── EMAIL TEMPLATES ──────────────────────────────────────────────────────

const getEmailTemplate = (status, studentName, internshipTitle, companyName, feedback = '') => {
  const statusConfig = {
    reviewed: {
      subject: `📋 Your application for ${internshipTitle} is under review`,
      emoji: '📋',
      color: '#3B82F6',
      message: 'Good news! Your application has been reviewed by our team.',
      action: 'We are currently evaluating your profile and will get back to you soon.'
    },
    shortlisted: {
      subject: `🎯 You've been shortlisted for ${internshipTitle}!`,
      emoji: '🎯',
      color: '#F59E0B',
      message: 'Congratulations! You have been shortlisted.',
      action: 'You are now among the top candidates. The company will contact you for the next steps.'
    },
    interview: {
      subject: `📞 Interview scheduled for ${internshipTitle}`,
      emoji: '📞',
      color: '#8B5CF6',
      message: 'Great news! You have been selected for an interview.',
      action: 'The company will reach out to you shortly with interview details. Please check your email regularly.'
    },
    selected: {
      subject: `🎉 Congratulations! You got the ${internshipTitle} internship!`,
      emoji: '🎉',
      color: '#10B981',
      message: 'Congratulations! You have been selected for the internship.',
      action: 'The company will contact you with onboarding details and the next steps.'
    },
    rejected: {
      subject: `Application update for ${internshipTitle}`,
      emoji: '📌',
      color: '#6B7280',
      message: 'Thank you for applying to this position.',
      action: 'Unfortunately, we have decided to move forward with other candidates. We encourage you to apply for other opportunities on InternHub.'
    }
  };

  const config = statusConfig[status] || statusConfig.reviewed;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600; }
    .header p { color: #BFDBFE; margin: 8px 0 0 0; font-size: 14px; }
    .content { padding: 40px 30px; }
    .status-badge { display: inline-block; background: ${config.color}; color: #FFFFFF; padding: 12px 24px; border-radius: 50px; font-size: 20px; font-weight: 600; margin-bottom: 24px; }
    .greeting { font-size: 18px; color: #1F2937; margin-bottom: 16px; font-weight: 600; }
    .message { font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px; }
    .info-box { background: #F9FAFB; border-left: 4px solid ${config.color}; padding: 20px; margin: 24px 0; border-radius: 4px; }
    .info-box strong { color: #1F2937; display: block; margin-bottom: 8px; font-size: 14px; }
    .info-box p { color: #6B7280; margin: 0; font-size: 14px; line-height: 1.5; }
    .feedback-box { background: #FFFBEB; border: 1px solid #FCD34D; padding: 16px; border-radius: 8px; margin: 20px 0; }
    .feedback-box strong { color: #92400E; display: block; margin-bottom: 8px; font-size: 13px; }
    .feedback-box p { color: #78350F; margin: 0; font-size: 14px; line-height: 1.5; }
    .cta-button { display: inline-block; background: ${config.color}; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .cta-button:hover { opacity: 0.9; }
    .footer { background: #F9FAFB; padding: 30px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer p { color: #6B7280; font-size: 13px; margin: 8px 0; }
    .social-links { margin: 16px 0; }
    .social-links a { display: inline-block; margin: 0 8px; color: #6B7280; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎯 InternHub</h1>
      <p>Your Internship Management Platform</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="status-badge">${config.emoji} ${status.charAt(0).toUpperCase() + status.slice(1)}</div>
      
      <div class="greeting">Hi ${studentName},</div>
      
      <div class="message">${config.message}</div>

      <!-- Internship Details -->
      <div class="info-box">
        <strong>📋 Internship Details</strong>
        <p><strong>Position:</strong> ${internshipTitle}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
      </div>

      ${feedback ? `
      <!-- Feedback from Company -->
      <div class="feedback-box">
        <strong>💬 Message from ${companyName}</strong>
        <p>${feedback}</p>
      </div>
      ` : ''}

      <!-- Next Steps -->
      <div class="message">${config.action}</div>

      <!-- CTA Button -->
      <center>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-applications" class="cta-button">
          View My Applications →
        </a>
      </center>

      <div class="message" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
        <strong>Pro Tip:</strong> Keep your profile updated and continue applying to more internships to increase your chances!
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>InternHub</strong> - Find Your Dream Internship</p>
      <p>This is an automated message. Please do not reply to this email.</p>
      <div class="social-links">
        <a href="#">LinkedIn</a> • 
        <a href="#">Twitter</a> • 
        <a href="#">Instagram</a>
      </div>
      <p style="font-size: 12px; color: #9CA3AF; margin-top: 16px;">
        © 2025 InternHub. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// ─── SEND EMAIL FUNCTION ──────────────────────────────────────────────────

const sendApplicationStatusEmail = async (studentEmail, studentName, internshipTitle, companyName, status, feedback = '') => {
  try {
    const transporter = createTransporter();
    const statusConfig = {
      reviewed: `📋 Your application for ${internshipTitle} is under review`,
      shortlisted: `🎯 You've been shortlisted for ${internshipTitle}!`,
      interview: `📞 Interview scheduled for ${internshipTitle}`,
      selected: `🎉 Congratulations! You got the ${internshipTitle} internship!`,
      rejected: `Application update for ${internshipTitle}`
    };

    const mailOptions = {
      from: `"InternHub" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: statusConfig[status] || `Application update for ${internshipTitle}`,
      html: getEmailTemplate(status, studentName, internshipTitle, companyName, feedback)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    // Don't throw error - we don't want email failure to break the application
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApplicationStatusEmail
};
