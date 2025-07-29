import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// --- UI & ICONS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Sparkles,
  Menu,
  ChevronRight,
  Check,
  Zap,
  Rocket,
  Twitter,
  Github,
  Linkedin,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
} from "lucide-react";

// --- DATA (UPDATED CONTENT) ---
const navLinks = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
];

const features = [
  {
    icon: <Sparkles className="w-8 h-8 text-black dark:text-white" />,
    title: "Your AI Co-Pilot",
    description:
      "Your AI coding partner. It writes the boring stuff, suggests cool ideas, and helps you learn as you build.",
  },
  {
    icon: <Users className="w-8 h-8 text-black dark:text-white" />,
    title: "Jam With Friends",
    description:
      "Jam on projects with friends. Code together in real-time, share ideas in the built-in chat, and see your creation come to life.",
  },
  {
    icon: <Zap className="w-8 h-8 text-black dark:text-white" />,
    title: "Instant Live Preview",
    description:
      "No more guessing. See every single change you make, live in your browser, the second you make it.",
  },
  {
  icon: <Github className="w-8 h-8 text-black dark:text-white" />,
  title: "Full GitHub Control",
  description:
    "No need to leave the editor. Tell the AI to create a repo, push your code, or pull an existing project directly from GitHub.",
  },
];

const testimonials = [
  {
    name: "Sarah L.",
    title: "Indie Hacker & Designer",
    quote:
      "Codeless is insane. The AI actually understands what I'm trying to do. It’s like having a senior dev mentor me 24/7. My side projects have never looked better.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Mike R.",
    title: "Creative Coder",
    quote:
      "I can finally just *build*. I don't get stuck on complicated setups or weird bugs. If I have an idea for a cool animation or a funky layout, I can just describe it and the AI helps me create it.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Elena K.",
    title: "CS Student & Builder",
    quote:
      "Our group projects for class are now actually fun. We use Codeless to code together and learn from each other's changes in real-time. It’s way better than fighting with Git.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const faqs = [
  {
    question: "Is Codeless good for beginners?",
    answer:
      "Yes! Codeless is the perfect place to start. Our AI helps you write quality code from day one and explains what it's doing, so you learn faster without getting stuck.",
  },
  {
    question: "How does the real-time collaboration work?",
    answer:
      "It works much like Google Docs. You can invite friends to a project, and you'll see their cursors and changes live in the editor. It includes a project-based chat for seamless communication.",
  },
  {
    question: "What frameworks can I use?",
    answer:
      "Our AI is trained on a wide variety of modern frameworks, including React, Vue, Svelte, and more. You can specify your desired stack when you start a new project.",
  },
  {
    question: "How secure is my code?",
    answer:
      "Security is our top priority. Your code is stored in encrypted repositories, and we use industry-standard security protocols to protect your data.",
  },
];

const pricingTiers = [
  {
    name: "Explorer",
    price: "Free",
    description:
      "Perfect for kicking off your first project and learning the ropes.",
    features: [
      "1 Creator",
      "2 Sandboxes",
      "AI Helper (Starter)",
      "Community Vibes",
    ],
    cta: "Start Exploring",
  },
  {
    name: "Maker",
    price: "$24",
    priceSuffix: "/ month",
    description:
      "For serious builders and small teams ready to ship amazing things.",
    features: [
      "Up to 5 Creators",
      "Unlimited Sandboxes",
      "Full AI Power",
      "Priority Support Hugs",
      "Team Collaboration Tools",
    ],
    cta: "Become a Maker",
    popular: true,
  },
  {
    name: "Visionary",
    price: "Let's Chat",
    description:
      "For bigger dreams, educational groups, and companies needing tailored solutions and extra magic.",
    features: [
      "Unlimited Creators",
      "Custom Integrations",
      "Dedicated Support Crew",
      "Advanced Security & Sign-On",
    ],
    cta: "Talk to Our Vision Team",
  },
];

// --- HELPER COMPONENTS ---
const AnimatedSection = ({ children, className = "" }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 },
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Logo = () => (
  <h1 className="text-2xl font-mono font-semibold tracking-tight select-none">
    <span className="text-black dark:text-white">Code</span>
    <span className="text-neutral-500 dark:text-neutral-400">Less</span>
  </h1>
);

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Effect to apply the theme class and save to localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prevIsDark) => !prevIsDark);
  };

  return (
    <Button onClick={toggleDarkMode} variant="ghost" size="icon">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const CountdownTimer = () => {
  const calculateTimeLeft = () => {
    const difference = +new Date("2025-12-31") - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex items-center justify-center gap-4 text-center">
      {Object.entries(timeLeft).map(([interval, value]) => (
        <div key={interval} className="flex flex-col w-20">
          <span className="text-3xl font-bold">
            {value.toString().padStart(2, "0")}
          </span>
          <span className="text-xs uppercase text-gray-400">{interval}</span>
        </div>
      ))}
    </div>
  );
};

// --- MAIN COMPONENT ---
const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) setIsLoggedIn(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/users/logout", {
        method: "GET",
        credentials: "include",
      });
      if (response.status === 200) {
        Cookies.remove("token");
        setIsLoggedIn(false);
      } else {
        alert("Something went wrong, please try again.");
      }
    } catch (error) {
      alert("Something went wrong, please try again.");
    }
  };


  return (
    <div className="bg-white dark:bg-black min-h-screen text-black dark:text-white font-sans antialiased">
      {/* --- Sticky Navbar --- */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href.substring(1))}
                  className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Link to="/home">
                    <Button className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                      <LayoutDashboard className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                      >
                        <User className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          navigate("/settings");
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link to="/login">
                  <Button className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                    <span className="hidden sm:inline">Get Started</span>
                    <ChevronRight className="h-4 w-4 sm:hidden" />
                  </Button>
                </Link>
              )}
              <DarkModeToggle />
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <nav className="flex flex-col space-y-6 mt-8">
                      {navLinks.map((link) => (
                        <a
                          key={link.name}
                          href={link.href}
                          onClick={(e) =>
                            handleNavClick(e, link.href.substring(1))
                          }
                          className="text-lg font-medium"
                        >
                          {link.name}
                        </a>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* --- Hero Section --- */}
        <section className="text-center pt-24 pb-32 px-4">
          <AnimatedSection>
            <div className="inline-block bg-gray-100 dark:bg-gray-800 text-sm font-semibold py-1 px-3 rounded-full mb-4">
              Version 2.0 is here!
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 pb-4 leading-snug tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-black via-gray-700 to-black dark:from-white dark:via-gray-400 dark:to-white">
              From Vibe to Live, Instantly.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
              The creative coding space for beginners and visionaries. Turn your
              ideas into real, working apps with an AI partner that gets your
              vibe.
            </p>
            <div className="flex justify-center gap-4">
              {isLoggedIn ? (
                <Link to="/home">
                  <Button
                    size="lg"
                    className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full text-base"
                  >
                    Jump Back In<ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full text-base"
                  >
                    Start Building for Free
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </AnimatedSection>
        </section>

        {/* --- Trust Signals --- */}
        <AnimatedSection>
          <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Trusted by developers at world-class companies
              </p>
              <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
                <div className="col-span-1 flex justify-center lg:col-span-1">
                  <p className="font-bold text-gray-400 text-xl">Vercel</p>
                </div>
                <div className="col-span-1 flex justify-center lg:col-span-1">
                  <p className="font-bold text-gray-400 text-xl">GitHub</p>
                </div>
                <div className="col-span-1 flex justify-center lg:col-span-1">
                  <p className="font-bold text-gray-400 text-xl">Stripe</p>
                </div>
                <div className="col-span-1 flex justify-center lg:col-span-1">
                  <p className="font-bold text-gray-400 text-xl">Figma</p>
                </div>
                <div className="col-span-2 flex justify-center lg:col-span-1">
                  <p className="font-bold text-gray-400 text-xl">Replit</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* --- Features Section --- */}
        <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-black">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
                Everything You Need to Build
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                From solo projects to enterprise-level applications, Codeless
                provides the tools.
              </p>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <AnimatedSection key={index}>
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl h-full border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                    <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section id="how-it-works" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
                Idea to Deployed in 3 Steps
              </h2>
            </AnimatedSection>
            <div className="relative">
              <div
                className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-800"
                style={{ transform: "translateY(-50%)" }}
              ></div>
              <div className="relative grid md:grid-cols-3 gap-12">
                <AnimatedSection>
                  <div className="text-center bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="text-4xl font-bold text-gray-200 dark:text-gray-700 mb-2">
                      01
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      Describe Your Vision
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start with
                      <code className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-1 rounded">
                        @ai
                      </code>
                      and a simple prompt. Describe the component, page, or full
                      application you want to build.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection>
                  <div className="text-center bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="text-4xl font-bold text-gray-200 dark:text-gray-700 mb-2">
                      02
                    </div>
                    <h3 className="text-xl font-bold mb-2">Build with AI</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Our AI generates the code. Collaborate with it using
                      <code className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-1 rounded">
                        @ai
                      </code>
                      again to refine and iterate instantly.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection>
                  <div className="text-center bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="text-4xl font-bold text-gray-200 dark:text-gray-700 mb-2">
                      03
                    </div>
                    <h3 className="text-xl font-bold mb-2">Preview & Share</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      See your changes live in the preview window. When you're
                      ready, deploy your project with a single click.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* --- Pricing Section --- */}
        <section id="pricing" className="py-24 bg-gray-50 dark:bg-black px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
                Choose Your Plan
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                Start for free, then scale as you grow.
              </p>
            </AnimatedSection>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {pricingTiers.map((tier) => (
                <AnimatedSection
                  key={tier.name}
                  className={`border rounded-2xl p-8 h-full flex flex-col ${
                    tier.popular
                      ? "border-black dark:border-white"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  {tier.popular && (
                    <div className="text-xs font-bold uppercase text-black dark:text-black bg-gray-200 dark:bg-white inline-block px-3 py-1 rounded-full mb-4 self-start">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {tier.description}
                  </p>
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold">
                      {tier.price}
                    </span>
                    {tier.priceSuffix && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {tier.priceSuffix}
                      </span>
                    )}
                  </div>
                  <Button
                    size="lg"
                    className={`w-full mt-auto ${
                      tier.popular
                        ? "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                        : "bg-white dark:bg-gray-900 text-black dark:text-white border dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {tier.cta}
                  </Button>
                  <ul className="mt-8 space-y-4 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-black dark:text-white flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* --- FAQ Section --- */}
        <section id="faq" className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
                Frequently Asked Questions
              </h2>
            </AnimatedSection>
            <AnimatedSection>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index + 1}`}>
                    <AccordionTrigger className="text-lg font-medium text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-gray-600 dark:text-gray-400">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AnimatedSection>
          </div>
        </section>

        {/* --- Final CTA / Lead Capture --- */}
        <section className="py-24 bg-gray-50 dark:bg-black px-4">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center bg-black dark:bg-gray-900 text-white p-12 rounded-2xl">
              <h2 className="text-4xl font-extrabold tracking-tighter mb-4">
                What Will You Create?
              </h2>
              <p className="text-gray-300 dark:text-gray-400 mb-6">
                Your journey from a spark of an idea to a live, shareable
                project starts here. What are you waiting for?
              </p>
              <div className="mb-8">
                <CountdownTimer />
              </div>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 text-white border-gray-700 focus:ring-white h-12"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 h-12"
                >
                  Request Early Access
                </Button>
              </form>
            </div>
          </AnimatedSection>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <Twitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <Github />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <Linkedin />
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <div className="flex justify-center md:justify-start items-center gap-2">
                <Logo />
              </div>
              <p className="text-center md:text-left text-sm text-gray-500 dark:text-gray-400 mt-2">
                &copy; {new Date().getFullYear()} Codeless, Inc. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
