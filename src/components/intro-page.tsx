"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";

export const IntroPage = () => {
    return (
        <div className="min-h-screen flex md:flex-row flex-col items-center justify-between bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-6 md:px-12 lg:px-20 relative overflow-hidden">

            {/* Background Glow Animation */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute top-32 left-16 w-72 h-72 bg-blue-400/30 dark:bg-blue-500/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-32 right-16 w-80 h-80 bg-purple-400/30 dark:bg-purple-600/30 rounded-full blur-3xl"
                />
            </div>

            {/* Left Section */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
                className="flex flex-col items-center md:items-start text-center md:text-left gap-6 md:gap-8 max-w-lg z-10"
            >
                {/* Logo + Brand */}
                <div className="flex items-center gap-3 mb-3">
                    <Image
                        src="/DoczFlow-logo.svg"
                        alt="DoczFlow Logo"
                        width={200}
                        height={200}
                        className="drop-shadow-xl"
                        priority
                    />
                    <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
                        <span className="text-blue-600 dark:text-blue-400">Docz</span>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                            Flow
                        </span>
                    </h1>
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200">
                    Effortless Real-Time Collaboration
                </h2>


                <motion.ul
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.2 },
                        },
                    }}
                    className="space-y-3 text-gray-600 dark:text-gray-400 text-lg leading-relaxed"
                >
                    {[
                        {
                            title: "Create & Sync:",
                            text: "Documents update instantly across all devices.",
                        },
                        {
                            title: "Team Collaboration:",
                            text: "Work together seamlessly with built-in tools.",
                        },
                        {
                            title: "Secure & Reliable:",
                            text: "Your data is protected and always available.",
                        },
                    ].map((item, index) => (
                        <motion.li
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {item.title}
                            </span>{" "}
                            {item.text}
                        </motion.li>
                    ))}
                </motion.ul>

                <p className="text-gray-700 dark:text-gray-300 italic text-base md:text-lg">
                    Empower your team with real-time collaboration — start your flow today.
                </p>
            </motion.div>


            <div className="hidden md:block h-80 w-px bg-gray-300/40 dark:bg-gray-700/50 mx-16"></div>

            <div className="p-8 mr-[5%] sm:p-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-gray-200/50 dark:border-gray-700/50 transform hover:scale-[1.02] transition-transform duration-500">
                <SignIn
                    routing="hash"
                    appearance={{
                        elements: {
                            card: "shadow-none border-none bg-transparent",
                            headerTitle: "text-lg font-semibold",
                            headerSubtitle: "text-sm text-gray-500 dark:text-gray-400",
                            formFieldLabel:
                                "text-sm font-medium text-gray-700 dark:text-gray-300",
                            socialButtonsBlockButton:
                                "rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition",
                            footerActionText:
                                "text-sm text-gray-600 dark:text-gray-400 text-center",
                            footerActionLink:
                                "text-blue-600 dark:text-blue-400 hover:underline font-medium",
                        },
                    }}
                />
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    Secured by Clerk • Development Mode Active
                </p>
            </div>

        </div>
    );
};
