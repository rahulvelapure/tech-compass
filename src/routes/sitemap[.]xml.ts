import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import {
  allArticles,
  articlePath,
  articlesByCategory,
  authors,
  categories,
  indexableTags,
} from "@/lib/content";
import { site } from "@/lib/site";

const STATIC_PATHS = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/about", changefreq: "yearly", priority: "0.5" },
  { path: "/newsletter", changefreq: "yearly", priority: "0.4" },
  { path: "/resources", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
  { path: "/disclaimer", changefreq: "yearly", priority: "0.2" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls: string[] = [];

        for (const entry of STATIC_PATHS) {
          urls.push(
            `  <url>\n    <loc>${site.url}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
          );
        }

        // Only sections that actually have something published. An empty
        // category page is noindex, so listing it here would contradict the
        // page's own directive.
        for (const category of categories) {
          if (articlesByCategory(category.slug).length === 0) continue;
          urls.push(
            `  <url>\n    <loc>${site.url}/${category.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
          );
        }

        for (const author of authors) {
          urls.push(
            `  <url>\n    <loc>${site.url}/author/${author.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.4</priority>\n  </url>`,
          );
        }

        // Only tags that cleared the indexing threshold. Listing thin tag
        // pages here would ask Google to spend crawl budget on duplicates.
        for (const tag of indexableTags()) {
          urls.push(
            `  <url>\n    <loc>${site.url}/tag/${tag.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>`,
          );
        }

        for (const article of allArticles) {
          urls.push(
            `  <url>\n    <loc>${site.url}${articlePath(article)}</loc>\n    <lastmod>${article.updatedAt ?? article.publishedAt}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
          );
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
