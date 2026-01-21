"use server";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
});

interface EmailData {
    email: string;
    name: string;
    message: string;
}

interface FromData {
    email: string;
    name: string;
}

async function sendEmail(
    to: string,
    from: FromData,
    subject: string,
    data: EmailData
) {
    try {
        // Input validation
        if (!process.env.MAILERSEND_API_KEY) {
            throw new Error("MAILERSEND_API_KEY is not configured");
        }

        if (!to?.trim() || !from?.email?.trim() || !from?.name?.trim() || 
                !subject?.trim() || !data?.email?.trim() || !data?.name?.trim() || 
                !data?.message?.trim()) {
            throw new Error("All fields are required and cannot be empty");
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to) || !emailRegex.test(data.email)) {
            throw new Error("Invalid email format");
        }

        const sentFrom = new Sender(from.email, from.name);
        const recipients = [new Recipient(to)];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(subject)
            .setHtml(`
                <!DOCTYPE html>
                <html lang="nl">
                    <head>
                        <meta charset="utf-8">
                        <title>julianoostwal.dev</title>
                        <meta name="description" content="julianoostwal.dev">
                        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                            }
                            .container {
                                max-width: 600px;
                                margin: 20px auto;
                                background-color: #ffffff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            .header {
                                text-align: center;
                                padding-bottom: 20px;
                                border-bottom: 1px solid #dddddd;
                            }
                            .header h3 {
                                margin: 0;
                                color: #333333;
                            }
                            .content {
                                font-size: 16px;
                                line-height: 1.6;
                                color: #333333;
                            }
                            .content p {
                                margin: 0 0 10px;
                            }
                            .footer {
                                text-align: center;
                                padding-top: 20px;
                                border-top: 1px solid #dddddd;
                                font-size: 12px;
                                color: #777777;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h3>Je hebt een nieuwe e-mail van ${data.name.replace(/[<>]/g, '')}</h3>
                                <p>Hun e-mailadres is: ✉️${data.email.replace(/[<>]/g, '')}</p>
                            </div>
                            <div class="content">
                                <p><strong>Bericht:</strong></p>
                                <p>${data.message.replace(/[<>]/g, '').replace(/\n/g, '<br>')}</p>
                            </div>
                            <div class="footer">
                                <p>julianoostwal.dev</p>
                            </div>
                        </div>
                    </body>
                </html>
            `);

        const response = await mailerSend.email.send(emailParams);
        
        if (response.statusCode !== 202) {
            throw new Error(`Failed to send email: ${response.statusCode}`);
        }

        return { data: "Email sent successfully!", error: null };
    } catch (error) {
        console.error("Email sending error:", error);
        
        let errorMessage = "Error sending email";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        return { data: null, error: errorMessage };
    }
}

export { sendEmail };