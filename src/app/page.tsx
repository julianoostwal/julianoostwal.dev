import IconCloud from "@/components/IconCloud";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex justify-center items-center">
      <div className="container">
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <div className="max-w-2xl gap-2 flex flex-col">
              <h1 className="text-2xl font-bold">Hi, I&apos;m Julian Oostwal</h1>
              <p>
                I&apos;m a frontend developer passionate about crafting sleek and intuitive user interfaces. My expertise lies in Next.js, React, and modern web technologies.
              </p>
              <p>
                Dedicated to creating engaging and performant web experiences, I thrive on learning and exploring new technologies.
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