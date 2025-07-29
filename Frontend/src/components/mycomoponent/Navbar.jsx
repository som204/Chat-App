import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Send, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";
import { handler } from "tailwindcss-animate";

// --- HELPER COMPONENTS ---
const Logo = () => (
    <h1 className="text-2xl font-mono font-semibold tracking-tight select-none">
        <span className="text-black dark:text-white">Code</span>
        <span className="text-neutral-500 dark:text-neutral-400">Less</span>
    </h1>
);

const DarkModeToggle = () => {
    // Initialize state from localStorage or system preference as a fallback
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Effect to apply the theme class and save to localStorage
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleDarkMode = () => {
        setIsDark(prevIsDark => !prevIsDark);
    }

    return (
        <Button onClick={toggleDarkMode} variant="ghost" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}


const Navbar = ({ handleDownload }) => {
  return (
    <nav className="w-full h-[64px] flex items-center justify-between px-4 sm:px-5 py-4 bg-white dark:bg-black text-black dark:text-white border-b border-neutral-300 dark:border-neutral-800 shadow-sm">
      {/* Logo / Title */}
      <Link to="/" className="flex items-center gap-2">
        <Logo />
      </Link>

      {/* Buttons */}
      <ul className="flex items-center gap-2">
        <li>
          <Button
            variant="ghost"
            onClick={() => handleDownload()}
            className="border border-black dark:border-neutral-700 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors px-2 sm:px-2.5 py-1.5 sm:py-1 text-sm font-medium rounded"
          >
            <Upload className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </li>
        <li>
          <Button
            variant="ghost"
            className="border border-black dark:border-neutral-700 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors px-2 sm:px-2.5 py-1.5 sm:py-1 text-sm font-medium rounded"
          >
            <Send className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Deploy</span>
          </Button>
        </li>
        <li>
            <DarkModeToggle />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
