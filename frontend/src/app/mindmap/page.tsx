"use client";

import { useEffect, useState } from "react";
import { Node, Edge } from "reactflow";

import MindMap from "@/components/ui/mindmap";
import { buildMindMap } from "@/lib/MindMap";

export default function Page() {
  const [documents, setDocuments] =
    useState<string[]>([]);

  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState("");

  const [nodes, setNodes] =
    useState<Node[]>([]);

  const [edges, setEdges] =
    useState<Edge[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    async function loadDocuments() {
      try {
        const response = await fetch(
          "http://localhost:8000/uploaded-pdfs"
        );

        const data = await response.json();

        const pdfNames = data.pdfs.map(
          (pdf: { name: string }) =>
            pdf.name
        );

        setDocuments(pdfNames);

        if (pdfNames.length > 0) {
          setSelectedDocument(
            pdfNames[0]
          );
        }
      } catch (error) {
        console.error(
          "Failed loading PDFs:",
          error
        );
      }
    }

    loadDocuments();
  }, []);

  async function generateMindMap() {
    if (!selectedDocument) {
      alert(
        "Please select a document"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/mindmap",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            document_name:
              selectedDocument,
          }),
        }
      );

      if (!response.ok) {
        const error =
          await response.text();

        throw new Error(error);
      }

      const data =
        await response.json();

      console.log(
        "MindMap Response:",
        data
      );

      const graph =
        buildMindMap(data);

      setNodes(graph.nodes);
      setEdges(graph.edges);
    } catch (error) {
      console.error(
        "Failed to generate mindmap:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
      h-screen
      flex
      flex-col
      bg-gradient-to-br
      from-[#0f0a1f]
      via-[#17102e]
      to-[#0b0718]
      text-white
      "
    >
      {/* Header */}

      <div
        className="
        px-8
        py-5
        border-b
        border-purple-900/40
        bg-black/20
        backdrop-blur-md
        flex
        items-center
        justify-between
        "
      >
        <div>
          <h1
            className="
            text-3xl
            font-bold
            bg-gradient-to-r
            from-violet-400
            via-fuchsia-400
            to-purple-400
            bg-clip-text
            text-transparent
            "
          >
            AI Mind Map
          </h1>

          <p
            className="
            text-sm
            text-purple-300
            mt-1
            "
          >
            Transform research papers
            into visual knowledge maps
          </p>
        </div>

        <div
          className="
          flex
          items-center
          gap-4
          "
        >
          <select
            value={selectedDocument}
            onChange={(e) =>
              setSelectedDocument(
                e.target.value
              )
            }
            className="
            min-w-[260px]
            bg-[#1f1638]
            border
            border-purple-700/40
            rounded-xl
            px-4
            py-2
            text-white
            outline-none
            focus:ring-2
            focus:ring-violet-500
            "
          >
            {documents.map((doc) => (
              <option
                key={doc}
                value={doc}
              >
                {doc}
              </option>
            ))}
          </select>

          <button
            onClick={
              generateMindMap
            }
            disabled={loading}
            className="
            px-5
            py-2
            rounded-xl
            font-medium
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-600
            hover:from-violet-500
            hover:to-fuchsia-500
            transition-all
            duration-200
            shadow-lg
            shadow-purple-900/30
            disabled:opacity-50
            disabled:cursor-not-allowed
            "
          >
            {loading
              ? "Generating..."
              : "Generate Mind Map"}
          </button>
        </div>
      </div>

      {/* Content */}

      <div className="flex-1">
        {loading ? (
          <div
            className="
            flex
            flex-col
            items-center
            justify-center
            h-full
            gap-5
            "
          >
            <div
              className="
              h-14
              w-14
              border-4
              border-violet-500
              border-t-transparent
              rounded-full
              animate-spin
              "
            />

            <p
              className="
              text-purple-300
              text-lg
              "
            >
              Building your mind map...
            </p>
          </div>
        ) : nodes.length > 0 ? (
          <MindMap
            nodes={nodes}
            edges={edges}
          />
        ) : (
          <div
            className="
            flex
            h-full
            items-center
            justify-center
            "
          >
            <div className="text-center">
              <div
                className="
                text-8xl
                mb-6
                "
              >
                🧠
              </div>

              <h2
                className="
                text-3xl
                font-semibold
                "
              >
                Generate a Research
                Mind Map
              </h2>

              <p
                className="
                text-purple-300
                mt-3
                text-lg
                "
              >
                Select an uploaded PDF
                and create an interactive
                visual representation
                of its content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}