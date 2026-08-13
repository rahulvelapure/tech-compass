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
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { themeInitScript } from "@/components/site/ThemeToggle";
import { site } from "@/lib/site";
import { defaultAuthorId, getAuthor } from "@/content/authors";
import { ldScript, personSchema, websiteSchema } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-28 sm:px-6">
      <p className="eyebrow text-accent">404</p>
      <h1 className="headline mt-3 text-3xl">This page does not exist</h1>
      <p className="mt-3 text-muted-foreground">
        The address may have changed, or the article may not be published yet.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Go to the homepage
        </Link>
        <Link
          to="/search"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
        >
          Search articles
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-28 sm:px-6">
      <h1 className="headline text-2xl">This page didn't load</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Something went wrong. You can try again or return to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${site.name} — ${site.tagline}` },
      { name: "description", content: site.description },
      // Resolved from the author record so the published name lives in exactly
      // one place; hard-coding it here is how a byline drifts out of step.
      { name: "author", content: getAuthor(defaultAuthorId).name },
      { property: "og:site_name", content: site.name },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "theme-color", content: "#ffffff" },
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
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="flex-1">
          {/* Required: nested routes render here. */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
