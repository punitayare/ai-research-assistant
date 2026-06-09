"use client";

import { useEffect, useState } from "react";
import { Node, Edge } from "reactflow";

import MindMap from "@/components/ui/mindmap";
import { buildMindMap } from "@/lib/MindMap";

export default function Page() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch(
          "https://ai-research-assistant-production-0ae1.up.railway.app/uploaded-pdfs"
        );

        const data = await response.json();
        const pdfNames = data.pdfs.map((pdf: { name: string }) => pdf.name);

        setDocuments(pdfNames);

        if (pdfNames.length > 0) {
          setSelectedDocument(pdfNames[0]);
        }
      } catch (error) {
        console.error("Failed loading PDFs:", error);
      }
    }

    loadDocuments();
  }, []);

  async function generateMindMap() {
    if (!selectedDocument) {
      alert("Please select a document");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://ai-research-assistant-production-0ae1.up.railway.app/api/mindmap",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document_name: selectedDocument,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      const graph = buildMindMap(data);

      setNodes(graph.nodes);
      setEdges(graph.edges);
    } catch (error) {
      console.error("Failed to generate mindmap:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f0a1f] via-[#17102e] to-[#0b0718] text-white">

      {/* HEADER */}
      <div className="px-4 md:px-8 py-4 md:py-5 border-b border-purple-900/40 bg-black/20 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* TITLE */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
            AI Mind Map
          </h1>

          <p className="text-xs md:text-sm text-purple-300 mt-1">
            Transform research papers into visual knowledge maps
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full md:w-auto">

          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="w-full sm:min-w-[260px] bg-[#1f1638] border border-purple-700/40 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500"
          >
            {documents.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>

          <button
            onClick={generateMindMap}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 rounded-xl font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Mind Map"}
          </button>

        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-4 text-center">

            <div className="h-12 w-12 md:h-14 md:w-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />

            <p className="text-purple-300 text-sm md:text-lg">
              Building your mind map...
            </p>

          </div>

        ) : nodes.length > 0 ? (
          <div className="h-full w-full overflow-auto touch-pan-x touch-pan-y">
            <MindMap nodes={nodes} edges={edges} />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center">

            <div>

              <div className="text-6xl md:text-8xl mb-6">🧠</div>

              <h2 className="text-xl md:text-3xl font-semibold">
                Generate a Research Mind Map
              </h2>

              <p className="text-purple-300 mt-3 text-sm md:text-lg max-w-md mx-auto">
                Select an uploaded PDF and create an interactive visual representation of its content.
              </p>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}