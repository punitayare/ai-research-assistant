"use client";

import axios from "axios";
import {
  UploadCloud,
  FileText,
  ExternalLink,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface UploadedFile {
  name: string;
  url: string;
}

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingStep, setProcessingStep] = useState("");
  const [processingDone, setProcessingDone] = useState(false);

  useEffect(() => {
    fetchUploadedPdfs();
  }, []);

  const fetchUploadedPdfs = async () => {
    try {
      const res = await axios.get(
        "https://ai-research-assistant-production-0ae1.up.railway.app/uploaded-pdfs"
      );
      setUploadedFiles(res.data.pdfs || []);
    } catch (err) {
      console.error("Failed to load PDFs:", err);
      setUploadedFiles([]);
    }
  };

  const simulateProcessingSteps = async () => {
    setProcessingDone(false);

    const steps = [
      "Extracting text from PDF...",
      "Chunking document into sections...",
      "Generating embeddings...",
      "Storing vectors in ChromaDB...",
      "PDF processed successfully",
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      await new Promise((r) => setTimeout(r, 1200));
    }

    setProcessingDone(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      simulateProcessingSteps();

      const response = await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newFile: UploadedFile = {
        name: response.data.filename,
        url: response.data.file_url,
      };

      setUploadedFiles((prev) => [newFile, ...prev]);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(
        `https://ai-research-assistant-production-0ae1.up.railway.app/delete-pdf/${filename}`
      );

      setUploadedFiles((prev) =>
        prev.filter((file) => file.name !== filename)
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 md:px-6 py-10 md:py-16">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">

          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-3">
              AI Research Assistant
            </h1>

            <p className="text-gray-400 text-sm md:text-lg">
              Upload PDFs, build embeddings, and chat with your documents.
            </p>
          </div>

          <button
            onClick={() => router.push("/chat")}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-500 transition px-5 md:px-6 py-3 md:py-4 rounded-2xl font-medium"
          >
            <MessageSquare size={20} />
            Open Chat
          </button>
        </div>

        {/* UPLOAD BOX */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-violet-500 transition rounded-3xl bg-white/5 backdrop-blur-xl p-8 md:p-16 flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <UploadCloud
            size={50}
            className="md:size-[70px] text-violet-400 mb-4 md:mb-6"
          />

          <h2 className="text-xl md:text-3xl font-semibold mb-2 md:mb-3">
            {uploading ? "Processing PDF..." : "Upload Research PDF"}
          </h2>

          <p className="text-gray-500 text-sm md:text-base">
            Click to browse files
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* PROCESSING STATUS */}
        {(uploading || processingDone) && (
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-5 md:p-8">

            <div className="flex items-start md:items-center gap-4">

              {processingDone ? (
                <CheckCircle2 className="text-green-400" size={28} />
              ) : (
                <Loader2 className="animate-spin text-violet-400" size={28} />
              )}

              <div>
                <h3 className="text-lg md:text-xl font-semibold">
                  PDF Processing Pipeline
                </h3>

                <p className="text-gray-400 text-sm md:text-base mt-1">
                  {processingStep}
                </p>
              </div>
            </div>

            {/* STEPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 md:mt-8">

              {[
                "Text Extraction",
                "Chunking",
                "Embeddings",
                "Vector Storage",
              ].map((step, index) => (
                <div
                  key={index}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5"
                >
                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-sm">
                      {index + 1}
                    </div>

                    <h4 className="text-sm md:text-base font-medium">
                      {step}
                    </h4>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* PDF LIST */}
        <div className="mt-12 md:mt-14">

          <h2 className="text-xl md:text-2xl font-semibold mb-5 md:mb-6">
            Uploaded Papers ({uploadedFiles.length})
          </h2>

          {uploadedFiles.length === 0 ? (
            <div className="text-gray-500 text-sm md:text-base">
              No PDFs uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 hover:border-violet-500 transition"
                >
                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3 md:gap-4 min-w-0">

                      <div className="p-2 md:p-3 rounded-xl bg-violet-500/20">
                        <FileText className="text-violet-400" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-medium text-sm md:text-lg truncate max-w-[180px] md:max-w-[220px]">
                          {file.name}
                        </h3>

                        <p className="text-xs md:text-sm text-gray-500">
                          Research PDF
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-2 md:gap-3">

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 md:p-3 rounded-xl bg-white/10 hover:bg-violet-500/20 transition"
                      >
                        <ExternalLink size={16} />
                      </a>

                      <button
                        onClick={() => handleDelete(file.name)}
                        className="p-2 md:p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>

                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </main>
  );
}