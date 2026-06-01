"use client";

import ReactFlow from "reactflow";
import "reactflow/dist/style.css";

interface Props {
  nodes: any[];
  edges: any[];
}

export default function MindMap({
  nodes,
  edges,
}: Props) {
  return (
    <div className="h-screen w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
      />
    </div>
  );
}