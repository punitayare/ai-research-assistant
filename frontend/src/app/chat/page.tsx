"use client";

import axios from "axios";
import { Send, ChevronDown, FileText, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

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
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const res = await axios.get(
        "https://ai-research-assistant-production-0ae1.up.railway.app/uploaded-pdfs"
      );
      setPdfs(res.data.pdfs || []);
    } catch (err) {
      console.error(err);
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
      alert("Select at least one PDF");
      return;
    }

    const current = query.trim();

    setMessages((prev) => [...prev, { role: "user", content: current }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/chat",
        {
          query: current,
          document_names: selectedPdfs,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error occurred" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col md:flex-row">

      {/* TOP BAR MOBILE */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
        <h1>AI Research</h1>
        <button onClick={() => setMobileOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-[300px] flex-col border-r border-white/10 p-6">
        <h1 className="text-xl font-bold mb-4">PDFs</h1>

        <div className="space-y-2 overflow-y-auto">
          {pdfs.map((pdf, i) => (
            <div
              key={i}
              onClick={() => togglePdf(pdf.name)}
              className={`p-3 rounded-xl cursor-pointer flex items-center gap-2 border ${
                selectedPdfs.includes(pdf.name)
                  ? "bg-violet-500/20 border-violet-500"
                  : "border-white/10"
              }`}
            >
              <FileText size={16} />
              <span className="truncate">{pdf.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* MOBILE DRAWER (FIXED TOUCH ISSUE) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative w-[280px] bg-black border-r border-white/10 p-4 z-50">
            <button onClick={() => setMobileOpen(false)}>
              <X />
            </button>

            <div className="mt-4 space-y-2">
              {pdfs.map((pdf, i) => (
                <div
                  key={i}
                  onClick={() => togglePdf(pdf.name)}
                  className={`p-3 rounded-xl border ${
                    selectedPdfs.includes(pdf.name)
                      ? "bg-violet-500/20"
                      : ""
                  }`}
                >
                  {pdf.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CHAT */}
      <section className="flex-1 flex flex-col h-screen">

        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-2xl ${
                m.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400">Thinking...</div>
          )}

        </div>

        {/* INPUT */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
            className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl"
          />

          <button
            onClick={sendMessage}
            className="px-4 bg-violet-600 rounded-xl"
          >
            <Send />
          </button>
        </div>

      </section>
    </main>
  );
}