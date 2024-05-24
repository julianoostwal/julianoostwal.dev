import { Button } from '@nextui-org/react';
import Link from 'next/link';
import React from 'react';

export default function About() {
    return (
        <main className="min-h-screen">
            <div className="container py-12 px-6 mx-auto p-4">
                <h1 className="text-4xl font-bold mb-6 text-center">About Me</h1>
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg mb-6 leading-relaxed">
                        Hi there! I&apos;m Julian Oostwal, a passionate software engineer specializing in web development with a deep expertise in Next.js. As a freelance developer, I thrive on creating robust, scalable, and efficient web applications.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        My journey in software engineering started with a curiosity for how the web works and has evolved into a career focused on mastering modern technologies. I excel at building dynamic, high-performance websites and applications using the powerful capabilities of Next.js. Whether it&apos;s leveraging server-side rendering, optimizing static site generation, or harnessing the power of React for dynamic client-side rendering, I have a comprehensive understanding of the Next.js ecosystem.

                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        On the frontend, I am skilled in creating intuitive and responsive user interfaces with React, Tailwind CSS, and other modern libraries and frameworks. I am also proficient in developing authentication systems, integrating third-party services, and working with databases like Supabase and Firebase to manage and store data efficiently.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Beyond coding, I am a strong advocate for clean, maintainable code and best practices in software development. I enjoy working in collaborative environments, sharing knowledge, and continuously learning about new advancements in the tech industry.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        As a freelancer, I provide my clients with top-notch web development services. If you are looking for a dedicated and skilled software engineer to help bring your project to life, I would love to hear from you. I am open to freelance projects that challenge me and allow me to grow professionally.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Feel free to reach out to me if you have any questions, need help with a project, or would like to discuss potential freelance opportunities. I&apos;m always open to new ideas and exciting projects!
                    </p>

                    <div className="text-center">
                        <Button as={Link} href='/contact' size='lg'>Contact me!</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
