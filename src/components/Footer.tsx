export default function Footer() {
    return (
        <footer>
            <div className="max-w-screen-xl mx-auto p-4">
                <p className="text-center text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Julian Oostwal. All rights reserved.</p>
            </div>
        </footer>
    );
}