import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { site } from "@/lib/site";

/**
 * robots.txt.
 *
 * Served as a route rather than a static file so the Sitemap directive follows
 * the configured domain — moving to a custom domain stays a one-variable
 * change. A static file would silently keep advertising the old host.
 *
 * Everything is crawlable except the two paths that are transactional rather
 * than content: search result pages (infinite URL space, thin duplicates of
 * the articles they list) and the newsletter confirmation landing page.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const body = [
          "# https://www.robotstxt.org/robotstxt.html",
          "",
          "User-agent: *",
          "Allow: /",
          "Disallow: /search",
          "Disallow: /newsletter/confirmed",
          "",
          `Sitemap: ${site.url}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
