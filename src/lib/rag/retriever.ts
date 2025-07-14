import { vectorStore } from "./vectorStore";

export const retriever = vectorStore.asRetriever({
  k: 5, // Number of documents to retrieve
  searchType: "similarity",
});

export const getRetriever = (filters?: Record<string, string>) => {
  const allowedFilters = ["name", "Price Link_Toped", "Overall Sound"];
  const sanitizedFilters = Object.fromEntries(
    Object.entries(filters || {}).filter(([key]) =>
      allowedFilters.includes(key)
    )
  );
  return vectorStore.asRetriever({
    k: 5,
    searchType: "similarity",
    filter: sanitizedFilters || undefined,
  });
};
