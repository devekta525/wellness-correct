const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`Email skipped (not configured): ${subject} to ${to}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendOrderConfirmation = async (order, user) => {
  await sendEmail({
    to: user.email,
    subject: `Order Confirmed - #${order.orderNumber} | Wellness_fuel`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Order Confirmed! 🎉</h2>
        <p>Hi ${user.name}, your order has been placed successfully.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Estimated Delivery:</strong> 3-7 business days</p>
        </div>
        <p>Thank you for shopping with <strong>Wellness_fuel</strong>!</p>
      </div>
    `,
  });
};

const sendPasswordReset = async (user, resetUrl) => {
  await sendEmail({
    to: user.email,
    subject: 'Password Reset - Wellness_fuel',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Reset Your Password</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click below (valid for 10 minutes):</p>
        <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

const sendWelcome = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Wellness_fuel!',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to Wellness_fuel! 🛍️</h2>
        <p>Hi ${user.name}, welcome to Wellness_fuel - your AI-powered shopping destination.</p>
        <p>Start exploring thousands of products with personalized recommendations!</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendOrderConfirmation, sendPasswordReset, sendWelcome };
