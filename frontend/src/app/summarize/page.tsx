"use client";

import axios from "axios";
import {
  BookOpen,
  Brain,
  FileText,
  Layers3,
  Loader2,
  Sparkles,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface UploadedPDF {
  name: string;
  url: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

export default function StudyPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [pdfs, setPdfs] = useState<UploadedPDF[]>([]);
  const [selectedPDF, setSelectedPDF] = useState("");
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const languages = ["English", "Hindi", "Marathi", "French", "German", "Spanish"];

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      const response = await axios.get(
        "https://ai-research-assistant-production-0ae1.up.railway.app/study-uploaded-pdfs"
      );
      setPdfs(response.data.pdfs);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/study-upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      fetchPDFs();
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePDF = async (filename: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      await axios.delete(
        `https://ai-research-assistant-production-0ae1.up.railway.app/study-upload/${encodeURIComponent(
          filename
        )}`
      );

      if (selectedPDF === filename) {
        setSelectedPDF("");
        setSummary("");
        setFlashcards([]);
        setActiveCard(null);
      }

      fetchPDFs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectPDF = (pdfName: string) => {
    setSelectedPDF(pdfName);
    setSummary("");
    setFlashcards([]);
    setActiveCard(null);
  };

  const generateSummary = async () => {
    if (!selectedPDF) return;

    try {
      setLoadingSummary(true);

      const response = await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/summarize",
        {
          filename: selectedPDF,
          language: selectedLanguage,
        }
      );

      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateFlashcards = async () => {
    if (!selectedPDF) return;

    try {
      setLoadingFlashcards(true);

      const response = await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/flashcards",
        {
          filename: selectedPDF,
          language: selectedLanguage,
        }
      );

      setFlashcards(response.data.flashcards || []);
    } catch (error) {
      console.error(error);
      setFlashcards([]);
    } finally {
      setLoadingFlashcards(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              AI Study Assistant
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              Generate summaries & flashcards
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-500/10 border border-violet-500/20 w-fit">
            <Sparkles size={16} className="text-violet-400" />
            <span className="text-xs md:text-sm">
              AI Powered Learning
            </span>
          </div>

        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 md:gap-8">

        {/* SIDEBAR */}
        <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-6 h-fit">

          {/* UPLOAD */}
          <div
            onClick={() => inputRef.current?.click()}
            className="mb-6 rounded-3xl border-2 border-dashed border-white/10 hover:border-violet-500 p-6 md:p-8 text-center cursor-pointer"
          >
            <UploadCloud size={40} className="mx-auto text-violet-400 mb-3" />
            <h2 className="text-base md:text-lg font-semibold">
              {uploading ? "Uploading..." : "Upload PDF"}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-2">
              Click to upload study paper
            </p>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          {/* PDF LIST */}
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-violet-400" />
            <h2 className="text-lg md:text-xl font-semibold">
              Uploaded PDFs
            </h2>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto">

            {pdfs.map((pdf, index) => (
              <div
                key={index}
                onClick={() => handleSelectPDF(pdf.name)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedPDF === pdf.name
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">

                  <div className="flex items-center gap-3 min-w-0">

                    <BookOpen className="text-violet-400" />

                    <p className="text-sm truncate">
                      {pdf.name}
                    </p>

                  </div>

                  <button
                    onClick={(e) => handleDeletePDF(pdf.name, e)}
                    className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>
            ))}

          </div>

        </aside>

        {/* MAIN */}
        <section className="space-y-6 md:space-y-8">

          {/* ACTION BAR */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">

            <div className="flex flex-col gap-5">

              <div className="text-sm text-gray-400">
                Selected PDF:
                <span className="text-white ml-2">
                  {selectedPDF || "None"}
                </span>
              </div>

              {/* LANGUAGE */}
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-2 rounded-xl text-xs md:text-sm border ${
                      selectedLanguage === lang
                        ? "bg-violet-600 border-violet-500"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={generateSummary}
                  disabled={!selectedPDF}
                  className="flex-1 px-4 py-3 rounded-2xl bg-cyan-500 disabled:opacity-50"
                >
                  Generate Summary
                </button>

                <button
                  onClick={generateFlashcards}
                  disabled={!selectedPDF}
                  className="flex-1 px-4 py-3 rounded-2xl bg-violet-600 disabled:opacity-50"
                >
                  Generate Flashcards
                </button>
              </div>

            </div>

          </div>

          {/* SUMMARY */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8">

            <h2 className="text-lg md:text-2xl font-bold mb-4">
              AI Summary
            </h2>

            {loadingSummary ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="animate-spin" size={18} />
                Generating...
              </div>
            ) : (
              <p className="text-gray-300 whitespace-pre-line text-sm md:text-base">
                {summary || "Generate a summary"}
              </p>
            )}

          </div>

          {/* FLASHCARDS */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-8">

            <h2 className="text-lg md:text-2xl font-bold mb-4">
              AI Flashcards
            </h2>

            {loadingFlashcards ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="animate-spin" size={18} />
                Generating...
              </div>
            ) : flashcards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {flashcards.map((card, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      setActiveCard(activeCard === i ? null : i)
                    }
                    className="p-5 rounded-3xl border border-white/10 bg-black/30 cursor-pointer"
                  >
                    <p className="text-violet-400 text-xs mb-2">
                      QUESTION
                    </p>

                    <p className="font-medium">
                      {card.question}
                    </p>

                    {activeCard === i && (
                      <div className="mt-4">
                        <p className="text-cyan-400 text-xs mb-2">
                          ANSWER
                        </p>
                        <p className="text-gray-300 text-sm">
                          {card.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            ) : (
              <p className="text-gray-500">
                Generate flashcards
              </p>
            )}

          </div>

        </section>

      </div>

    </main>
  );
}