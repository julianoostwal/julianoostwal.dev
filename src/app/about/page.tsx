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
                        Hello! I&apos;m Julian Oostwal, a {age}-year-old software engineer specializing in web development. As a freelance developer, I&apos;m dedicated to building robust, scalable applications that prioritize efficiency and user experience.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        My journey in tech began with a fascination for the web, evolving into a career focused on mastering modern tools and practices. I excel in creating high-performance websites with responsiveness at their core.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Proficient in using technologies like Supabase and Firebase, I build applications with seamless integration of third-party services for authentication and data management, ensuring functionality meets an intuitive design.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Committed to best practices, I write clean, maintainable code and love working collaboratively. I&apos;m continuously learning, embracing the latest tech advancements, and contributing my skills to each project.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Currently, I&apos;m pursuing my education at Bit Academy, where I continue to deepen my expertise in software development.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        As a freelancer, I&apos;m always excited to tackle new challenges. If you&apos;re seeking a dedicated developer to bring your project to life, let&apos;s connect. I&apos;m open to projects that push me to grow and deliver exceptional results.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Let&apos;s discuss how I can help with your next project or idea—whether you have questions, need a project partner, or want to explore a freelance opportunity, I&apos;d love to chat!
                    </p>

                    <div className="text-center">
                        <Button as={Link} href='/contact' size='lg' variant='ghost' color='primary'>Contact me!</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
