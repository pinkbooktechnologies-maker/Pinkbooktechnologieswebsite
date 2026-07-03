const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const path = require("path");

app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "..", "public")));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "pinkbooktechnologies@gmail.com",
        pass: "pnbu gcni lnvl ibkm"
    }
});

app.post("/send-message", async (req, res) => {
    try {

        const { name, email, phone, service, message } = req.body;

        await transporter.sendMail({
            from: '"Pinkbook Technologies" <pinkbooktechnologies@gmail.com>',
            to: "pinkbooktechnologies@gmail.com",
            replyTo: email,
            subject: `New Contact Form Submission - ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>

                <table border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                        <td><b>Name</b></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><b>Email</b></td>
                        <td>${email}</td>
                    </tr>
                    <tr>
                        <td><b>Phone</b></td>
                        <td>${phone}</td>
                    </tr>
                    <tr>
                        <td><b>Service</b></td>
                        <td>${service}</td>
                    </tr>
                    <tr>
                        <td><b>Message</b></td>
                        <td>${message}</td>
                    </tr>
                </table>
            `
        });

        res.json({
            success: true,
            message: "Email sent successfully."
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});