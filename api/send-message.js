const nodemailer = require("nodemailer");

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { name, email, company = "", service, message, source = "Website" } = req.body || {};
  if (!name || !email || !service || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Please complete all required fields." });
  }

  const mailUser = process.env.GMAIL_USER;
  const mailPassword = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.CONTACT_TO_EMAIL || mailUser;

  if (!mailUser || !mailPassword || !recipient) {
    console.error("Contact mail environment variables are not configured.");
    return res.status(503).json({ success: false, message: "Enquiry service unavailable." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: mailUser, pass: mailPassword },
    });

    await transporter.sendMail({
      from: `"PinkBook Technologies" <${mailUser}>`,
      to: recipient,
      replyTo: email,
      subject: `New website enquiry — ${name}`,
      html: `
        <h2>New PinkBook website enquiry</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td><strong>Company</strong></td><td>${escapeHtml(company)}</td></tr>
          <tr><td><strong>Service</strong></td><td>${escapeHtml(service)}</td></tr>
          <tr><td><strong>Source</strong></td><td>${escapeHtml(source)}</td></tr>
          <tr><td><strong>Message</strong></td><td>${escapeHtml(message).replaceAll("\n", "<br>")}</td></tr>
        </table>`,
    });

    return res.json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error("Contact email failed:", error.message);
    return res.status(500).json({ success: false, message: "Unable to send the enquiry." });
  }
};
