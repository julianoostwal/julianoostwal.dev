"use server";
import sendgrid, { MailDataRequired } from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail(to: string, from: { email: string, name: string }, subject: string, data: { email: string, name: string, message: string }) {
    try {

        console.log('test')
        
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
                </head>
            
                <body>
                    <div style="margin-left: 20px;margin-right: 20px;">
                        <h3>Je hebt een nieuwe e-mail van ${data.name}, hun e-mailadres is: ✉️${data.email}</h3>
                        <div style="font-size: 16px;">
                            <p>Bericht:</p>
                            <p>${data.message}</p>
                        <br>
                    </div>
                </body>
            </html>`,
        };

        await sendgrid.send(emailData);

        return { data: "Email sent successfully!", error: null }
    } catch (error) {
        console.log(error);
        throw new Error("Error sending email");
    }
}

export { sendEmail };