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
      console.error(err);
      setUploadedFiles([]);
    }
  };

  const simulateProcessingSteps = async () => {
    setProcessingDone(false);

    const steps = [
      "Extracting text...",
      "Chunking document...",
      "Generating embeddings...",
      "Storing vectors...",
      "Completed",
    ];

    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      await new Promise((r) => setTimeout(r, 1000));
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

      simulateProcessingSteps(); // don’t await (UI bug fix)

      await axios.post(
        "https://ai-research-assistant-production-0ae1.up.railway.app/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      await fetchUploadedPdfs();
    } catch (err) {
      console.error(err);
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
        prev.filter((f) => f.name !== filename)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold">
              AI Research Assistant
            </h1>
            <p className="text-gray-400">
              Upload PDFs and chat with them
            </p>
          </div>

          <button
            onClick={() => router.push("/chat")}
            className="bg-violet-600 px-5 py-3 rounded-2xl flex gap-2 items-center"
          >
            <MessageSquare size={18} />
            Open Chat
          </button>
        </div>

        {/* UPLOAD */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-white/10 p-16 rounded-3xl text-center cursor-pointer"
        >
          <UploadCloud className="mx-auto text-violet-400 mb-4" size={50} />

          <h2 className="text-2xl">
            {uploading ? "Uploading..." : "Upload PDF"}
          </h2>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* STATUS */}
        {processingStep && (
          <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              {processingDone ? (
                <CheckCircle2 className="text-green-400" />
              ) : (
                <Loader2 className="animate-spin text-violet-400" />
              )}
              <p>{processingStep}</p>
            </div>
          </div>
        )}

        {/* FILE LIST */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {uploadedFiles.map((file, i) => (
            <div
              key={i}
              className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-violet-400" />
                <span className="truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>

              <div className="flex gap-3">
                <a href={file.url} target="_blank">
                  <ExternalLink />
                </a>

                <button onClick={() => handleDelete(file.name)}>
                  <Trash2 className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}