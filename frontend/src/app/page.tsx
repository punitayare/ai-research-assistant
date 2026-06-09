"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Sparkles, Network } from "lucide-react";

export default function Home() {
  const features = [
    {
      title: "AI Research Chat",
      description:
        "Upload research papers and ask contextual questions using retrieval-augmented AI.",
      icon: Brain,
      href: "/chat",
    },
    {
      title: "Research Mind Maps",
      description:
        "Transform complex papers into interactive visual knowledge maps for faster understanding.",
      icon: Network,
      href: "/mindmap",
    },
    {
      title: "AI Study Tools",
      description:
        "Generate summaries, flashcards, quizzes, and revision material instantly.",
      icon: Sparkles,
      href: "/summarize",
    },
  ];

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[400px] md:h-[500px] bg-violet-500/20 blur-[120px] md:blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[250px] md:h-[400px] bg-cyan-500/10 blur-[100px] md:blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold">
              AI
            </div>

            <h1 className="text-lg md:text-2xl font-bold tracking-tight">
              AI Research Assistant
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
              href="/upload"
              className="px-4 md:px-5 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm md:text-base"
            >
              Upload
            </Link>

            <Link
              href="/chat"
              className="px-4 md:px-5 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm md:text-base"
            >
              Chat
            </Link>

            <Link
              href="/summarize"
              className="px-4 md:px-5 py-2 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition text-sm md:text-base"
            >
              Summarize
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-4 md:px-6 pt-16 md:pt-24 pb-16 md:pb-20">

        <div className="max-w-6xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >

            <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2 rounded-full border border-white/10 bg-white/5 mb-6 md:mb-8">
              <Sparkles size={14} />
              <span className="text-xs md:text-sm text-gray-300">
                AI-Powered Academic Intelligence
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight max-w-5xl mx-auto">
              Research Papers,
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Simplified With AI
              </span>
            </h1>

            <p className="mt-6 md:mt-8 text-base md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Upload PDFs, ask contextual questions, generate summaries,
              create flashcards, build mind maps, and explore research
              using an advanced AI-powered academic assistant.
            </p>

            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5">

              <Link
                href="/upload"
                className="group flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition text-sm md:text-base"
              >
                Upload Papers
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition"
                />
              </Link>

              <Link
                href="/mindmap"
                className="px-6 md:px-8 py-3 md:py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm md:text-base"
              >
                Generate Mind Map
              </Link>

            </div>

          </motion.div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-4 md:px-6 pb-16 md:pb-20">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5">
              Powerful AI Features
            </h2>

            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
              Built for students, researchers, developers and AI enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">

            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Link href={feature.href} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 hover:border-violet-500/50 hover:-translate-y-1 transition"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-5 md:mb-6">
                      <Icon size={26} />
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3">
                      {feature.title}
                    </h3>

                    <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                </Link>
              );
            })}

          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="relative z-10 px-4 md:px-6 pb-20 md:pb-24">

        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold">
            Everything You Need To Understand Research Faster
          </h2>

          <p className="mt-4 text-gray-400 text-sm md:text-base">
            Built for students, researchers and AI enthusiasts.
          </p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">

            {["AI", "MAP", "QUIZ", "PDF"].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6"
              >
                <h3 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {item}
                </h3>

                <p className="mt-2 text-xs md:text-sm text-gray-400">
                  {item === "AI"
                    ? "Research Chat"
                    : item === "MAP"
                    ? "Mind Maps"
                    : item === "QUIZ"
                    ? "Flashcards & Quizzes"
                    : "Paper Analysis"}
                </p>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-6 md:py-8 text-center text-xs md:text-sm text-gray-500">
        Built with Next.js, FastAPI, ChromaDB & LLMs
      </footer>

    </main>
  );
}