import { Button } from '@nextui-org/react';
import Link from 'next/link';
import React from 'react';

function calculateAge(birthDate: string) {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
}

export default function About() {
    const age = calculateAge('2007-06-29');

    return (
        <main className="min-h-screen">
            <div className="container py-12 px-6 mx-auto p-4">
                <h1 className="text-4xl font-bold mb-6 text-center">About Me</h1>
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg mb-6 leading-relaxed">
                        Hi there! I&apos;m Julian Oostwal, a {age}-year-old passionate software engineer specializing in web development. As a freelance developer, I thrive on creating robust, scalable, and efficient web applications.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        My journey in software engineering started with a curiosity for how the web works and has evolved into a career focused on mastering modern technologies. I excel at building high-performance websites and applications with a strong focus on user experience and responsiveness.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        I am skilled in creating intuitive and responsive user interfaces using modern web technologies. I use tools like Supabase and Firebase for authentication and data management, integrating third-party services seamlessly.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Beyond coding, I advocate for clean, maintainable code and best practices in software development. I enjoy working in collaborative environments, sharing knowledge, and continuously learning about new advancements in the tech industry.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        I am currently pursuing my education at Bit Academy, where I continue to expand my skills and knowledge in software development.
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
