/**
 * AETHON Tool: Google Search via Serper.dev
 * Real API call — no mocks.
 */

export interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerperResponse {
  query: string;
  results: SerperResult[];
  answerBox?: string;
  knowledgeGraph?: Record<string, unknown>;
}

export async function googleSearch(query: string, numResults = 5): Promise<SerperResponse> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured.");
  }

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: numResults }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Serper API error ${response.status}: ${text}`);
  }

  const data = await response.json();

  const results: SerperResult[] = (data.organic ?? []).map(
    (item: { title: string; link: string; snippet: string; position: number }, idx: number) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      snippet: item.snippet ?? "",
      position: item.position ?? idx + 1,
    })
  );

  return {
    query,
    results,
    answerBox: data.answerBox?.answer ?? data.answerBox?.snippet,
    knowledgeGraph: data.knowledgeGraph,
  };
}
