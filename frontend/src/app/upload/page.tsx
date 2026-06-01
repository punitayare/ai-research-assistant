
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

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

interface UploadedFile {
  name: string;
  url: string;
}

export default function UploadPage() {

  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [uploadedFiles, setUploadedFiles] =
    useState<UploadedFile[]>([]);

  const [processingStep, setProcessingStep] =
    useState("");

  const [processingDone, setProcessingDone] =
    useState(false);

  useEffect(() => {
    fetchUploadedPdfs();
  }, []);

  const fetchUploadedPdfs = async () => {

    try {

      const res = await axios.get(
        "http://127.0.0.1:8000/uploaded-pdfs"
      );

      setUploadedFiles(
        res.data.pdfs || []
      );

    } catch (err) {

      console.error(
        "Failed to load PDFs:",
        err
      );

      setUploadedFiles([]);

    }
  };

  const simulateProcessingSteps = async () => {

    setProcessingDone(false);

    setProcessingStep(
      "Extracting text from PDF..."
    );

    await new Promise(
      (r) => setTimeout(r, 1500)
    );

    setProcessingStep(
      "Chunking document into sections..."
    );

    await new Promise(
      (r) => setTimeout(r, 1500)
    );

    setProcessingStep(
      "Generating embeddings..."
    );

    await new Promise(
      (r) => setTimeout(r, 2000)
    );

    setProcessingStep(
      "Storing vectors in ChromaDB..."
    );

    await new Promise(
      (r) => setTimeout(r, 1500)
    );

    setProcessingStep(
      "PDF processed successfully"
    );

    setProcessingDone(true);
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {

      setUploading(true);

      simulateProcessingSteps();

      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      const newFile: UploadedFile = {
        name: response.data.filename,
        url: response.data.file_url,
      };

      setUploadedFiles(
        (prev) => [newFile, ...prev]
      );

    } catch (error) {

      console.error(error);

    } finally {

      setUploading(false);

    }
  };

  const handleDelete = async (
    filename: string
  ) => {

    try {

      await axios.delete(
        `http://127.0.0.1:8000/delete-pdf/${filename}`
      );

      setUploadedFiles((prev) =>
        prev.filter(
          (file) => file.name !== filename
        )
      );

    } catch (err) {

      console.error(
        "Delete failed:",
        err
      );

    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold mb-3">
              AI Research Assistant
            </h1>

            <p className="text-gray-400 text-lg">
              Upload PDFs, build embeddings,
              and chat with your documents.
            </p>

          </div>

          {/* CHAT BUTTON */}

          <button
            onClick={() => router.push("/chat")}
            className="flex items-center gap-3 bg-violet-600 hover:bg-violet-500 transition px-6 py-4 rounded-2xl font-medium"
          >
            <MessageSquare size={22} />

            Open Chat
          </button>

        </div>

        {/* UPLOAD BOX */}

        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-violet-500 transition-all rounded-3xl bg-white/5 backdrop-blur-xl p-16 flex flex-col items-center justify-center text-center cursor-pointer"
        >

          <UploadCloud
            size={70}
            className="text-violet-400 mb-6"
          />

          <h2 className="text-3xl font-semibold mb-3">

            {uploading
              ? "Processing PDF..."
              : "Upload Research PDF"}

          </h2>

          <p className="text-gray-500">
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

          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-8">

            <div className="flex items-center gap-4">

              {processingDone ? (

                <CheckCircle2
                  className="text-green-400"
                  size={30}
                />

              ) : (

                <Loader2
                  className="animate-spin text-violet-400"
                  size={30}
                />

              )}

              <div>

                <h3 className="text-xl font-semibold">
                  PDF Processing Pipeline
                </h3>

                <p className="text-gray-400 mt-1">
                  {processingStep}
                </p>

              </div>

            </div>

            {/* STEPS */}

            <div className="grid md:grid-cols-4 gap-4 mt-8">

              {[
                "Text Extraction",
                "Chunking",
                "Embeddings",
                "Vector Storage",
              ].map((step, index) => (

                <div
                  key={index}
                  className="bg-black/40 border border-white/10 rounded-2xl p-5"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">

                      {index + 1}

                    </div>

                    <div>

                      <h4 className="font-medium">
                        {step}
                      </h4>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

        {/* PDF LIST */}

        <div className="mt-14">

          <h2 className="text-2xl font-semibold mb-6">

            Uploaded Papers
            ({uploadedFiles.length})

          </h2>

          {uploadedFiles.length === 0 ? (

            <div className="text-gray-500">
              No PDFs uploaded yet.
            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-5">

              {uploadedFiles.map(
                (file, index) => (

                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-violet-500 transition"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-4">

                        <div className="p-3 rounded-xl bg-violet-500/20">

                          <FileText className="text-violet-400" />

                        </div>

                        <div>

                          <h3 className="font-medium text-lg truncate max-w-[220px]">

                            {file.name}

                          </h3>

                          <p className="text-sm text-gray-500">

                            Research PDF

                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        {/* OPEN PDF */}

                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-white/10 hover:bg-violet-500/20 transition"
                        >

                          <ExternalLink size={18} />

                        </a>

                        {/* DELETE */}

                        <button
                          onClick={() =>
                            handleDelete(
                              file.name
                            )
                          }
                          className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition"
                        >

                          <Trash2
                            size={18}
                            className="text-red-400"
                          />

                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    </main>
  );


}