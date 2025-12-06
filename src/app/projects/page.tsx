import NextImage from "next/image";
import { MotionDiv } from "@/lib/framer-motion-div";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Link } from "@heroui/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: true,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
        },
    },
};

interface Project {
    title: string;
    description?: string;
    imageUrl?: string;
    githubUrl?: string;
    liveUrl?: string;
}

export default async function Projects() {
    let projects: Project[] = [];
    try {
        const response = await fetch("https://api.julianoostwal.dev/projects", { next: { revalidate: 300 } });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        projects = await response.json();
    } catch (error) {
        console.error("Failed to fetch projects:", error);
    }

    return (
        <main className="min-h-screen">
            <div className="container pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {projects.length === 0 && (
                            <div className="col-span-full text-center text-gray-700 dark:text-gray-400">
                                Failed to fetch projects.
                            </div>
                        )}
                    {projects.map((project, index) => (
                        <MotionDiv
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="max-w m-3 p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
                        >
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{project.title}</h5>
                            {project.imageUrl && <Image src={project.imageUrl} as={NextImage} alt="Project image" className="w-full object-contain rounded-lg" height={220} width={500}/>}
                            {project.description && <p className="font-normal text-gray-700 dark:text-gray-400">{project.description}</p>}
                            {project.liveUrl && <Button className="bg-blue-600 mt-3 text-white" as={Link} rel="nofollow" target="_blank" href={project.liveUrl} endContent={<IoIosArrowRoundForward className="ms-2" size={26} />}>View project</Button>}
                            {/* {project.githubUrl && <Button className="bg-gray-600 mt-3 text-white" as={Link} rel="nofollow" target="_blank" href={project.githubUrl} endContent={<IoIosArrowRoundForward className="ms-2" size={26} />}>View source</Button>} */}
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </main>
    );
}
