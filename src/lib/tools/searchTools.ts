import { TavilyExtract, TavilySearch } from "@langchain/tavily";

export const tavilySearchTool = new TavilySearch({
  maxResults: 3,
  topic: "general",
  tavilyApiKey: process.env.TAVILY_API_KEY || "",
  includeRawContent: true,
});

export const tavilyExtractTool = new TavilyExtract({
  tavilyApiKey: process.env.TAVILY_API_KEY || "",
});
