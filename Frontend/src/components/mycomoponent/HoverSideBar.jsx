import React, { useState, useEffect, useCallback,useContext } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Settings, Folder as FolderIcon, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Assuming you use a toast library
import { UserContext } from "@/Context/user.context";
import Cookies from "js-cookie";

// --- HELPER COMPONENTS ---
const Logo = () => (
    <h1 className="text-2xl font-mono font-semibold tracking-tight select-none">
        <span className="text-black dark:text-white">Code</span>
        <span className="text-neutral-500 dark:text-neutral-400">Less</span>
    </h1>
);

const HoverSideBar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await fetch("/api/projects/all", {
                credentials: "include",
                method: "GET",
            });
            if (!response.ok) throw new Error("Failed to fetch projects");
            const data = await response.json();
            setProjects(data.allProjects || []);
        } catch (error) {
            toast.error(error.message);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [navigate, fetchProjects]);

    return (
        <div className="flex flex-col bg-white dark:bg-black">
            <div
                className="fixed inset-y-0 left-0 z-40 flex flex-row"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <motion.aside
                    initial={{ width: 0 }}
                    animate={{ width: isHovered ? 200 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-white dark:bg-black shadow-md overflow-hidden border-r border-gray-200 dark:border-gray-800 flex flex-col rounded-r-3xl"
                >
                    {/* Header */}
                    <div className="h-[64px] flex items-center justify-between px-5 py-3 bg-white dark:bg-black text-black dark:text-white">
                        <Logo />
                    </div>

                    {/* Projects Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h2 className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            Projects
                        </h2>
                        <ScrollArea className="px-2">
                            <ul className="space-y-1">
                                {projects.map((project) => (
                                    <li key={project._id}>
                                        <Link to={`/chat/${project._id}`}>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-sm"
                                            >
                                                <FolderIcon className="w-4 h-4 mr-2" /> {project.name}
                                            </Button>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>


                                        <div className="border-t dark:border-gray-800 p-2 space-y-1">
                                            <Link to="/home">
                                                <Button variant="ghost" className="w-full justify-start text-sm">
                                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                                </Button>
                                            </Link>
                                            <Link to="/settings">
                                                <Button variant="ghost" className="w-full justify-start text-sm">
                                                    <Settings className="w-4 h-4 mr-2" /> Settings
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start text-sm text-red-600 hover:bg-red-50 hover:text-red-600 dark:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-500"
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch("/api/users/logout", {
                                                            method: "GET",
                                                            credentials: "include",
                                                        });
                                                        if (!res.ok) alert("Something went wrong, please try again.");
                                                        Cookies.remove("token");
                                                        navigate("/login");
                                                    } catch (error) {
                                                        toast.error("Something went wrong, please try again.");
                                                    }
                                                }}
                                            >
                                                <LogOut className="w-4 h-4 mr-2" /> Logout
                                            </Button>
                                        </div>

                                        {/* Divider */}
                    <Separator className="dark:bg-gray-800" />

                    {/* Profile Section */}
                    <div className="p-2 flex items-center">
                        <Link className="flex items-center space-x-2">
                            <UserIcon className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-black p-1" />
                            <span className="text-sm font-medium text-black dark:text-white">{user?.username}</span>
                        </Link>
                    </div>
                </motion.aside>
            </div>
            
            {/* Profile Icon - Always Visible in Corner */}
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="pl-2 pr-1 mt-auto mb-4"
            >
                <UserIcon className="w-7 h-7 rounded-full border border-gray-300 dark:border-gray-700 shadow-md bg-white dark:bg-black p-1" />
            </div>
        </div>
    );
}

export default HoverSideBar;