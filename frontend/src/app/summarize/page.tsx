
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
import {
  useEffect,
  useState,
  useRef,
} from "react";

interface UploadedPDF {
  name: string;
  url: string;
}

interface Flashcard {
  question: string;
  answer: string;
}

export default function StudyPage() {

  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [pdfs, setPdfs] = useState<
    UploadedPDF[]
  >([]);

  const [selectedPDF, setSelectedPDF] =
    useState("");

  const [summary, setSummary] =
    useState("");

  const [flashcards, setFlashcards] =
    useState<Flashcard[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [loadingSummary, setLoadingSummary] =
    useState(false);

  const [
    loadingFlashcards,
    setLoadingFlashcards,
  ] = useState(false);

  const [activeCard, setActiveCard] =
    useState<number | null>(null);

  const [
    selectedLanguage,
    setSelectedLanguage,
  ] = useState("English");

  const languages = [
    "English",
    "Hindi",
    "Marathi",
    "French",
    "German",
    "Spanish",
  ];

  // FETCH PDFs

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {

    try {

      const response =
        await axios.get(
          "https://ai-research-assistant-production-0ae1.up.railway.app/study-uploaded-pdfs"
        );

      setPdfs(response.data.pdfs);

    } catch (error) {

      console.error(error);

    }
  };

  // UPLOAD PDF

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {

      setUploading(true);

      await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/study-upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      fetchPDFs();

    } catch (error) {

      console.error(error);

    } finally {

      setUploading(false);

    }
  };

  const handleDeletePDF = async (
  filename: string,
  e: React.MouseEvent
) => {
  e.stopPropagation();

  const confirmed = window.confirm(
    `Delete "${filename}"?`
  );

  if (!confirmed) return;

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

  // SELECT PDF ONLY


  const handleSelectPDF = (
    pdfName: string
  ) => {

    setSelectedPDF(pdfName);

    // CLEAR OLD CONTENT

    setSummary("");

    setFlashcards([]);

    setActiveCard(null);
  };

  // GENERATE SUMMARY

  const generateSummary = async () => {

    if (!selectedPDF) return;

    try {

      setLoadingSummary(true);

      const response =
        await axios.post(
          "https://ai-research-assistant-production-0ae1.up.railway.app/summarize",
          {
            filename: selectedPDF,
            language:
              selectedLanguage,
          }
        );

      setSummary(
        response.data.summary
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoadingSummary(false);

    }
  };

  // GENERATE FLASHCARDS

  const generateFlashcards =
    async () => {

      if (!selectedPDF) return;

      try {

        setLoadingFlashcards(true);

        const response =
          await axios.post(
            "https://ai-research-assistant-production-0ae1.up.railway.app/flashcards",
            {
              filename:
                selectedPDF,
              language:
                selectedLanguage,
            }
          );

        const cards =
          response.data.flashcards;

        if (Array.isArray(cards)) {

          setFlashcards(cards);

        } else {

          setFlashcards([]);

        }

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

      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              AI Study Assistant
            </h1>

            <p className="text-gray-400 mt-1">
              Generate summaries &
              flashcards
            </p>

          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-500/10 border border-violet-500/20">

            <Sparkles
              size={18}
              className="text-violet-400"
            />

            <span className="text-sm">
              AI Powered Learning
            </span>

          </div>

        </div>

      </div>

      {/* BODY */}

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

        {/* SIDEBAR */}

        <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 h-fit">

          {/* UPLOAD */}

          <div
            onClick={() =>
              inputRef.current?.click()
            }
            className="mb-6 rounded-3xl border-2 border-dashed border-white/10 hover:border-violet-500 transition-all p-8 text-center cursor-pointer"
          >

            <UploadCloud
              size={42}
              className="mx-auto text-violet-400 mb-4"
            />

            <h2 className="text-lg font-semibold">

              {uploading
                ? "Uploading..."
                : "Upload PDF"}

            </h2>

            <p className="text-sm text-gray-500 mt-2">
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

          <div className="flex items-center gap-3 mb-6">

            <FileText className="text-violet-400" />

            <h2 className="text-xl font-semibold">
              Uploaded PDFs
            </h2>

          </div>

          <div className="space-y-3">

          {pdfs.map((pdf, index) => (
  <div
    key={index}
    onClick={() =>
      handleSelectPDF(pdf.name)
    }
    className={`w-full p-4 rounded-2xl border transition-all cursor-pointer ${
      selectedPDF === pdf.name
        ? "border-violet-500 bg-violet-500/10"
        : "border-white/10 bg-white/5 hover:bg-white/10"
    }`}
  >
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="w-11 h-11 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <BookOpen
            size={20}
            className="text-violet-400"
          />
        </div>

        <div>
          <p className="font-medium truncate max-w-[180px]">
            {pdf.name}
          </p>

          <p className="text-sm text-gray-500">
            Research Paper
          </p>
        </div>

      </div>

      <button
        onClick={(e) =>
          handleDeletePDF(
            pdf.name,
            e
          )
        }
        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
        title="Delete PDF"
      >
        <Trash2 size={18} />
      </button>

    </div>
  </div>
))}

          </div>

        </aside>

        {/* MAIN CONTENT */}

        <section className="space-y-8">

          {/* ACTION BAR */}

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">

            <div className="flex flex-col gap-6">

              {/* SELECTED PDF */}

              <div>

                <p className="text-sm text-gray-400 mb-2">
                  Selected PDF
                </p>

                <div className="inline-block px-4 py-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">

                  {selectedPDF ||
                    "No PDF Selected"}

                </div>

              </div>

              {/* LANGUAGE */}

              <div>

                <p className="text-sm text-gray-400 mb-3">
                  Output Language
                </p>

                <div className="flex flex-wrap gap-3">

                  {languages.map(
                    (language) => (

                      <button
                        key={language}
                        onClick={() =>
                          setSelectedLanguage(
                            language
                          )
                        }
                        className={`
                          px-4 py-2 rounded-xl border transition
                          ${
                            selectedLanguage ===
                            language
                              ? "bg-violet-600 border-violet-500"
                              : "bg-white/5 border-white/10"
                          }
                        `}
                      >

                        {language}

                      </button>

                    )
                  )}

                </div>

              </div>

              {/* ACTION BUTTONS */}

              <div className="flex flex-wrap gap-4">

                <button
                  onClick={
                    generateSummary
                  }
                  disabled={!selectedPDF}
                  className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 transition font-medium disabled:opacity-50"
                >

                  Generate Summary

                </button>

                <button
                  onClick={
                    generateFlashcards
                  }
                  disabled={!selectedPDF}
                  className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 transition font-medium disabled:opacity-50"
                >

                  Generate Flashcards

                </button>

              </div>

            </div>

          </div>

          {/* SUMMARY */}

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center">

                <Brain className="text-cyan-400" />

              </div>

              <div>

                <h2 className="text-2xl font-bold">
                  AI Summary
                </h2>

                <p className="text-gray-400">
                  Intelligent paper summarization
                </p>

              </div>

            </div>

            {loadingSummary ? (

              <div className="flex items-center gap-3 text-gray-400">

                <Loader2
                  className="animate-spin"
                  size={20}
                />

                Generating summary...

              </div>

            ) : summary ? (

              <div className="prose prose-invert max-w-none">

                <p className="whitespace-pre-line leading-8 text-gray-300">

                  {summary}

                </p>

              </div>

            ) : (

              <p className="text-gray-500">
                Generate a summary
              </p>

            )}

          </div>

          {/* FLASHCARDS */}

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

            <div className="flex items-center gap-3 mb-8">

              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">

                <Layers3 className="text-violet-400" />

              </div>

              <div>

                <h2 className="text-2xl font-bold">
                  AI Flashcards
                </h2>

                <p className="text-gray-400">
                  Interactive learning cards
                </p>

              </div>

            </div>

            {loadingFlashcards ? (

              <div className="flex items-center gap-3 text-gray-400">

                <Loader2
                  className="animate-spin"
                  size={20}
                />

                Generating flashcards...

              </div>

            ) : flashcards.length > 0 ? (

              <div className="grid md:grid-cols-2 gap-6">

                {flashcards.map(
                  (card, index) => (

                    <div
                      key={index}
                      onClick={() =>
                        setActiveCard(
                          activeCard ===
                            index
                            ? null
                            : index
                        )
                      }
                      className="cursor-pointer rounded-3xl border border-white/10 bg-black/30 p-6 hover:border-violet-500 transition-all min-h-[240px] flex flex-col justify-between"
                    >

                      <div>

                        <p className="text-sm text-violet-400 mb-4">
                          QUESTION
                        </p>

                        <h3 className="text-lg font-semibold leading-relaxed">

                          {card.question}

                        </h3>

                      </div>

                      <div className="mt-8">

                        {activeCard ===
                        index ? (

                          <div>

                            <p className="text-sm text-cyan-400 mb-3">
                              ANSWER
                            </p>

                            <p className="text-gray-300 leading-7">

                              {
                                card.answer
                              }

                            </p>

                          </div>

                        ) : (

                          <p className="text-gray-500 text-sm">
                            Click to reveal answer
                          </p>

                        )}

                      </div>

                    </div>

                  )
                )}

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

