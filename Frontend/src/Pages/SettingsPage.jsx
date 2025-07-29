import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Mail, Lock, Key, Github, Loader2, Sun, Moon, ArrowLeft, Building, School, ShieldCheck, Palette, AlertTriangle, Bell, CreditCard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

// --- HELPER COMPONENTS ---

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleDarkMode = () => setIsDark(prev => !prev);

    return (
        <div className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-800">
            <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select your preferred interface theme.
                </p>
            </div>
            <Button onClick={toggleDarkMode} variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
    );
};

const Logo = () => (
    <h1 className="text-2xl font-mono font-semibold tracking-tight select-none">
        <span className="text-black dark:text-white">Code</span>
        <span className="text-neutral-500 dark:text-neutral-400">Less</span>
    </h1>
);

// --- MAIN SETTINGS PAGE COMPONENT ---

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isTokenLoading, setIsTokenLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [githubToken, setGithubToken] = useState(null);
  const [isGithubLinked, setIsGithubLinked] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [showUpdateToken, setShowUpdateToken] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [userId, setUserId] = useState(null);
  
  const [notifications, setNotifications] = useState({
    productUpdates: true,
    securityAlerts: true,
  });

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm();
  const newPassword = watch("newPassword");

useEffect(() => {
    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            // Replace with your actual API endpoint
            const res = await fetch("/api/users/profile", {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();
            setUserData({
                username: data.user.username,
                email: data.user.email,
                fullName: data.user.fullname || "",
                college: data.user.college || "",
                organization: data.user.organisation || "",
                bio: data.user.bio || "",
            });
            setUserId(data.user._id);
            setGithubToken(data.user.githubtoken || "");
            setIsGithubLinked(!!data.user.githublinkstatus);

            setValue("fullName", data.user.fullname || "");
            setValue("college", data.user.college || "");
            setValue("organization", data.user.organisation || "");
            setValue("bio", data.user.bio || "");
        } catch (err) {
            // Optionally handle error
            setUserData(null);
            setGithubToken("");
            setIsGithubLinked(false);
        }
        setIsLoading(false);
    };
    fetchProfileData();
}, [setValue]);

// Unified handler for both profile and token updates
const handleProfileUpdate = async (data) => {
    setIsSavingProfile(true);
    try {
        console.log(userId)
        // PATCH user profile (excluding githubToken)
        const res = await fetch("/api/users/updateProfile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                userId,
                fullname: data.fullName,
                college: data.college,
                organisation: data.organization,
                bio: data.bio,
            }),
        });
        if (!res.ok) throw new Error("Failed to update profile");
        // Update local userData state with new values
        setUserData(prev => ({
            ...prev,
            fullName: data.fullname,
            college: data.college,
            organization: data.organisation,
            bio: data.bio,
        }));
        alert("Profile updated successfully!");
    } catch (err) {
        alert("Failed to update profile.");
    }
    setIsSavingProfile(false);
};

// PATCH GitHub token
const handleTokenSubmit = async (data) => {
    setIsTokenLoading(true);
    try {
        const res = await fetch("/api/users/updateProfile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ userId, githubtoken: data.githubToken }),
        });
        if (!res.ok) throw new Error("Failed to update token");
        alert("Token updated successfully!");
        setGithubToken(data.githubToken);
        setShowUpdateToken(false);
        reset({ githubToken: '' });
    } catch (err) {
        alert("Failed to update token.");
    }
    setIsTokenLoading(false);
};

  const handlePasswordSubmit = async (data) => {
    setIsPasswordLoading(true);
    console.log("Updating password with:", data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Password update submitted!");
    setIsPasswordLoading(false);
    setShowUpdatePassword(false);
    reset();
  };
  
 

  const handleDeleteAccount = () => {
      alert("Account deletion initiated!");
  }

  const handleLinkGithub = () => {
      alert("Linking with GitHub...");
  }

  const handleDisconnectGithub = () => {
      alert("Disconnecting GitHub account...");
  }
  
  const handleNotificationChange = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    console.log(`Notification for ${type} set to: ${!notifications[type]}`);
  };

  const navItems = [
      { id: 'personal', label: 'Personal Details', icon: User },
      { id: 'security', label: 'Security', icon: ShieldCheck },
      { id: 'integrations', label: 'Integrations', icon: Github },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2">
                    <Logo />
                </Link>
                <Link to="/home">
                    <Button variant="ghost">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 lg:w-1/5">
                <nav className="flex flex-col space-y-1 sticky top-24">
                    {navItems.map(item => (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? "secondary" : "ghost"}
                            className={`w-full justify-start ${item.id === 'danger' ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.label}
                        </Button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {activeTab === 'personal' && (
                        <motion.div key="personal" {...motionProps} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Details</CardTitle>
                                    <CardDescription>Update your personal information here.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
                                        {isLoading ? <Skeleton className="h-40 w-full" /> : (
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2"><Label>Username</Label><Input value={userData?.username || ''} readOnly className="bg-gray-100 dark:bg-gray-800" /></div>
                                                <div className="space-y-2"><Label>Email</Label><Input type="email" value={userData?.email || ''} readOnly className="bg-gray-100 dark:bg-gray-800" /></div>
                                                <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" {...register("fullName")} /></div>
                                                <div className="space-y-2"><Label htmlFor="college">College</Label><Input id="college" {...register("college")} /></div>
                                                <div className="space-y-2 sm:col-span-2"><Label htmlFor="organization">Organization</Label><Input id="organization" {...register("organization")} /></div>
                                                <div className="space-y-2 sm:col-span-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" {...register("bio")} placeholder="Tell us a little about yourself" /></div>
                                            </div>
                                        )}
                                        <div className="flex justify-end pt-4">
                                            <Button type="submit" disabled={isSavingProfile}>
                                                {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div key="security" {...motionProps} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>Manage your password.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!showUpdatePassword && (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <Label>Password</Label>
                                                <p className="text-sm text-gray-500">••••••••</p>
                                            </div>
                                            <Button variant="outline" onClick={() => setShowUpdatePassword(true)}>Update Password</Button>
                                        </div>
                                    )}
                                    <AnimatePresence>
                                        {showUpdatePassword && (
                                            <motion.form
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-4 pt-4 border-t dark:border-gray-800 overflow-hidden"
                                            >
                                                <div className="space-y-2">
                                                    <Label htmlFor="currentPassword">Current Password</Label>
                                                    <Input id="currentPassword" type="password" {...register("currentPassword", { required: "Current password is required" })} />
                                                    {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="newPassword">New Password</Label>
                                                        <Input id="newPassword" type="password" {...register("newPassword", { required: "New password is required", minLength: { value: 8, message: "Must be at least 8 characters" } })} />
                                                        {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                        <Input id="confirmPassword" type="password" {...register("confirmPassword", { required: "Please confirm password", validate: value => value === newPassword || "Passwords do not match" })} />
                                                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button type="button" variant="ghost" onClick={() => {setShowUpdatePassword(false); reset();}}>Cancel</Button>
                                                    <Button type="submit" disabled={isPasswordLoading}>
                                                        {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Save Password
                                                    </Button>
                                                </div>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>Two-Factor Authentication</CardTitle>
                                    <CardDescription>Add an extra layer of security to your account.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">Status: <span className="text-red-500 font-normal">Disabled</span></p>
                                        </div>
                                        <Button variant="outline">Enable 2FA</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'integrations' && (
                        <motion.div key="integrations" {...motionProps} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Integrations</CardTitle>
                                    <CardDescription>Connect your Codeless account with third-party services.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">GitHub Account</h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Link your GitHub account for seamless repository access.</div>
                                        {isLoading ? <Skeleton className="h-10 w-full" /> : isGithubLinked ? (
                                            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                                <div className="flex items-center gap-2"><Github className="h-5 w-5" /><span className="font-medium">dev_user</span></div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-green-600 dark:text-green-400">Linked</span>
                                                    <Button variant="destructive" size="sm" onClick={handleDisconnectGithub}>Disconnect</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button variant="outline" className="w-full" onClick={handleLinkGithub}>
                                                <Github className="mr-2 h-4 w-4" /> Link with GitHub
                                            </Button>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">GitHub Access Token</h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Provide a personal access token for private repository access.</div>
                                        {!showUpdateToken && (isLoading ? <Skeleton className="h-10 w-full" /> : githubToken ? (
                                            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                                                <div className="flex items-center gap-2"><Key className="h-5 w-5" /><span className="font-mono text-sm">ghp_...{githubToken.slice(-4)}</span></div>
                                                <Button variant="secondary" size="sm" onClick={() => setShowUpdateToken(true)}>Change Token</Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" className="w-full" onClick={() => setShowUpdateToken(true)}>
                                                <Key className="mr-2 h-4 w-4" /> Add Access Token
                                            </Button>
                                        ))}
                                        <AnimatePresence>
                                            {showUpdateToken && (
                                                <motion.form
                                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                    onSubmit={handleSubmit(handleTokenSubmit)} className="space-y-4 pt-4 overflow-hidden"
                                                >
                                                    <div className="space-y-2">
                                                        <Label htmlFor="githubToken">New GitHub Token</Label>
                                                        <Input id="githubToken" type="password" {...register("githubToken", { required: "Token is required" })} />
                                                        {errors.githubToken && <p className="text-sm text-red-500">{errors.githubToken.message}</p>}
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button type="button" variant="ghost" onClick={() => setShowUpdateToken(false)}>Cancel</Button>
                                                        <Button type="submit" disabled={isTokenLoading}>
                                                            {isTokenLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            Save Token
                                                        </Button>
                                                    </div>
                                                </motion.form>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    
                    {activeTab === 'notifications' && (
                        <motion.div key="notifications" {...motionProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Manage how you receive notifications.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-md border dark:border-gray-800">
                                        <div>
                                            <Label>Product Updates</Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Receive emails about new features and updates.</p>
                                        </div>
                                        <Switch checked={notifications.productUpdates} onCheckedChange={() => handleNotificationChange('productUpdates')} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-md border dark:border-gray-800">
                                        <div>
                                            <Label>Security Alerts</Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Be notified about important security events.</p>
                                        </div>
                                        <Switch checked={notifications.securityAlerts} onCheckedChange={() => handleNotificationChange('securityAlerts')} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                    
                    {activeTab === 'billing' && (
                        <motion.div key="billing" {...motionProps} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Plan</CardTitle>
                                    <CardDescription>You are currently on the <span className="font-semibold text-primary">Free</span> plan.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button>Upgrade to Pro</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage</CardTitle>
                                    <CardDescription>Your usage statistics for the current billing period.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <Label>Projects</Label>
                                            <span>3 / 10</span>
                                        </div>
                                        <Progress value={30} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <Label>Build Minutes</Label>
                                            <span>12 / 100</span>
                                        </div>
                                        <Progress value={12} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div key="appearance" {...motionProps}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>Customize the look and feel of your workspace.</CardDescription>
                                </CardHeader>
                                <CardContent><DarkModeToggle /></CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'danger' && (
                        <motion.div key="danger" {...motionProps}>
                            <Card className="border-red-500 dark:border-red-700">
                                <CardHeader>
                                    <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                                    <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <p className="font-medium">Delete Account</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and all associated data.</p>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteAccount}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;