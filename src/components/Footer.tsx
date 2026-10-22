import { quixly, showQuixly } from "@/lib/quixly";

export default function Footer({ siteName }: { siteName: string }) {
    return (
        <footer>
            <div className="max-w-(--breakpoint-xl) mx-auto p-4">
                <p className="text-center text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
                {showQuixly(siteName) ? (
                    <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-1">
                        Founder of{" "}
                        <a className="underline underline-offset-4" href={quixly.url} target="_blank" rel="noopener">
                            {quixly.name}
                        </a>
                    </p>
                ) : null}
                {siteName !== "Julian Oostwal" ? (
                    <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-1">
                        Template by{" "}
                        <a className="underline underline-offset-4" href="https://julianoostwal.dev" target="_blank" rel="noreferrer">
                            Julian Oostwal
                        </a>
                    </p>
                ) : null}
            </div>
        </footer>
    );
}
