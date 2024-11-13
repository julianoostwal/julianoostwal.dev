"use server";
import sendgrid, { MailDataRequired } from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail(to: string, from: { email: string, name: string }, subject: string, data: { email: string, name: string, message: string }) {
    try {
        
        if (!to || !from.email || !from.name || !subject || !data.email || !data.name || !data.message) {
            throw new Error("All fields are required");
        }

        const emailData: MailDataRequired = {
            to,
            from,
            subject,
            html: `
            <!DOCTYPE html>
            <html lang="nl">
                <head>
                <meta charset="utf-8">
                <title>julianoostwal.dev</title>
                <meta name="description" content="melmanbv.nl">
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
                            <h3>Je hebt een nieuwe e-mail van ${data.name}</h3>
                            <p>Hun e-mailadres is: ✉️${data.email}</p>
                        </div>
                        <div class="content">
                            <p><strong>Bericht:</strong></p>
                            <p>${data.message}</p>
                        </div>
                        <div class="footer">
                            <p>julianoostwal.dev</p>
                        </div>
                    </div>
                </body>
            </html>`,
        };

        await sendgrid.send(emailData);

        return { data: "Email sent successfully!", error: null }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error sending email";
        return { data: null, error: errorMessage };
    }
}

export { sendEmail };