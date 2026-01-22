"use server";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { headers } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { createHmac } from "crypto";
import { isIP } from "net";

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

function normalizeIpCandidate(value: string): string {
    let v = value.trim();
    if (!v) return v;
    // Strip zone id (e.g. fe80::1%lo0)
    v = v.split("%")[0] ?? v;
    // Strip brackets (e.g. [2001:db8::1]:1234)
    if (v.startsWith("[") && v.includes("]")) {
        v = v.slice(1, v.indexOf("]"));
    }
    // Strip port for IPv4 (e.g. 1.2.3.4:1234)
    if (v.includes(".") && v.includes(":") && v.indexOf(":") === v.lastIndexOf(":")) {
        const [ipPart] = v.split(":");
        if (ipPart) v = ipPart;
    }
    return v;
}

function isPrivateOrReservedIp(ip: string): boolean {
    const kind = isIP(ip);
    if (kind === 4) {
        const parts = ip.split(".").map((p) => Number(p));
        if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
        const [a, b] = parts;
        if (a === 10) return true;
        if (a === 127) return true;
        if (a === 0) return true;
        if (a === 169 && b === 254) return true;
        if (a === 192 && b === 168) return true;
        if (a === 172 && b >= 16 && b <= 31) return true;
        if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
        return false;
    }
    if (kind === 6) {
        const lower = ip.toLowerCase();
        if (lower === "::1") return true;
        if (lower.startsWith("fe80:")) return true; // link-local
        if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local (fc00::/7)
        return false;
    }
    return true;
}

function getRequestIpFromHeaders(h: Headers): string | null {
    // Prefer headers that (when present) usually contain the original client IP.
    // Note: these are trustworthy only when set by a trusted reverse proxy.
    const directHeaders = ["cf-connecting-ip", "true-client-ip", "x-client-ip", "x-real-ip"];
    for (const key of directHeaders) {
        const raw = h.get(key);
        if (!raw) continue;
        const ip = normalizeIpCandidate(raw);
        if (isIP(ip)) return ip;
    }

    const xff = h.get("x-forwarded-for");
    if (xff) {
        const candidates = xff
            .split(",")
            .map((p) => normalizeIpCandidate(p))
            .filter((ip) => Boolean(ip) && Boolean(isIP(ip)));
        if (candidates.length) {
            const firstPublic = candidates.find((ip) => !isPrivateOrReservedIp(ip));
            return firstPublic ?? candidates[0] ?? null;
        }
    }

    return null;
}

function firstHeader(h: Headers, keys: string[]): string | null {
    for (const key of keys) {
        const value = h.get(key);
        if (value && value.trim()) return value.trim();
    }
    return null;
}

function anonymizeIp(ip: string): string {
    const kind = isIP(ip);
    if (kind === 6) {
        const expanded = expandIpv6(ip);
        // Keep first 3 hextets (roughly /48), zero the rest.
        return [...expanded.slice(0, 3), "0000", "0000", "0000", "0000", "0000"].join(":");
    }
    if (kind === 4) {
        const parts = ip.split(".");
        if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    return ip;
}

function expandIpv6(ip: string): string[] {
    // Returns 8 hextets, zero-padded to 4 chars.
    const lower = normalizeIpCandidate(ip).toLowerCase();
    const [leftRaw, rightRaw] = lower.split("::");
    const left = leftRaw ? leftRaw.split(":").filter(Boolean) : [];
    const right = rightRaw ? rightRaw.split(":").filter(Boolean) : [];

    const convertEmbeddedIpv4 = (parts: string[]) => {
        const last = parts[parts.length - 1];
        if (!last || !last.includes(".")) return parts;
        const nums = last.split(".").map((n) => Number(n));
        if (nums.length !== 4 || nums.some((n) => Number.isNaN(n))) return parts;
        const hi = ((nums[0] << 8) | nums[1]).toString(16);
        const lo = ((nums[2] << 8) | nums[3]).toString(16);
        return [...parts.slice(0, -1), hi, lo];
    };

    const left2 = convertEmbeddedIpv4(left);
    const right2 = convertEmbeddedIpv4(right);
    const missing = 8 - (left2.length + right2.length);
    const middle = missing > 0 ? Array.from({ length: missing }, () => "0") : [];
    const full = [...left2, ...middle, ...right2].slice(0, 8);
    while (full.length < 8) full.push("0");
    return full.map((h) => h.padStart(4, "0"));
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
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            select: { siteName: true },
        });
        const siteName = settings?.siteName?.trim() || "Portfolio";

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
                        <title>${siteName.replace(/[<>]/g, "")}</title>
                        <meta name="description" content="${siteName.replace(/[<>]/g, "")}">
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
                                <p>${siteName.replace(/[<>]/g, "")}</p>
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
