import Image from "next/image";
import getAllDocuments from "@/firebase/firestore/getAllDocuments";
import { MotionDiv } from "@/lib/framer-motion-div";
import { IoIosArrowRoundForward } from "react-icons/io";

interface Project {
    name: string;
    description?: string;
    image?: string;
    url?: string;
}

export default async function Projects() {
    const { results } = await getAllDocuments("projects");
    const projects: Project[] = results?.docs.map((doc) => doc.data() as Project) || [];

    return (
        <main className="min-h-screen">
            <div className="container pt-8">
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
                            {project.image && <Image src={project.image} alt="Project image" className="w-full object-cover rounded-lg" height={500} width={500}/>}
                            {project.description && <p className="font-normal text-gray-700 dark:text-gray-400">{project.description}</p>}
                            {project.url && <a href={project.url} className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                View project
                                <IoIosArrowRoundForward className="ms-2" size={26} />
                            </a>}
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </main>
    )
}
