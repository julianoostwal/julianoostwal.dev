"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { sendEmail } from "@/actions/sendEmail";
import { toast } from "sonner";
import { Input, Textarea, Button } from "@nextui-org/react";

export default function Contact() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const { data, error } = await sendEmail("info@julianoostwal.dev", { email: "noreply@julianoostwal.dev", name: "Julian Oostwal" }, subject || "Bericht van website julianoostwal.dev", { email, name, message });

        if (error) {
            return toast.error(error, {
                style: {
                    background: "red",
                },
                duration: 5000,
            });
        } else {
            toast.success("Email sent successfully!", {
                duration: 5000,
            });
            setEmail("");
            setName("");
            setMessage("");
            setSubject("");
        }

    }

    return (
        <main className="min-h-screen flex justify-center items-center p-4">
            <motion.section
                className="text-center max-w-xl mx-auto -mt-16"
                initial={{
                    opacity: 0,
                }}
                whileInView={{
                    opacity: 1,
                }}
                transition={{
                    duration: 0.3,
                }}
                viewport={{
                    once: true,
                }}>
                <h1 className="text-3xl">Contact me</h1>

                <p className="mt-4">
                    Please contact me directly at{" "}
                    <a className="underline" href="mailto:info@julianoostwal.dev">
                        info@julianoostwal.dev
                    </a>{" "}
                    or through this form.
                </p>

                <form className="mt-6 flex flex-col" onSubmit={handleSubmit}>
                    <Input
                        label="Full name"
                        type="text"
                        variant="underlined"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        isRequired
                        className="mt-4"
                    />

                    <Input
                        label="Email address"
                        type="email"
                        variant="underlined"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        isRequired
                        className="mt-4"
                    />

                    <Input
                        label="Subject"
                        type="text"
                        variant="underlined"
                        onChange={(e) => setSubject(e.target.value)}
                        value={subject}
                        className="mt-4"
                    />

                    <Textarea
                        label="Message"
                        placeholder="Enter your message"
                        variant="underlined"
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                        className="mt-4"
                        isRequired
                    />

                    <Button type="submit" variant="bordered" color="success" className="mt-8">
                        Send message
                    </Button>
                </form>
            </motion.section>
        </main>
    );
}
