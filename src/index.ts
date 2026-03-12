#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readdown } from "readdown";

const server = new McpServer({
  name: "readdown",
  version: "0.1.0",
});

server.tool(
  "fetch_markdown",
  "Fetch a web page and convert it to clean, LLM-optimized Markdown. " +
    "Returns the article content with metadata (title, author, date) and token count. " +
    "Much faster and lighter than browser-based solutions.",
  {
    url: z.string().url().describe("The URL of the web page to fetch and convert"),
    include_header: z
      .boolean()
      .optional()
      .default(true)
      .describe("Include title/source/author header in output"),
    raw: z
      .boolean()
      .optional()
      .default(false)
      .describe("Extract full page content instead of just the main article"),
  },
  async ({ url, include_header, raw }) => {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; readdown/0.1; +https://github.com/zcag/readdown)",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to fetch ${url}: HTTP ${response.status} ${response.statusText}`,
            },
          ],
          isError: true,
        };
      }

      const html = await response.text();
      const result = readdown(html, {
        url,
        includeHeader: include_header,
        raw,
      });

      const summary = [
        `Tokens: ~${result.tokens}`,
        `Characters: ${result.chars}`,
        result.metadata.title ? `Title: ${result.metadata.title}` : null,
        result.metadata.author ? `Author: ${result.metadata.author}` : null,
        result.metadata.date ? `Date: ${result.metadata.date}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        content: [
          { type: "text" as const, text: `[${summary}]\n\n${result.markdown}` },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching ${url}: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "convert_html",
  "Convert an HTML string to clean, LLM-optimized Markdown. " +
    "Use this when you already have HTML content and need it as Markdown.",
  {
    html: z.string().describe("The HTML content to convert"),
    url: z
      .string()
      .url()
      .optional()
      .describe("Base URL for resolving relative links and images"),
    include_header: z
      .boolean()
      .optional()
      .default(true)
      .describe("Include title/source/author header in output"),
    raw: z
      .boolean()
      .optional()
      .default(false)
      .describe("Use full HTML content instead of extracting main article"),
  },
  async ({ html, url, include_header, raw }) => {
    const result = readdown(html, {
      url,
      includeHeader: include_header,
      raw,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: result.markdown,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
