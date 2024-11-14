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
                        I&apos;m Julian Oostwal, a {age}-year-old front-end developer committed to creating efficient, high-quality digital solutions that prioritize user experience. With a solid foundation in modern web technologies, I specialize in building responsive applications that seamlessly integrate design and functionality, ensuring optimal performance across devices.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        My approach to development is grounded in best practices and a drive for continuous improvement. I prioritize clean, maintainable code and adhere to industry standards, making sure each project aligns with modern development trends. By balancing technical rigor with an attention to detail, I aim to deliver applications that are both robust and easy to use, reflecting my commitment to delivering professional results.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        Currently advancing my technical expertise at Bit Academy, I also collaborate on freelance projects, applying a detail-oriented and results-driven approach. My academic and freelance experiences allow me to stay current with evolving web standards and client expectations, enabling me to build effective, scalable solutions that cater to a wide range of digital needs.
                    </p>

                    <p className="text-lg mb-6 leading-relaxed">
                        If you&apos;re seeking a front-end developer dedicated to bringing reliable, effective solutions to life, feel free to reach out. I&apos;m open to new projects and eager to contribute my skills to innovative digital experiences. Let&apos;s connect to discuss how I can support your next project.
                    </p>

                    <div className="text-center">
                        <Button as={Link} href='/contact' size='lg' variant='ghost' color='primary'>Contact me</Button>
                    </div>
                </div>
            </div>
        </main>
    );
}
