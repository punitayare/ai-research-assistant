"use client";

import axios from "axios";
import {
  Send,
  ChevronDown,
  FileText,
  Menu,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
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

  // ✅ MOBILE SIDEBAR STATE (FIX)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        {
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  /* =========================
     PDF SIDEBAR CONTENT (REUSED)
  ========================= */

  const PdfSidebar = () => (
    <div className="border-t border-white/10 max-h-72 overflow-y-auto">
      {pdfs.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">
          No PDFs uploaded
        </div>
      ) : (
        pdfs.map((pdf, i) => (
          <div
            key={i}
            onClick={() => {
              togglePdf(pdf.name);
              setMobileSidebarOpen(false); // close on mobile
            }}
            className={`flex items-center gap-3 p-4 cursor-pointer border-b border-white/5 transition ${
              selectedPdfs.includes(pdf.name)
                ? "bg-violet-500/20"
                : "hover:bg-white/5"
            }`}
          >
            <FileText size={18} className="text-violet-400" />
            <span className="text-sm truncate">{pdf.name}</span>
          </div>
        ))
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white flex">

      {/* =========================
         MOBILE TOP BAR
      ========================= */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 border-b border-white/10 bg-black">
        <h1 className="font-semibold">AI Research</h1>
        <button onClick={() => setMobileSidebarOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* =========================
         DESKTOP SIDEBAR
      ========================= */}
      <aside className="hidden md:flex w-[280px] border-r border-white/10 bg-white/5 p-6 flex-col">
        <h1 className="text-2xl font-bold mb-8">
          AI Research Assistant
        </h1>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          Research Chat
        </div>

        <button
          onClick={() => setShowPdfs(!showPdfs)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5"
        >
          Uploaded PDFs
          <ChevronDown
            className={`${showPdfs ? "rotate-180" : ""}`}
          />
        </button>

        {showPdfs && <PdfSidebar />}

        {selectedPdfs.length > 0 && (
          <div className="mt-4 text-xs text-gray-400">
            Selected: {selectedPdfs.length} PDF(s)
          </div>
        )}
      </aside>

      {/* =========================
         MOBILE SIDEBAR DRAWER (FIX)
      ========================= */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileSidebarOpen(false)}
          />

          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-black border-r border-white/10 p-6">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="mb-6"
            >
              <X />
            </button>

            <h1 className="text-xl font-bold mb-6">
              Uploaded PDFs
            </h1>

            <PdfSidebar />
          </div>
        </div>
      )}

      {/* =========================
         MAIN CHAT
      ========================= */}
      <section className="flex-1 flex flex-col pt-16 md:pt-0">

        {/* HEADER (desktop only) */}
        <div className="hidden md:block border-b border-white/10 p-6">
          <h2 className="text-2xl font-semibold">
            Research Chat
          </h2>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`max-w-4xl ${
                message.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`rounded-3xl px-6 py-5 border ${
                  message.role === "user"
                    ? "bg-violet-600 border-violet-500"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
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

        {/* INPUT */}
        <div className="border-t border-white/10 p-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask questions about selected PDFs..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

      </section>
    </main>
  );
}