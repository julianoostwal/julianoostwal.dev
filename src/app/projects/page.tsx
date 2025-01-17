"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import getAllDocuments from "@/firebase/firestore/getAllDocuments";
import { MotionDiv } from "@/lib/framer-motion-div";
import { IoIosArrowRoundForward } from "react-icons/io";
import Link from "next/link";
import { Button, Image } from "@nextui-org/react";
import firebase_app from "@/firebase/config";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

interface Project {
    name: string;
    description?: string;
    image?: string;
    url?: string;
    imageUrl?: string;
}

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const { results } = await getAllDocuments("projects");
                const projectDocs: Project[] = results?.docs.map((doc) => doc.data() as Project) || [];
                const storage = getStorage(firebase_app, "gs://julianoostwal-c3a80.appspot.com");

                const projectsWithImageUrls = await Promise.all(
                    projectDocs.map(async (project) => {
                        if (project.image) {
                            const imageUrl = await getDownloadURL(ref(storage, project.image));
                            return { ...project, imageUrl };
                        }
                        return project;
                    })
                );

                setProjects(projectsWithImageUrls);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    return (
        <main className="min-h-screen">
            <div className="container pt-8">
                {loading ? (
                    <p className="text-center text-gray-600 dark:text-gray-300">Loading projects...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {projects.map((project, index) => (
                            <MotionDiv
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="max-w mx-3 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                            >
                                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{project.name}</h5>
                                {project.imageUrl && (
                                    <Image
                                        src={project.imageUrl}
                                        as={NextImage}
                                        alt="Project image"
                                        className="w-full object-contain rounded-lg"
                                        height={220}
                                        width={500}
                                    />
                                )}
                                {project.description && <p className="font-normal text-gray-700 dark:text-gray-400">{project.description}</p>}
                                {project.url && (
                                    <Button
                                        className="bg-blue-600 mt-3"
                                        as={Link}
                                        href={project.url}
                                        endContent={<IoIosArrowRoundForward className="ms-2" size={26} />}
                                    >
                                        View project
                                    </Button>
                                )}
                            </MotionDiv>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
