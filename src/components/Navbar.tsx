'use client'

import { usePathname } from 'next/navigation';

import { useState } from 'react';
// import Image from "next/image";
import Link from "next/link";
import { useTheme } from 'next-themes';
import { FaMoon } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";

import { motion } from "framer-motion";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const pathname = usePathname();
    const { setTheme, theme } = useTheme()

    const menuVariants = {
        open: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeInOut",
            },
        }
    };

    const menuItems = [
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
        { name: 'Projects', url: '/projects' },
        { name: 'Contact', url: '/contact' }
    ];
    
    return (
        <nav className="backdrop-blur-lg sticky top-0 z-20">
            <div className="container flex flex-wrap items-center justify-between mx-auto py-4">
                <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    {/* <Image src="/logo.png" className="rounded-full" alt="Julian Oostwal Logo" width={32} height={32} /> */}
                    <span className="self-center text-2xl font-semibold whitespace-nowrap">Julian Oostwal</span>
                </Link>
                <button onClick={toggleMenu} type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-40</button>0 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded={isMenuOpen ? "true" : "false"}>
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                <motion.div className={`w-full md:block md:w-auto ${isMenuOpen ? '' : 'max-md:hidden'} max-md:opacity-0`} variants={menuVariants} initial={false} animate={isMenuOpen && "open"}>
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 dark:border-gray-700 gap-1">
                        {menuItems.map((item) => (
                            <li key={item.url}>
                                <Link href={item.url} className={`block py-2 px-3 rounded ${pathname === item.url ? 'md:bg-transparent bg-blue-700 max-md:text-white md:p-0 underline underline-offset-4 decoration-4' : 'hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'}`} aria-current={pathname === item.url ? 'page' : undefined}>
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button type="button" aria-label="Toggle Theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="block py-2 px-3 md:p-1 w-full rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 dark:hover:bg-gray-700 md:dark:hover:bg-transparent">
                                <FaMoon className='hidden dark:block'/>
                                <IoSunny className='block dark:hidden'/>
                            </button>
                        </li>
                    </ul>
                </motion.div>
            </div>
        </nav>
    )
}

