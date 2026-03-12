# readdown-mcp

MCP server for converting web pages to clean, LLM-optimized Markdown.

Lightweight — uses HTTP fetch, no browser needed. Powered by [readdown](https://github.com/zcag/readdown).

## Tools

### `fetch_markdown`
Fetch a URL and convert it to clean Markdown with metadata and token count.

### `convert_html`
Convert an HTML string to Markdown. Use when you already have the HTML.

## Install

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "readdown": {
      "command": "npx",
      "args": ["-y", "github:zcag/readdown-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "readdown": {
      "command": "npx",
      "args": ["-y", "github:zcag/readdown-mcp"]
    }
  }
}
```

## Why readdown?

Most web-fetching MCP servers use `@mozilla/readability` + `turndown` (two packages, 65KB).
readdown replaces both in a single 5KB package with better LLM optimization:

- Token-efficient output (fewer tokens = cheaper API calls)
- Built-in token estimation
- Metadata extraction (title, author, date)
- Works server-side with linkedom (no browser DOM needed)

## License

MIT
