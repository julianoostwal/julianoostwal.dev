export default function Footer({ siteName }: { siteName: string }) {
    return (
        <footer>
            <div className="max-w-(--breakpoint-xl) mx-auto p-4">
                <p className="text-center text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            </div>
        </footer>
    );
}
