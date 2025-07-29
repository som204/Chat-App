import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- UI & ICONS ---
import { ProjectCard } from "../components/mycomoponent/ProjectCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/ui/form";
import {
  User,
  LogOut,
  Plus,
  Settings,
  Search,
  ListFilter,
  Moon,
  Sun,
} from "lucide-react";

// --- HELPER COMPONENTS ---
const DarkModeToggle = () => {
    // Initialize state from localStorage or system preference
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

const Logo = () => (
    <h1 className="text-2xl font-mono font-semibold tracking-tight select-none">
        <span className="text-black dark:text-white">Code</span>
        <span className="text-neutral-500 dark:text-neutral-400">Less</span>
    </h1>
);

// --- MAIN COMPONENT ---
const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [pinnedProjects, setPinnedProjects] = useState(() => {
    const saved = localStorage.getItem("pinnedProjects");
    return saved ? JSON.parse(saved) : [];
  });
  
  // NEW: State for search and sort
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("modified-desc");

  // State for modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [collaborators, setCollaborators] = useState([]);

  const form = useForm({ defaultValues: { projectName: "" } });
  const addForm = useForm({ defaultValues: { username: "" } });

  useEffect(() => {
    localStorage.setItem("pinnedProjects", JSON.stringify(pinnedProjects));
  }, [pinnedProjects]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!Cookies.get("token")) navigate("/login");
    else fetchProjects();
  }, [navigate, fetchProjects]);

  // --- API HANDLERS ---
  const handleCreateProject = async (data) => {
    try {
      const response = await fetch("/api/projects/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: data.projectName }),
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      toast.success(`Project "${res.newProject.name}" created!`);
      fetchProjects();
      setCreateModalOpen(false);
      form.reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddMember = async (data) => {
    try {
      const response = await fetch(`/api/projects/add-user`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject._id,
          user: data.username,
        }),
      });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message);
      toast.success(`Added ${data.username} to ${selectedProject.name}`);
      fetchProjects();
      setAddMemberModalOpen(false);
      addForm.reset();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemoveCollaborator = async (projectId, collaboratorName) => {
    try {
      const response = await fetch(
        `/api/projects/delete-user/${projectId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collaboratorName }),
        }
      );
      if (!response.ok) throw new Error("Failed to remove collaborator");
      toast.success(`Removed ${collaboratorName} from the project.`);
      handleViewDetails(selectedProject); // Refresh modal
      fetchProjects(); // Refresh list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleViewDetails = async (project) => {
    setSelectedProject(project);
    setDetailsModalOpen(true);
    setCollaborators([]);
    try {
      const response = await fetch(
        `/api/projects/get-project/${project._id}`,
        { method: "GET", credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to fetch project details");
      const data = await response.json();
      setCollaborators(data.project);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/users/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.status === 200) {
        Cookies.remove("token");
        navigate("/login");
      } else {
        alert("Something went wrong, please try again.");
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    }
  };

  const togglePin = (projectId) => {
    setPinnedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  // NEW: Memoized and sorted/filtered projects list
  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = filtered.sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'created-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default: // modified-desc
                return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
    });

    return [
      ...sorted.filter((p) => pinnedProjects.includes(p._id)),
      ...sorted.filter((p) => !pinnedProjects.includes(p._id)),
    ];
  }, [projects, pinnedProjects, searchTerm, sortBy]);

  // --- RENDER HELPERS ---
  const renderSkeletons = () =>
    Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 border dark:border-gray-800 rounded-lg p-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    ));

  const renderEmptyState = () => (
    <div className="text-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Projects Found</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        {searchTerm ? "Try adjusting your search." : "Get started by creating your first project."}
      </p>
      <Button onClick={() => setCreateModalOpen(true)} className="mt-4 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
        <Plus className="w-4 h-4 mr-2" /> Create Project
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
      {/* Navbar */}
      <nav className="w-full h-16 flex items-center justify-between px-4 sm:px-5 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Project</span>
          </Button>
          <DarkModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Your Projects</h1>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* NEW: Search Input */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input 
                        placeholder="Filter projects..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* NEW: Sort Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline"><ListFilter className="w-4 h-4 mr-2" /> Sort</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                            <DropdownMenuRadioItem value="modified-desc">Last Modified</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="created-desc">Newest</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="name-asc">Name (A-Z)</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="name-desc">Name (Z-A)</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
        <div className="space-y-4">
          {isLoading
            ? renderSkeletons()
            : filteredAndSortedProjects.length > 0
            ? filteredAndSortedProjects.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  isPinned={pinnedProjects.includes(project._id)}
                  onPinToggle={togglePin}
                  onAddMember={() => {
                    setSelectedProject(project);
                    setAddMemberModalOpen(true);
                  }}
                  onViewDetails={() => handleViewDetails(project)}
                />
              ))
            : renderEmptyState()}
        </div>
      </main>

      {/* Modals */}
      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateProject)} className="space-y-4">
              <FormField control={form.control} name="projectName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl><Input placeholder="My awesome project" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter><Button type="submit">Create</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMemberModalOpen} onOpenChange={setAddMemberModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Add Collaborator to {selectedProject?.name}</DialogTitle></DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddMember)} className="space-y-4">
              <FormField control={addForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl><Input placeholder="Enter username" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter><Button type="submit">Add Member</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>Manage collaborators for this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[300px] overflow-y-auto py-2">
            {collaborators.length > 0 ? (
              collaborators.map((user, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <span>{user}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Remove</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove <strong>{user}</strong> from the project.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveCollaborator(selectedProject._id, user)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No other collaborators yet.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
