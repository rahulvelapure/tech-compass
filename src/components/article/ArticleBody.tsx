import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";

import type { Block } from "@/content/types";

/**
 * Inline markup inside body text: `[label](/path)`, `**bold**` and `*italic*`.
 *
 * Article text stays a plain string in the content model — nothing about the
 * schema changes — but prose can now carry the internal links that make an
 * article part of the site rather than an island, and the external citations
 * that back a claim up.
 *
 * Deliberately four constructs and no more. This is not a Markdown renderer;
 * anything structural is already its own block type. Emphasis and inline code
 * are supported because without them a stray `*word*` or a registry path in
 * backticks renders its delimiters literally — the kind of defect that reaches
 * production looking like a typo.
 *
 * Order matters: `**bold**` must be attempted before `*italic*`, or the
 * italic branch would consume the first pair of asterisks in a bold run.
 */
const INLINE_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`/g;

export function RichText({ text }: { text: string }) {
  // Fast path: most sentences contain no markup at all.
  if (!/[[*`]/.test(text)) return <>{text}</>;

  const nodes: ReactNode[] = [];
  const pattern = new RegExp(INLINE_PATTERN.source, "g");
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    const [, linkLabel, href, bold, italic, code] = match;
    if (linkLabel && href) {
      nodes.push(
        href.startsWith("/") ? (
          // Internal: client-side navigation, no full page load.
          <Link key={match.index} to={href}>
            {linkLabel}
          </Link>
        ) : (
          <a key={match.index} href={href} target="_blank" rel="noopener noreferrer">
            {linkLabel}
          </a>
        ),
      );
    } else if (bold) {
      nodes.push(<strong key={match.index}>{bold}</strong>);
    } else if (italic) {
      nodes.push(<em key={match.index}>{italic}</em>);
    } else if (code) {
      // Styled by the `:not(pre) > code` rule in the prose stylesheet.
      nodes.push(<code key={match.index}>{code}</code>);
    }
    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));

  return (
    <>
      {nodes.map((node, index) => (
        <Fragment key={index}>{node}</Fragment>
      ))}
    </>
  );
}

function CodeBlock({ language, filename, code, command }: Extract<Block, { type: "code" }>) {
  return (
    <figure className="my-8 overflow-hidden rounded-md border border-border">
      <figcaption className="flex items-center justify-between gap-4 border-b border-border bg-surface-strong px-4 py-2">
        <span className="eyebrow text-muted-foreground">{command ? "Command" : language}</span>
        {filename && (
          <span className="truncate font-mono text-[11px] text-muted-foreground">{filename}</span>
        )}
      </figcaption>
      {/*
        Long lines scroll horizontally, and a region that scrolls must be
        reachable by keyboard or its overflow is unreadable without a mouse
        (WCAG 2.1.1). tabIndex makes it focusable; the label says what has
        been focused rather than announcing an anonymous scroll area.
      */}
      <pre
        tabIndex={0}
        role="region"
        aria-label={filename ?? `${command ? "Command" : language} code sample`}
        className="overflow-x-auto bg-code-bg px-4 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      >
        <code className="font-mono text-[13px] leading-relaxed text-code-fg">{code}</code>
      </pre>
    </figure>
  );
}

function Callout({ variant, title, text }: Extract<Block, { type: "callout" }>) {
  const config = {
    note: {
      Icon: Info,
      wrap: "bg-note border-l-2 border-accent",
      head: "text-note-foreground",
    },
    tip: {
      Icon: Lightbulb,
      wrap: "bg-note border-l-2 border-accent",
      head: "text-note-foreground",
    },
    warning: {
      Icon: AlertTriangle,
      wrap: "bg-warn border-l-2 border-warn-foreground/40",
      head: "text-warn-foreground",
    },
  }[variant];

  const { Icon } = config;

  return (
    <div role="note" className={`my-8 px-5 py-4 ${config.wrap}`}>
      <p className={`eyebrow flex items-center gap-2 ${config.head}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </p>
      <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
        <RichText text={text} />
      </p>
    </div>
  );
}

function DataTable({ caption, head, rows }: Extract<Block, { type: "table" }>) {
  return (
    <figure className="my-8">
      {/* Scrolls sideways on narrow screens, so it must be keyboard-focusable. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={caption ?? "Table"}
        className="overflow-x-auto border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      >
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-strong">
              {head.map((cell) => (
                <th key={cell} scope="col" className="eyebrow px-4 py-3 text-muted-foreground">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 align-top ${j === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

function Diagram({ title, ascii, caption }: Extract<Block, { type: "diagram" }>) {
  return (
    <figure className="my-8 border border-border bg-surface">
      <figcaption className="eyebrow border-b border-border px-4 py-2 text-muted-foreground">
        {title}
      </figcaption>
      <pre
        tabIndex={0}
        role="region"
        aria-label={title}
        className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed text-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
      >
        {ascii}
      </pre>
      {caption && (
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{caption}</p>
      )}
    </figure>
  );
}

export function ArticleBody({ body }: { body: Block[] }) {
  return (
    <div className="article-prose">
      {body.map((block, index) => {
        switch (block.type) {
          case "p":
            return (
              <p key={index}>
                <RichText text={block.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={index} id={block.id}>
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={index} id={block.id}>
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={index}>
                {block.items.map((item, i) => (
                  <li key={i}>
                    <RichText text={item} />
                  </li>
                ))}
              </ol>
            );
          case "code":
            return <CodeBlock key={index} {...block} />;
          case "table":
            return <DataTable key={index} {...block} />;
          case "callout":
            return <Callout key={index} {...block} />;
          case "diagram":
            return <Diagram key={index} {...block} />;
          case "quote":
            return (
              <blockquote
                key={index}
                className="my-8 border-l-2 border-accent pl-5 font-serif text-lg leading-relaxed"
              >
                {block.text}
                {block.attribution && (
                  <footer className="mt-2 font-sans text-sm text-muted-foreground">
                    — {block.attribution}
                  </footer>
                )}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
