const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export async function fetchSummary(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/summary?${query}`);
  if (!res.ok) throw new Error("Failed to fetch summary metrics");
  return res.json();
}

export async function fetchWorks(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/works?${query}`);
  if (!res.ok) throw new Error("Failed to fetch works queue");
  return res.json();
}

export async function fetchWorkExplanation(workId) {
  const res = await fetch(`${API_BASE_URL}/works/${workId}/explanation`);
  if (!res.ok) throw new Error(`Failed to fetch forensic dossier for ${workId}`);
  return res.json();
}

export async function fetchDuplicateCandidates() {
  const res = await fetch(`${API_BASE_URL}/anomalies/duplicates`);
  if (!res.ok) throw new Error("Failed to fetch duplicate candidates");
  return res.json();
}

export async function recalculateRiskWeights(weights) {
  const res = await fetch(`${API_BASE_URL}/simulate/recalculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  });
  if (!res.ok) throw new Error("Failed to recalculate risk scores");
  return res.json();
}

export async function fetchMps(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/mps?${query}`);
  if (!res.ok) throw new Error("Failed to fetch MP allocations");
  return res.json();
}

export async function fetchMpDetails(mpName) {
  const res = await fetch(`${API_BASE_URL}/mps/${encodeURIComponent(mpName)}`);
  if (!res.ok) throw new Error(`Failed to fetch details for MP ${mpName}`);
  return res.json();
}

export async function fetchStates() {
  const res = await fetch(`${API_BASE_URL}/states`);
  if (!res.ok) throw new Error("Failed to fetch state summaries");
  return res.json();
}

