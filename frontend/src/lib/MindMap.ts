import { Edge, Node } from "reactflow";

export function buildMindMap(data: any) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: "root",
    data: {
      label: data.main_topic || "Research Paper",
    },
    position: {
      x: 500,
      y: 50,
    },
  });

  const sections = [
    "methodology",
    "dataset",
    "results",
    "future_work",
  ];

  sections.forEach(
    (section, index) => {

      const sectionId = section;

      nodes.push({
        id: sectionId,
        data: {
          label: section
            .replace("_", " ")
            .toUpperCase(),
        },
        position: {
          x: 200 + index * 250,
          y: 250,
        },
      });

      edges.push({
        id: `${section}-edge`,
        source: "root",
        target: sectionId,
      });

      (data[section] || []).forEach(
        (
          item: string,
          i: number
        ) => {

          const nodeId =
            `${section}-${i}`;

          nodes.push({
            id: nodeId,
            data: {
              label: item,
            },
            position: {
              x: 200 + index * 250,
              y: 450 + i * 100,
            },
          });

          edges.push({
            id: `${section}-${i}`,
            source: sectionId,
            target: nodeId,
          });
        }
      );
    }
  );

  return {
    nodes,
    edges,
  };
}