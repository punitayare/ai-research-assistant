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
   <main className="min-h-screen bg-black text-white flex flex-col md:flex-row">

      {/* SIDEBAR */}
      <aside className="w-[280px] border-r border-white/10 bg-white/5 backdrop-blur-xl p-6 hidden md:flex flex-col">

        <h1 className="text-2xl font-bold mb-8">
          AI Research Assistant
        </h1>

        {/* CHAT LABEL */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
          Research Chat
        </div>

        {/* PDF DROPDOWN */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">

          <button
            onClick={() =>
              setShowPdfs(
                !showPdfs
              )
            }
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
          >

            <span>
              Uploaded PDFs
            </span>

            <ChevronDown
              size={18}
              className={`transition ${
                showPdfs
                  ? "rotate-180"
                  : ""
              }`}
            />
          </button>

          {showPdfs && (

            <div className="border-t border-white/10 max-h-72 overflow-y-auto">

              {pdfs.length === 0 ? (

                <div className="p-4 text-sm text-gray-500">
                  No PDFs uploaded
                </div>

              ) : (

                pdfs.map(
                  (pdf, i) => (

                    <div
                      key={i}
                      onClick={() =>
                        togglePdf(
                          pdf.name
                        )
                      }
                      className={`flex items-center gap-3 p-4 cursor-pointer border-b border-white/5 last:border-none transition ${
                        selectedPdfs.includes(
                          pdf.name
                        )
                          ? "bg-violet-500/20"
                          : "hover:bg-white/5"
                      }`}
                    >

                      <FileText
                        size={18}
                        className="text-violet-400"
                      />

                      <span className="text-sm truncate">
                        {pdf.name}
                      </span>

                    </div>
                  )
                )

              )}
            </div>

          )}
        </div>

        {/* SELECTED PDFs */}
        {selectedPdfs.length >
          0 && (

          <div className="mt-4 text-xs text-gray-400">

            Selected:
            {" "}
            {
              selectedPdfs.length
            }
            {" "}
            PDF(s)

          </div>
        )}
      </aside>
{/* MOBILE PDF SELECTOR */}
<div className="md:hidden border-b border-white/10 bg-black/80 backdrop-blur-xl p-4 sticky top-0 z-50">

  <button
    onClick={() => setShowPdfs(!showPdfs)}
    className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
  >
    <span>
      PDFs ({selectedPdfs.length} selected)
    </span>

    <ChevronDown
      size={18}
      className={`transition ${
        showPdfs ? "rotate-180" : ""
      }`}
    />
  </button>

  {showPdfs && (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 max-h-64 overflow-y-auto">

      {pdfs.length === 0 ? (
        <div className="p-4 text-sm text-gray-400">
          No PDFs uploaded
        </div>
      ) : (
        pdfs.map((pdf, i) => (
          <div
            key={i}
            onClick={() => togglePdf(pdf.name)}
            className={`flex items-center gap-3 p-4 border-b border-white/10 last:border-none cursor-pointer ${
              selectedPdfs.includes(pdf.name)
                ? "bg-violet-500/20"
                : "hover:bg-white/5"
            }`}
          >
            <FileText
              size={18}
              className="text-violet-400"
            />

            <span className="text-sm truncate flex-1">
              {pdf.name}
            </span>
          </div>
        ))
      )}
    </div>
  )}
</div>
      {/* MAIN CHAT */}
      <section className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="border-b border-white/10 p-4 md:p-6">

          <h2 className="text-2xl font-semibold">
            Research Chat
          </h2>

        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

          {messages.map(
            (
              message,
              index
            ) => (

              <div
                key={index}
                className={`max-w-4xl ${
                  message.role ===
                  "user"
                    ? "ml-auto"
                    : "mr-auto"
                }`}
              >

                {/* MESSAGE */}
                <div
                  className={`rounded-3xl px-6 py-5 border ${
                    message.role ===
                    "user"
                      ? "bg-violet-600 border-violet-500"
                      : "bg-white/5 border-white/10"
                  }`}
                >

                  <ReactMarkdown>
                    {
                      message.content
                    }
                  </ReactMarkdown>

                </div>

                {/* SOURCES */}
                {message.sources &&
                  message.sources
                    .length > 0 && (

                  <div className="mt-4 space-y-3">

                    <p className="text-sm text-gray-400">
                      Sources
                    </p>

                    {message.sources.map(
                      (
                        src,
                        i
                      ) => (

                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10"
                        >

                          <p className="text-sm text-gray-300 leading-relaxed">

                            {src.content?.slice(
                              0,
                              300
                            )}

                            ...

                          </p>

                          <div className="mt-3 text-xs text-violet-300">

                            PDF:
                            {" "}
                            {src.source}

                          </div>

                        </div>
                      )
                    )}
                  </div>

                )}
              </div>
            )
          )}

          {/* LOADING */}
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
              onChange={(e) =>
                setQuery(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask questions about selected PDFs..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500"
            />

            <button
              onClick={
                sendMessage
              }
              disabled={loading}
              className="w-14 h-14 rounded-2xl bg-violet-600 hover:bg-violet-500 transition flex items-center justify-center disabled:opacity-50"
            >

              <Send size={20} />

            </button>
          </div>
        </div>
      </section>
    </main>
  );
}