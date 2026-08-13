import { site } from "./site";
import {
  articlePath,
  articleWordCount,
  articlesByAuthor,
  getAuthor,
  getCategory,
  reviewStatusLabel,
} from "./content";
import type { Article, Author } from "@/content/types";

type Meta = Record<string, string>[];

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
  /** Absolute URL or site-root-relative path. Falls back to the site image. */
  image?: string;
  imageAlt?: string;
}

/** Absolute URL for canonical/og:url. The production domain is known. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMeta({
  title,
  description,
  path,
  type = "website",
  image,
  imageAlt,
}: PageMetaInput): Meta {
  const url = absoluteUrl(path);
  // Social cards are declared `summary_large_image`, so there must always be
  // an image — a large-image card with no image renders as a bare link.
  const imageUrl = absoluteUrl(image ?? site.ogImage);

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: site.name },
    { property: "og:image", content: imageUrl },
    { property: "og:image:alt", content: imageAlt ?? `${site.name} — ${site.tagline}` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    { name: "twitter:image:alt", content: imageAlt ?? `${site.name} — ${site.tagline}` },
  ];
}

export function canonical(path: string) {
  return [{ rel: "canonical", href: absoluteUrl(path) }];
}

/* ---------------- JSON-LD ---------------- */

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function personSchema() {
  return authorSchema(getAuthor("rahul-velapure"));
}

/**
 * Person schema for an author. Carries professional positioning only —
 * deliberately no address, telephone, email or employer.
 */
export function authorSchema(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.role,
    description: author.bio,
    url: absoluteUrl(`/author/${author.id}`),
    knowsAbout: [...new Set(articlesByAuthor(author.id).flatMap((a) => a.tags))].slice(0, 12),
  };
}

/** ItemList for a page that is a list of articles: a category or a tag. */
export function collectionSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: Article[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(articlePath(article)),
        name: article.title,
      })),
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleSchema(article: Article) {
  const author = getAuthor(article.authorId);
  const category = getCategory(article.category);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: "en",
    articleSection: category?.title ?? article.category,
    keywords: [article.primaryKeyword, ...article.secondaryKeywords].join(", "),
    image: absoluteUrl(article.heroImage ?? site.ogImage),
    wordCount: articleWordCount(article),
    timeRequired: `PT${article.readingMinutes}M`,
    author: {
      "@type": "Person",
      name: author.name,
      url: absoluteUrl(`/author/${author.id}`),
    },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(articlePath(article)),
    },
    creativeWorkStatus: reviewStatusLabel[article.reviewStatus],
  };
}

/** Only emitted when the article genuinely carries a Q&A section. */
export function faqSchema(article: Article) {
  if (!article.faq?.length) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

export function ldScript(schema: unknown) {
  return { type: "application/ld+json", children: JSON.stringify(schema) };
}
