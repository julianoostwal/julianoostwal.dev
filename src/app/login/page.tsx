'use client'
import { useState, FormEvent} from "react";
import signIn from "@/firebase/auth/signin";
import { useRouter } from 'next/navigation'
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { toast } from "sonner"

function Page() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const { error }: { error: any } = await signIn(email, password);

        setEmail('');
        setPassword('');

        if (error) {
            toast.error(error.message, {
                style: {
                    background: 'red',
                },
            })
            return console.log(error);
        }

        return router.push("/dashboard")
    }
    return (
        <main className="min-h-screen">
            <div className="flex flex-col justify-center px-6 py-12 lg:px-8 absolute inset-0">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">Sign in to your account</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={handleForm}>
                        <div>
                            <div className="mt-2">
                                <Input onChange={(e) => setEmail(e.target.value)} id="email" name="email" type="email" autoComplete="email" required variant="bordered" label="Email" />
                            </div>
                        </div>

                        <div>
                            <div className="mt-2">
                                <Input onChange={(e) => setPassword(e.target.value)} id="password" name="password" type="password" autoComplete="current-password" required variant="bordered" label="Password" />
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Sign in</Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>

    );
}

export default Page;