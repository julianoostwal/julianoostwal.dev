'use client';
import { useAuth } from "@/context/AuthContext";
import { Button } from "@nextui-org/react";
import { Spinner } from "@nextui-org/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter()

    if (loading) {
        return (
            <main className="min-h-screen">
                <div className="absolute inset-0 flex justify-center items-center">
                    <Spinner size="lg" />
                </div>
            </main>
        )
    }

    if (!user) return router.push('/login');
    
    return (
        <main className="min-h-screen">
            <div className="flex flex-col justify-center px-6 py-12 lg:px-8 absolute inset-0">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">Welcome to your dashboard</h2>
                    <Button as={Link} href="/dashboard/create">Create Project</Button>
                </div>
            </div>
        </main>
    )
}