export function calculatePageRankSteps(nodes = [], edges = [], options = {}) {
  const damping = options.damping ?? 0.85;
  const iterations = options.iterations ?? 12;

  if (!nodes.length) return [];

  const nodeIds = nodes.map((node) => node.id);
  const nodeCount = nodeIds.length;
  const initialRank = 1 / nodeCount;

  let ranks = Object.fromEntries(nodeIds.map((id) => [id, initialRank]));

  const outgoing = Object.fromEntries(nodeIds.map((id) => [id, []]));
  const incoming = Object.fromEntries(nodeIds.map((id) => [id, []]));

  edges.forEach((edge) => {
    if (!outgoing[edge.source] || !incoming[edge.target]) return;

    outgoing[edge.source].push(edge.target);
    incoming[edge.target].push(edge.source);
  });

  const steps = [
    {
      iteration: 0,
      ranks: { ...ranks },
    },
  ];

  for (let iteration = 1; iteration <= iterations; iteration += 1) {
    const nextRanks = {};

    nodeIds.forEach((nodeId) => {
      const incomingScore = incoming[nodeId].reduce((sum, sourceId) => {
        const sourceOutgoingCount = outgoing[sourceId].length || 1;
        return sum + ranks[sourceId] / sourceOutgoingCount;
      }, 0);

      nextRanks[nodeId] =
        (1 - damping) / nodeCount + damping * incomingScore;
    });

    ranks = nextRanks;

    steps.push({
      iteration,
      ranks: { ...ranks },
    });
  }

  return steps;
}

export function getTopRankedNodes(nodes = [], ranks = {}, limit = 5) {
  return nodes
    .map((node) => ({
      id: node.id,
      title: node.data?.title || "Untitled",
      score: ranks[node.id] || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}