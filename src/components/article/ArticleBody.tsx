import { Fragment, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import type { Block } from "@/content/types";

/*
 * Inline markup used in article text: [label](url), **bold**, *italic*, `code`.
 * Internal links (starting with "/") use the router; external links open in a new tab.
 */
const INLINE_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`/g;

export function RichText({ text }: { text: string }) {
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

const scrollFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring";

function CodeBlock({ language, filename, code, command }: Extract<Block, { type: "code" }>) {
  return (
    <figure className="reading my-7 overflow-hidden rounded-md border border-hairline bg-code-bg font-sans">
      <figcaption className="flex items-center justify-between gap-4 border-b border-hairline bg-surface-2/80 px-4 py-2">
        <span className="text-[0.75rem] font-medium text-muted-foreground">
          {command ? "Command" : language}
        </span>
        {filename && (
          <span className="truncate font-mono text-[0.75rem] text-muted-foreground">
            {filename}
          </span>
        )}
      </figcaption>
      <pre
        tabIndex={0}
        role="region"
        aria-label={filename ?? `${command ? "Command" : language} code sample`}
        className={`overflow-x-auto px-4 py-4 ${scrollFocus}`}
      >
        <code className="font-mono text-[0.8125rem] leading-[1.65] text-code-fg">{code}</code>
      </pre>
    </figure>
  );
}

function Callout({ variant, title, text }: Extract<Block, { type: "callout" }>) {
  const tone =
    variant === "warning"
      ? { wrap: "border-warn-foreground bg-warn", head: "text-warn-foreground" }
      : { wrap: "border-brand bg-note", head: "text-note-foreground" };

  return (
    <div
      role="note"
      className={`reading my-7 rounded-r-md border-l-2 px-5 py-4 font-sans ${tone.wrap}`}
    >
      <p className={`eyebrow ${tone.head}`}>{title}</p>
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-foreground">
        <RichText text={text} />
      </p>
    </div>
  );
}

function DataTable({ caption, head, rows }: Extract<Block, { type: "table" }>) {
  const isTwoCol = head.length === 2;

  return (
    <figure className="reading my-7 font-sans">
      <div
        tabIndex={0}
        role="region"
        aria-label={caption ?? "Table"}
        className={`overflow-x-auto rounded-md border border-hairline bg-surface ${scrollFocus}`}
      >
        <table
          className={`w-full border-collapse text-left text-[0.875rem] ${
            isTwoCol ? "" : "min-w-[32rem]"
          }`}
        >
          <thead>
            <tr className="border-b border-border bg-surface-2/60">
              {head.map((cell, idx) => (
                <th
                  key={cell}
                  scope="col"
                  className={`px-4 py-2.5 align-bottom text-[0.8125rem] font-semibold text-foreground ${
                    isTwoCol && idx === 0 ? "sm:w-[30%]" : ""
                  }`}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 align-top leading-relaxed ${
                      j === 0 ? "font-medium text-foreground" : "text-ink-soft"
                    }`}
                  >
                    <RichText text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="mt-2 text-[0.8125rem] text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}

function Diagram({ title, ascii, caption }: Extract<Block, { type: "diagram" }>) {
  return (
    <figure className="reading my-7 overflow-hidden rounded-md border border-hairline bg-code-bg font-sans">
      <figcaption className="border-b border-hairline bg-surface-2/80 px-4 py-2 text-[0.75rem] font-medium text-muted-foreground">
        {title}
      </figcaption>
      <pre
        tabIndex={0}
        role="region"
        aria-label={title}
        className={`overflow-x-auto px-4 py-4 font-mono text-[0.75rem] leading-relaxed text-code-fg ${scrollFocus}`}
      >
        {ascii}
      </pre>
      {caption && (
        <p className="border-t border-hairline bg-surface px-4 py-2.5 text-[0.8125rem] text-muted-foreground">
          {caption}
        </p>
      )}
    </figure>
  );
}

function Figure({ title, svg, alt, caption }: Extract<Block, { type: "figure" }>) {
  return (
    <figure className="reading my-7 rounded-md border border-hairline bg-surface p-4 sm:p-6 font-sans">
      <figcaption className="mb-3 text-[0.8125rem] font-semibold text-foreground">
        {title}
      </figcaption>
      <div
        role="img"
        aria-label={alt}
        className="text-foreground [&>svg]:h-auto [&>svg]:w-full [&>svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && (
        <p className="mt-3 border-t border-hairline pt-2.5 text-[0.8125rem] text-muted-foreground">
          {caption}
        </p>
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
          case "figure":
            return <Figure key={index} {...block} />;
          case "quote":
            return (
              <blockquote
                key={index}
                className="my-8 border-l-2 border-brand pl-5 font-display text-[1.25rem] italic leading-relaxed text-foreground"
              >
                {block.text}
                {block.attribution && (
                  <footer className="mt-2 font-sans text-[0.875rem] not-italic text-muted-foreground">
                    &mdash; {block.attribution}
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
