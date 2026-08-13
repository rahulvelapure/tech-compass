import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { allArticles, articlePath } from "@/lib/content";
import { site } from "@/lib/site";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: () => {
        const items = allArticles
          .slice(0, 30)
          .map((article) =>
            [
              `    <item>`,
              `      <title>${escapeXml(article.title)}</title>`,
              `      <link>${site.url}${articlePath(article)}</link>`,
              `      <guid isPermaLink="true">${site.url}${articlePath(article)}</guid>`,
              `      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>`,
              `      <description>${escapeXml(article.standfirst)}</description>`,
              `    </item>`,
            ].join("\n"),
          )
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          `  <channel>`,
          `    <title>${escapeXml(site.name)}</title>`,
          `    <link>${site.url}</link>`,
          `    <description>${escapeXml(site.description)}</description>`,
          `    <language>en</language>`,
          `    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />`,
          items,
          `  </channel>`,
          `</rss>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
