"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { sendEmail } from "@/actions/sendEmail";
import { toast } from "sonner";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";

interface ContactFormProps {
  contactEmail: string;
}

export default function ContactForm({ contactEmail }: ContactFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await sendEmail(
      contactEmail,
      { email: `noreply@${contactEmail.split("@")[1]}`, name: "Portfolio Contact" },
      subject || "New message from portfolio",
      { email, name, message }
    );

    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Message sent successfully!");
    setEmail("");
    setName("");
    setMessage("");
    setSubject("");
  }

  return (
    <motion.section
      className="text-center max-w-xl mx-auto -mt-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <h1 className="text-3xl">Contact me</h1>

      <p className="mt-4">
        Please contact me directly at{" "}
        <a className="underline" href={`mailto:${contactEmail}`}>
          {contactEmail}
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

        <Button
          type="submit"
          variant="bordered"
          color="success"
          className="mt-8"
          isLoading={loading}
        >
          Send message
        </Button>
      </form>
    </motion.section>
  );
}
