"use server";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { createHmac } from "crypto";

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

interface SendEmailOptions {
    honeypot?: string;
}

function getRequestIpFromHeaders(h: Headers): string | null {
    const xff = h.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || null;
    return h.get("x-real-ip") || h.get("cf-connecting-ip") || null;
}

function firstHeader(h: Headers, keys: string[]): string | null {
    for (const key of keys) {
        const value = h.get(key);
        if (value && value.trim()) return value.trim();
    }
    return null;
}

function anonymizeIp(ip: string): string {
    if (ip.includes(":")) {
        const parts = ip.split(":");
        // Keep first 3 hextets (roughly /48), zero the rest.
        const kept = parts.slice(0, 3);
        return [...kept, "0000", "0000", "0000", "0000", "0000"].slice(0, 8).join(":");
    }
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    return ip;
}

function hashIp(ip: string): string | null {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) return null;
    return createHmac("sha256", salt).update(ip).digest("hex");
}

function assessSpam(input: { name: string; email: string; subject: string; message: string; honeypot?: string }) {
    const reasons: string[] = [];
    let score = 0;

    if (input.honeypot?.trim()) {
        score += 100;
        reasons.push("honeypot_filled");
    }

    const urlMatches = input.message.match(/https?:\/\/\S+/gi) ?? [];
    if (urlMatches.length >= 2) {
        score += 30;
        reasons.push("many_links");
    }

    if (input.message.trim().length < 12) {
        score += 15;
        reasons.push("very_short_message");
    }

    if (!input.subject.trim()) {
        score += 5;
        reasons.push("empty_subject");
    }

    if (/\b(crypto|seo|backlinks|casino|viagra|loan)\b/i.test(input.message)) {
        score += 25;
        reasons.push("spam_keywords");
    }

    return { isSpam: score >= 40, score, reasons };
}

async function sendEmail(
    to: string,
    from: FromData,
    subject: string,
    data: EmailData,
    options: SendEmailOptions = {}
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

        // Store contact message for admin inbox (privacy: store anonymized IP + optional salted hash)
        const h = await headers();
        const ip = getRequestIpFromHeaders(h);
        const ipAnonymized = ip ? anonymizeIp(ip) : null;

        // Geo headers depend on your hosting/proxy (Cloudflare, Nginx, etc). We read a few common ones.
        const geoCountry = firstHeader(h, ["cf-ipcountry", "x-geo-country", "x-country"]);
        const geoRegion = firstHeader(h, ["cf-region", "x-geo-region", "x-region"]);
        const geoCity = firstHeader(h, ["cf-ipcity", "x-geo-city", "x-city"]);

        const { isSpam, score, reasons } = assessSpam({
            name: data.name,
            email: data.email,
            subject,
            message: data.message,
            honeypot: options.honeypot,
        });

        await prisma.contactMessage.create({
            data: {
                name: data.name,
                email: data.email,
                subject,
                message: data.message,
                isSpam,
                spamScore: score,
                spamReasons: reasons,
                ipAnonymized,
                ipHash: ip ? hashIp(ip) : null,
                userAgent: h.get("user-agent"),
                referer: h.get("referer"),
                acceptLanguage: h.get("accept-language"),
                geoCountry: geoCountry || null,
                geoRegion: geoRegion || null,
                geoCity: geoCity || null,
            },
        });

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
