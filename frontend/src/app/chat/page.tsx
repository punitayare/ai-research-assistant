"use client";

import axios from "axios";

import {
  Send,
  ChevronDown,
  FileText,
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

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        content:
          "Hello! Upload PDFs and ask questions about them.",
      },
    ]);

  // PDFs
  const [pdfs, setPdfs] =
    useState<PdfFile[]>([]);

  const [showPdfs, setShowPdfs] =
    useState(false);

  const [selectedPdfs, setSelectedPdfs] =
    useState<string[]>([]);

  /* =========================
     FETCH PDFs
  ========================= */

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

      console.error(
        "PDF fetch failed:",
        err
      );

    }
  };

  /* =========================
     PDF TOGGLE
  ========================= */

  const togglePdf = (
    name: string
  ) => {

    setSelectedPdfs((prev) =>

      prev.includes(name)
        ? prev.filter(
            (p) => p !== name
          )
        : [...prev, name]

    );
  };

  /* =========================
     SEND MESSAGE
  ========================= */

  const sendMessage = async () => {

    if (!query.trim()) return;
  
if (selectedPdfs.length === 0) {

  alert(
    "Please select at least one PDF"
  );

  return;
}


    const currentQuery =
      query.trim();

    const userMessage: Message = {
      role: "user",
      content: currentQuery,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setQuery("");
    setLoading(true);

    try {

      const response =
        await axios.post(
          "https://ai-research-assistant-production-0ae1.up.railway.app/chat",
          {
            query: currentQuery,
            document_names:
              selectedPdfs,
          }
        );

      const aiMessage: Message = {
        role: "assistant",
        content:
          response.data.answer,
        sources:
          response.data.sources || [],
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong.",
        },
      ]);

    } finally {

      setLoading(false);

    }
  };

  /* =========================
     ENTER TO SEND
  ========================= */

  const handleKeyDown = (
    e: React.KeyboardEvent<
      HTMLInputElement
    >
  ) => {

    if (
      e.key === "Enter" &&
      !loading
    ) {
      sendMessage();
    }
  };

  /* =========================
     UI
  ========================= */

  return (
   <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">

  {/* MOBILE PDF SELECTOR */}
  <div className="md:hidden border-b border-white/10 bg-black/80 backdrop-blur-xl p-4 sticky top-0 z-50">
    <button
      onClick={() => setShowPdfs(!showPdfs)}
      className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
    >
      <span className="font-medium">
        PDFs ({selectedPdfs.length} selected)
      </span>

      <ChevronDown
        size={18}
        className={`transition-transform duration-300 ${
          showPdfs ? "rotate-180" : ""
        }`}
      />
    </button>

    {showPdfs && (
      <div className="mt-3 rounded-xl border border-white/10 bg-black max-h-64 overflow-y-auto">
        {pdfs.map((pdf, i) => (
          <div
            key={i}
            onClick={() => togglePdf(pdf.name)}
            className={`p-3 border-b border-white/5 cursor-pointer transition ${
              selectedPdfs.includes(pdf.name)
                ? "bg-violet-500/20 text-violet-300"
                : "hover:bg-white/5"
            }`}
          >
            {pdf.name}
          </div>
        ))}
      </div>
    )}
  </div>

  {/* DESKTOP SIDEBAR */}
  <aside className="hidden md:flex w-[280px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 flex-col shrink-0">

    <h2 className="text-xl font-bold mb-6">
      PDFs
    </h2>

    <div className="flex-1 overflow-y-auto space-y-2">
      {pdfs.map((pdf, i) => (
        <button
          key={i}
          onClick={() => togglePdf(pdf.name)}
          className={`w-full text-left p-3 rounded-xl transition ${
            selectedPdfs.includes(pdf.name)
              ? "bg-violet-500/20 border border-violet-500/40"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          {pdf.name}
        </button>
      ))}
    </div>

  </aside>

  {/* MAIN CONTENT */}
  <main className="flex-1 min-w-0 flex flex-col">

    {/* HEADER */}
    <div className="border-b border-white/10 p-4 md:p-6 backdrop-blur-xl bg-black/40 sticky top-0 md:static z-40">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-xl md:text-3xl font-bold">
            PDF Workspace
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Search, summarize and chat with selected PDFs
          </p>
        </div>

        <button
          className="w-full md:w-auto px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 transition"
        >
          Upload PDF
        </button>

      </div>
    </div>

    {/* CONTENT */}
    <div className="flex-1 overflow-y-auto p-4 md:p-8">

      <div className="max-w-6xl mx-auto">

        {/* SEARCH */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Ask anything..."
            className="
              w-full
              rounded-2xl
              bg-white/5
              border
              border-white/10
              px-4
              py-4
              text-sm
              md:text-base
              outline-none
              focus:border-violet-500
            "
          />
        </div>

        {/* RESULTS */}
        <div className="
          rounded-3xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          p-4
          md:p-8
          min-h-[400px]
        ">
          {/* Existing Result UI Here */}
        </div>

      </div>

    </div>

  </main>

</div>
  );
}