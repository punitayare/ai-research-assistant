"use client";

import axios from "axios";
import { Send, ChevronDown, FileText, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

/* =========================
   TYPES
========================= */

interface SourceChunk {
  content: string;
  source: string;
  chunk_id: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
}

interface PdfFile {
  name: string;
  url?: string;
}

/* =========================
   COMPONENT
========================= */

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! Upload PDFs and ask questions about them.",
    },
  ]);

  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [showPdfs, setShowPdfs] = useState(false);
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);

  // NEW: mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const res = await axios.get(
        "https://ai-research-assistant-production-0ae1.up.railway.app/uploaded-pdfs"
      );
      setPdfs(res.data.pdfs);
    } catch (err) {
      console.error("PDF fetch failed:", err);
    }
  };

  const togglePdf = (name: string) => {
    setSelectedPdfs((prev) =>
      prev.includes(name)
        ? prev.filter((p) => p !== name)
        : [...prev, name]
    );
  };

  const sendMessage = async () => {
    if (!query.trim()) return;

    if (selectedPdfs.length === 0) {
      alert("Please select at least one PDF");
      return;
    }

    const currentQuery = query.trim();

    setMessages((prev) => [
      ...prev,
      { role: "user", content: currentQuery },
    ]);

    setQuery("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/chat",
        {
          query: currentQuery,
          document_names: selectedPdfs,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.sources || [],
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  /* =========================
     UI
  ========================= */

  return (
    <main className="min-h-screen bg-black text-white flex flex-col md:flex-row">

      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
        <h1 className="font-semibold">AI Research</h1>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* SIDEBAR (DESKTOP) */}
      <aside className="hidden md:flex w-[280px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 flex-col">
        <h1 className="text-2xl font-bold mb-8">AI Research Assistant</h1>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          Research Chat
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowPdfs(!showPdfs)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5"
          >
            Uploaded PDFs
            <ChevronDown
              size={18}
              className={`${showPdfs ? "rotate-180" : ""}`}
            />
          </button>

          {showPdfs && (
            <div className="max-h-72 overflow-y-auto border-t border-white/10">
              {pdfs.map((pdf, i) => (
                <div
                  key={i}
                  onClick={() => togglePdf(pdf.name)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-white/5 ${
                    selectedPdfs.includes(pdf.name)
                      ? "bg-violet-500/20"
                      : "hover:bg-white/5"
                  }`}
                >
                  <FileText size={18} className="text-violet-400" />
                  <span className="text-sm truncate">{pdf.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPdfs.length > 0 && (
          <div className="mt-4 text-xs text-gray-400">
            Selected: {selectedPdfs.length} PDF(s)
          </div>
        )}
      </aside>

      {/* MOBILE SIDEBAR DRAWER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative w-[280px] bg-black border-r border-white/10 p-6">
            <button
              onClick={() => setSidebarOpen(false)}
              className="mb-6"
            >
              <X />
            </button>

            <h1 className="text-xl font-bold mb-6">AI Research</h1>

            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setShowPdfs(!showPdfs)}
                className="w-full flex items-center justify-between p-4"
              >
                PDFs
                <ChevronDown
                  className={`${showPdfs ? "rotate-180" : ""}`}
                />
              </button>

              {showPdfs && (
                <div className="max-h-64 overflow-y-auto border-t border-white/10">
                  {pdfs.map((pdf, i) => (
                    <div
                      key={i}
                      onClick={() => togglePdf(pdf.name)}
                      className="p-4 border-b border-white/10 text-sm"
                    >
                      {pdf.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CHAT */}
      <section className="flex-1 flex flex-col h-screen md:h-auto">

        {/* HEADER (DESKTOP ONLY) */}
        <div className="hidden md:block border-b border-white/10 p-6">
          <h2 className="text-2xl font-semibold">Research Chat</h2>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`w-full md:max-w-4xl ${
                message.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`rounded-3xl px-4 md:px-6 py-4 border ${
                  message.role === "user"
                    ? "bg-violet-600 border-violet-500"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>

              {message.sources?.length ? (
                <div className="mt-3 space-y-3">
                  {message.sources.map((src, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <p className="text-sm text-gray-300">
                        {src.content?.slice(0, 200)}...
                      </p>
                      <div className="text-xs text-violet-300 mt-2">
                        PDF: {src.source}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {loading && (
            <div className="mr-auto max-w-xl">
              <div className="rounded-3xl px-6 py-5 bg-white/5 border border-white/10 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* INPUT (MOBILE FIXED BOTTOM FEEL) */}
        <div className="border-t border-white/10 p-3 md:p-6 bg-black">
          <div className="max-w-4xl mx-auto flex gap-3 md:gap-4 items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask questions about PDFs..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 md:px-6 py-3 md:py-4 outline-none focus:border-violet-500"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-violet-600 flex items-center justify-center disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </section>
    </main>
  );
}