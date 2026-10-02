import { Resend } from "resend";

let client: Resend | null = null;

// Resend-compatible provider: the official SDK pointed at a custom endpoint.
export function getMailClient(): Resend {
    if (!process.env.MAIL_API_KEY) {
        throw new Error("MAIL_API_KEY is not configured");
    }
    if (!process.env.MAIL_BASE_URL) {
        throw new Error("MAIL_BASE_URL is not configured");
    }

    client ??= new Resend(process.env.MAIL_API_KEY, {
        baseUrl: process.env.MAIL_BASE_URL.replace(/\/+$/, ""),
    });
    return client;
}

// Sender address, e.g. MAIL_FROM=noreply@example.com. MAIL_FROM_NAME overrides the display name.
export function getMailFrom(fallbackName: string): string {
    const email = process.env.MAIL_FROM?.trim();
    if (!email) {
        throw new Error("MAIL_FROM is not configured");
    }
    const name = (process.env.MAIL_FROM_NAME?.trim() || fallbackName).replace(/[<>"]/g, "");
    return `${name} <${email}>`;
}
