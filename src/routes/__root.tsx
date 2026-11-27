import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  ScriptOnce,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { themeInitScript } from "@/components/site/ThemeToggle";
import { site } from "@/lib/site";
import { defaultAuthorId, getAuthor } from "@/content/authors";
import { ldScript, personSchema, websiteSchema } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="wrap py-20 sm:py-28">
      <div className="reading">
        <p className="eyebrow text-link">404</p>
        <h1 className="article-title mt-3">This page does not exist</h1>
        <p className="standfirst mt-4 max-w-[34rem]">
          The address may have changed, or the article may not be published yet.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex h-10 items-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            Return to homepage
          </Link>
          <Link
            to="/search"
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-2"
          >
            Search articles
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="wrap py-20 sm:py-28">
      <div className="reading">
        <p className="eyebrow text-muted-foreground">Error</p>
        <h1 className="article-title mt-3">This page could not load</h1>
        <p className="standfirst mt-4 max-w-[34rem]">
          Something went wrong while loading this page. You can retry or return to the front page.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-10 cursor-pointer items-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-10 items-center rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-2"
          >
            Return to homepage
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.name} — ${site.metaTagline}` },
      { name: "description", content: site.description },
      { name: "author", content: getAuthor(defaultAuthorId).name },
      { property: "og:site_name", content: site.name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "theme-color", content: "#fdfcfa" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32 48x48" },
      { rel: "alternate", type: "application/rss+xml", href: "/rss.xml" },
    ],
    scripts: [ldScript(websiteSchema()), ldScript(personSchema())],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3680769252416096"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ScriptOnce>{themeInitScript}</ScriptOnce>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="min-w-0 flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
