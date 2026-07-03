const nodemailer = require("nodemailer");

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    try {
        const { name, email, phone, service, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "pinkbooktechnologies@gmail.com",
                pass: "pnbu gcni lnvl ibkm"
            }
        });

        await transporter.sendMail({
            from: '"Pinkbook Technologies" <pinkbooktechnologies@gmail.com>',
            to: "pinkbooktechnologies@gmail.com",
            replyTo: email,
            subject: `New Contact Form Submission - ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
                    <tr><td><b>Name</b></td><td>${name}</td></tr>
                    <tr><td><b>Email</b></td><td>${email}</td></tr>
                    <tr><td><b>Phone</b></td><td>${phone}</td></tr>
                    <tr><td><b>Service</b></td><td>${service}</td></tr>
                    <tr><td><b>Message</b></td><td>${message}</td></tr>
                </table>
            `
        });

        res.json({ success: true, message: "Email sent successfully." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};