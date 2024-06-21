import IconCloud from "@/components/IconCloud";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center items-center">
      <div className="container">
        <div className="flex flex-wrap gap-4">
          <div>
              <h1>Hi, I&apos;m Julian Oostwal</h1>
              <p>
                I&apos;m a software engineer who loves to build things. I&apos;m
                passionate about web development.
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
