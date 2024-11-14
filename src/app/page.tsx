import IconCloud from "@/components/IconCloud";
import { Button } from "@nextui-org/react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center items-center">
      <div className="container">
        <div className="flex flex-wrap gap-6 justify-evenly items-center -mt-16">
          <div className="max-w-2xl gap-2 flex flex-col">
              <h1 className="text-2xl font-bold">Hi, I&apos;m Julian Oostwal</h1>
              <p>
                I&apos;m a frontend developer with a passion for building seamless, user-focused web experiences. Leveraging Next.js, React, and a range of modern web technologies, I bring designs to life with clean, efficient code.
              </p>
              <p>
                Driven by innovation and the pursuit of mastery, I continuously explore new tools and frameworks to stay at the forefront of frontend development.
              </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Button color="secondary" radius="full" href="/projects" as={Link}>View my work</Button>
              <Button color="primary" href="/contact" as={Link}>Contact Me</Button>
            </div>
          </div>
          <IconCloud />
        </div>
      </div>
    </main>
  );
}