import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownRight, MessageSquare, ThumbsUp, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { CommentItem, CommentThread } from "@/lib/comments.db";
import {
  deleteArticleComment,
  getArticleComments,
  postArticleComment,
  upvoteArticleComment,
  type CommentSnapshot,
  type PostCommentResult,
} from "@/lib/comments.functions";
import { COMMENT_HONEYPOT_FIELD } from "@/lib/comments.spam";
import { cn } from "@/lib/utils";

type SortMode = "newest" | "helpful";

const MOD_STORAGE_KEY = "substrate_mod_key";

export function ArticleComments({ slug }: { slug: string }) {
  const fetchComments = useServerFn(getArticleComments);
  const submitComment = useServerFn(postArticleComment);
  const toggleUpvote = useServerFn(upvoteArticleComment);
  const removeComment = useServerFn(deleteArticleComment);
  const queryClient = useQueryClient();

  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [body, setBody] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [formError, setFormError] = useState("");

  const [replyTarget, setReplyTarget] = useState<{
    parentId: string;
    replyToName: string;
  } | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replyStatus, setReplyStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [replyError, setReplyError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [moderatorKey, setModeratorKey] = useState<string | undefined>(undefined);

  const mainHoneypotRef = useRef<HTMLInputElement>(null);
  const replyHoneypotRef = useRef<HTMLInputElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const upvotePendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MOD_STORAGE_KEY);
      if (stored && stored.trim().length > 0) {
        setModeratorKey(stored.trim());
      }
    } catch {
      // Ignore storage access restrictions in private contexts.
    }
  }, []);

  const queryKey = ["article-comments", slug] as const;

  const { data: snapshot } = useQuery<CommentSnapshot>({
    queryKey,
    queryFn: async (): Promise<CommentSnapshot> => {
      try {
        return (await fetchComments({ data: { slug } })) as CommentSnapshot;
      } catch {
        return { available: false };
      }
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const sortedThreads = useMemo(() => {
    if (!snapshot?.available) return [];
    if (sortMode === "newest") return snapshot.threads;
    return [...snapshot.threads].sort(
      (a, b) => b.upvotes - a.upvotes || b.createdAt.localeCompare(a.createdAt),
    );
  }, [snapshot, sortMode]);

  async function handleMainSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!snapshot?.available || formStatus === "submitting") return;

    setFormStatus("submitting");
    setFormError("");

    try {
      const result = (await submitComment({
        data: {
          slug,
          parentId: null,
          authorName,
          authorRole,
          body,
          formToken: snapshot.formToken,
          [COMMENT_HONEYPOT_FIELD]: mainHoneypotRef.current?.value ?? "",
        },
      })) as PostCommentResult;

      if (result.ok) {
        const nextSnapshot: CommentSnapshot = result.snapshot;
        queryClient.setQueryData<CommentSnapshot>(queryKey, nextSnapshot);
        setBody("");
        setFormStatus("idle");
      } else {
        if (result.formToken) {
          const refreshed: CommentSnapshot = {
            ...snapshot,
            formToken: result.formToken,
          };
          queryClient.setQueryData<CommentSnapshot>(queryKey, refreshed);
        }
        setFormError(result.message);
        setFormStatus("error");
      }
    } catch {
      setFormError("Could not publish your comment. Check your connection and try again.");
      setFormStatus("error");
    }
  }

  function openReply(parentId: string, replyToName: string, isChildReply: boolean) {
    setReplyTarget({ parentId, replyToName });
    setReplyError("");
    setReplyStatus("idle");
    setReplyBody(isChildReply ? `@${replyToName} ` : "");
    requestAnimationFrame(() => {
      replyTextareaRef.current?.focus();
    });
  }

  async function handleReplySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!snapshot?.available || !replyTarget || replyStatus === "submitting") return;

    setReplyStatus("submitting");
    setReplyError("");

    try {
      const result = (await submitComment({
        data: {
          slug,
          parentId: replyTarget.parentId,
          authorName,
          authorRole,
          body: replyBody,
          formToken: snapshot.formToken,
          [COMMENT_HONEYPOT_FIELD]: replyHoneypotRef.current?.value ?? "",
        },
      })) as PostCommentResult;

      if (result.ok) {
        const nextSnapshot: CommentSnapshot = result.snapshot;
        queryClient.setQueryData<CommentSnapshot>(queryKey, nextSnapshot);
        setReplyBody("");
        setReplyTarget(null);
        setReplyStatus("idle");
      } else {
        if (result.formToken) {
          const refreshed: CommentSnapshot = {
            ...snapshot,
            formToken: result.formToken,
          };
          queryClient.setQueryData<CommentSnapshot>(queryKey, refreshed);
        }
        setReplyError(result.message);
        setReplyStatus("error");
      }
    } catch {
      setReplyError("Could not publish your reply. Please try again.");
      setReplyStatus("error");
    }
  }

  async function handleUpvote(comment: CommentItem) {
    if (!snapshot?.available || upvotePendingRef.current.has(comment.id)) return;
    upvotePendingRef.current.add(comment.id);

    const previous: CommentSnapshot = snapshot;
    const nextUpvote = !comment.upvotedByMe;
    const delta = nextUpvote ? 1 : -1;

    const updateItem = (item: CommentItem): CommentItem =>
      item.id === comment.id
        ? {
            ...item,
            upvotes: Math.max(0, item.upvotes + delta),
            upvotedByMe: nextUpvote,
          }
        : item;

    const optimistic: CommentSnapshot = {
      ...snapshot,
      threads: snapshot.threads.map((thread) => ({
        ...updateItem(thread),
        replies: thread.replies.map(updateItem),
      })),
    };
    queryClient.setQueryData<CommentSnapshot>(queryKey, optimistic);

    try {
      const confirmed = (await toggleUpvote({
        data: { slug, commentId: comment.id, upvote: nextUpvote },
      })) as CommentSnapshot;
      if (confirmed.available) {
        queryClient.setQueryData<CommentSnapshot>(queryKey, confirmed);
      }
    } catch {
      queryClient.setQueryData<CommentSnapshot>(queryKey, previous);
    } finally {
      upvotePendingRef.current.delete(comment.id);
    }
  }

  async function handleDelete(commentId: string) {
    if (!snapshot?.available) return;
    setConfirmDeleteId(null);

    try {
      const confirmed = (await removeComment({
        data: {
          slug,
          commentId,
          ...(moderatorKey ? { moderatorKey } : {}),
        },
      })) as CommentSnapshot;
      if (confirmed.available) {
        queryClient.setQueryData<CommentSnapshot>(queryKey, confirmed);
      }
    } catch {
      // Leave current state intact on transient network failure.
    }
  }

  if (!snapshot) {
    return (
      <section
        id="comments"
        aria-label="Reader comments"
        className="mt-12 border-t border-hairline pt-10"
      >
        <p className="kicker">Discussion</p>
        <h2 className="display-2 mt-1.5">Reader comments</h2>
        <div
          className="mt-6 h-48 rounded-lg border border-hairline bg-surface-2/25"
          aria-hidden="true"
        />
      </section>
    );
  }

  if (!snapshot.available) return null;

  return (
    <section
      id="comments"
      aria-labelledby="comments-heading"
      className="mt-12 border-t border-hairline pt-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Discussion</p>
          <h2 id="comments-heading" className="display-2 mt-1.5 flex items-baseline gap-2.5">
            <span>Reader comments</span>
            {snapshot.totalCount > 0 && (
              <span className="text-[1rem] font-medium tabular-nums text-muted-foreground">
                ({snapshot.totalCount})
              </span>
            )}
          </h2>
        </div>

        {snapshot.threads.length >= 2 && (
          <div
            role="group"
            aria-label="Sort comments"
            className="inline-flex items-center rounded-md border border-hairline bg-surface-2/45 p-0.5"
          >
            <button
              type="button"
              onClick={() => setSortMode("newest")}
              aria-pressed={sortMode === "newest"}
              className={cn(
                "min-h-8 cursor-pointer rounded px-2.5 py-1 text-[0.75rem] font-semibold transition-colors",
                sortMode === "newest"
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortMode("helpful")}
              aria-pressed={sortMode === "helpful"}
              className={cn(
                "min-h-8 cursor-pointer rounded px-2.5 py-1 text-[0.75rem] font-semibold transition-colors",
                sortMode === "helpful"
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Most helpful
            </button>
          </div>
        )}
      </div>

      {/* Main comment composer */}
      <form
        onSubmit={handleMainSubmit}
        className="relative mt-6 rounded-lg border border-hairline bg-surface-2/35 p-5 sm:p-6"
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <label
              htmlFor={`comment-name-${slug}`}
              className="block text-[0.75rem] font-semibold tracking-wide text-ink-soft"
            >
              Display name
            </label>
            <input
              id={`comment-name-${slug}`}
              type="text"
              name="authorName"
              required
              minLength={2}
              maxLength={48}
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="Alex Rivera"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-surface px-3 text-[0.875rem] text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor={`comment-role-${slug}`}
              className="block text-[0.75rem] font-semibold tracking-wide text-ink-soft"
            >
              Role or context <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id={`comment-role-${slug}`}
              type="text"
              name="authorRole"
              maxLength={48}
              value={authorRole}
              onChange={(event) => setAuthorRole(event.target.value)}
              placeholder="e.g. Systems Engineer"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-surface px-3 text-[0.875rem] text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <label
              htmlFor={`comment-body-${slug}`}
              className="block text-[0.75rem] font-semibold tracking-wide text-ink-soft"
            >
              Comment
            </label>
            {body.length > 1_500 && (
              <span className="text-[0.75rem] tabular-nums text-muted-foreground">
                {body.length} / 2,000
              </span>
            )}
          </div>
          <textarea
            id={`comment-body-${slug}`}
            name="body"
            required
            minLength={4}
            maxLength={2000}
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Share production notes, edge cases, benchmarks, or corrections…"
            className="mt-1.5 block w-full resize-y rounded-md border border-input bg-surface px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
          />
        </div>

        {/* Honeypot field: hidden from sight, keyboard, and assistive tech */}
        <div
          aria-hidden="true"
          className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
        >
          <label htmlFor={`comment-${COMMENT_HONEYPOT_FIELD}-${slug}`}>
            Website (leave this field empty)
          </label>
          <input
            ref={mainHoneypotRef}
            id={`comment-${COMMENT_HONEYPOT_FIELD}-${slug}`}
            type="text"
            name={COMMENT_HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {formStatus === "error" && formError && (
          <p role="status" aria-live="polite" className="mt-3 text-[0.8125rem] text-destructive">
            {formError}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
            No account required. Plain text, up to 2 links. Covered by our{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
              privacy policy
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={formStatus === "submitting"}
            className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-md bg-foreground px-4 py-2 text-[0.8125rem] font-semibold text-background transition-colors hover:bg-brand hover:text-brand-foreground disabled:opacity-60"
          >
            {formStatus === "submitting" ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      {/* Thread list */}
      {sortedThreads.length === 0 ? (
        <p className="mt-7 text-[0.90625rem] text-muted-foreground">
          No comments yet. Be the first to share field notes or observations on this article.
        </p>
      ) : (
        <ol className="mt-8 divide-y divide-hairline">
          {sortedThreads.map((thread) => (
            <li key={thread.id} className="py-6 first:pt-0 last:pb-0">
              <CommentCard
                comment={thread}
                canModerate={Boolean(moderatorKey)}
                confirmDeleteId={confirmDeleteId}
                onConfirmDelete={setConfirmDeleteId}
                onDelete={handleDelete}
                onUpvote={handleUpvote}
                onReply={() => openReply(thread.id, thread.authorName, false)}
              />

              {thread.replies.length > 0 && (
                <ol className="mt-4 space-y-4 border-l-2 border-hairline pl-4 sm:pl-5">
                  {thread.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentCard
                        comment={reply}
                        isReply
                        canModerate={Boolean(moderatorKey)}
                        confirmDeleteId={confirmDeleteId}
                        onConfirmDelete={setConfirmDeleteId}
                        onDelete={handleDelete}
                        onUpvote={handleUpvote}
                        onReply={() => openReply(thread.id, reply.authorName, true)}
                      />
                    </li>
                  ))}
                </ol>
              )}

              {replyTarget?.parentId === thread.id && (
                <form
                  onSubmit={handleReplySubmit}
                  className="relative mt-4 rounded-md border border-hairline bg-surface-2/35 p-4 sm:ml-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink-soft">
                      <CornerDownRight
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span>Replying to {replyTarget.replyToName}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="inline-flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded px-2 text-[0.75rem] font-medium text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`reply-name-${thread.id}`}
                        className="block text-[0.75rem] font-semibold text-ink-soft"
                      >
                        Display name
                      </label>
                      <input
                        id={`reply-name-${thread.id}`}
                        type="text"
                        required
                        minLength={2}
                        maxLength={48}
                        value={authorName}
                        onChange={(event) => setAuthorName(event.target.value)}
                        placeholder="Alex Rivera"
                        className="mt-1 h-9 w-full rounded-md border border-input bg-surface px-3 text-[0.8125rem] text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`reply-role-${thread.id}`}
                        className="block text-[0.75rem] font-semibold text-ink-soft"
                      >
                        Role <span className="font-normal text-muted-foreground">(optional)</span>
                      </label>
                      <input
                        id={`reply-role-${thread.id}`}
                        type="text"
                        maxLength={48}
                        value={authorRole}
                        onChange={(event) => setAuthorRole(event.target.value)}
                        placeholder="e.g. Network Admin"
                        className="mt-1 h-9 w-full rounded-md border border-input bg-surface px-3 text-[0.8125rem] text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label htmlFor={`reply-body-${thread.id}`} className="sr-only">
                      Reply to {replyTarget.replyToName}
                    </label>
                    <textarea
                      ref={replyTextareaRef}
                      id={`reply-body-${thread.id}`}
                      required
                      minLength={4}
                      maxLength={2000}
                      rows={3}
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      placeholder="Write a concise reply…"
                      className="block w-full resize-y rounded-md border border-input bg-surface px-3 py-2 text-[0.875rem] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:border-brand focus:outline-none"
                    />
                  </div>

                  <div
                    aria-hidden="true"
                    className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
                  >
                    <label htmlFor={`reply-${COMMENT_HONEYPOT_FIELD}-${thread.id}`}>
                      Website (leave this field empty)
                    </label>
                    <input
                      ref={replyHoneypotRef}
                      id={`reply-${COMMENT_HONEYPOT_FIELD}-${thread.id}`}
                      type="text"
                      name={COMMENT_HONEYPOT_FIELD}
                      tabIndex={-1}
                      autoComplete="off"
                      defaultValue=""
                    />
                  </div>

                  {replyStatus === "error" && replyError && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="mt-2.5 text-[0.8125rem] text-destructive"
                    >
                      {replyError}
                    </p>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={replyStatus === "submitting"}
                      className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md bg-foreground px-3.5 py-1.5 text-[0.8125rem] font-semibold text-background transition-colors hover:bg-brand hover:text-brand-foreground disabled:opacity-60"
                    >
                      {replyStatus === "submitting" ? "Posting…" : "Post reply"}
                    </button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function CommentCard({
  comment,
  isReply = false,
  canModerate,
  confirmDeleteId,
  onConfirmDelete,
  onDelete,
  onUpvote,
  onReply,
}: {
  comment: CommentThread | CommentItem;
  isReply?: boolean;
  canModerate: boolean;
  confirmDeleteId: string | null;
  onConfirmDelete: (id: string | null) => void;
  onDelete: (id: string) => Promise<void>;
  onUpvote: (comment: CommentItem) => Promise<void>;
  onReply: () => void;
}) {
  const showDelete = comment.canDelete || canModerate;
  const isConfirming = confirmDeleteId === comment.id;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-2 font-semibold text-ink-soft",
            isReply ? "size-6 text-[0.6875rem]" : "size-7 text-[0.75rem]",
          )}
        >
          {initials(comment.authorName)}
        </span>

        <span className="text-[0.875rem] font-semibold text-foreground [overflow-wrap:anywhere]">
          {comment.authorName}
        </span>

        {comment.authorRole && (
          <span className="text-[0.8125rem] text-muted-foreground [overflow-wrap:anywhere]">
            &middot; {comment.authorRole}
          </span>
        )}

        {comment.canDelete && (
          <span className="rounded border border-hairline bg-surface-2/70 px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-soft">
            You
          </span>
        )}

        <time
          dateTime={comment.createdAt}
          className="text-[0.75rem] tabular-nums text-muted-foreground"
        >
          &middot; {formatCommentTimestamp(comment.createdAt)}
        </time>
      </div>

      <p
        className={cn(
          "mt-2 whitespace-pre-line text-[0.9375rem] leading-[1.68] text-ink-soft [overflow-wrap:anywhere]",
          isReply ? "sm:pl-8" : "sm:pl-9",
        )}
      >
        {comment.body}
      </p>

      <div
        className={cn("mt-2 flex flex-wrap items-center gap-1.5", isReply ? "sm:pl-8" : "sm:pl-9")}
      >
        <button
          type="button"
          onClick={() => void onUpvote(comment)}
          aria-pressed={comment.upvotedByMe}
          aria-label={
            comment.upvotedByMe
              ? `Remove helpful vote (${comment.upvotes})`
              : `Mark comment by ${comment.authorName} as helpful (${comment.upvotes})`
          }
          className={cn(
            "inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-[0.75rem] font-medium transition-colors",
            comment.upvotedByMe
              ? "text-brand"
              : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
          )}
        >
          <ThumbsUp
            className="size-3.5 shrink-0"
            aria-hidden="true"
            {...(comment.upvotedByMe ? { fill: "currentColor" } : {})}
          />
          <span className="tabular-nums">
            {comment.upvotes > 0 ? `Helpful (${comment.upvotes})` : "Helpful"}
          </span>
        </button>

        <button
          type="button"
          onClick={onReply}
          className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
        >
          <MessageSquare className="size-3.5 shrink-0" aria-hidden="true" />
          <span>Reply</span>
        </button>

        {showDelete && !isConfirming && (
          <button
            type="button"
            onClick={() => onConfirmDelete(comment.id)}
            className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded px-2 py-1 text-[0.75rem] font-medium text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-destructive"
          >
            <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{comment.canDelete ? "Delete" : "Hide"}</span>
          </button>
        )}

        {showDelete && isConfirming && (
          <span className="inline-flex items-center gap-1.5 text-[0.75rem]">
            <button
              type="button"
              onClick={() => void onDelete(comment.id)}
              className="inline-flex min-h-8 cursor-pointer items-center rounded bg-destructive/10 px-2.5 py-1 font-semibold text-destructive hover:bg-destructive/20"
            >
              Confirm {comment.canDelete ? "delete" : "hide"}
            </button>
            <button
              type="button"
              onClick={() => onConfirmDelete(null)}
              className="inline-flex min-h-8 cursor-pointer items-center rounded px-2 py-1 font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase();
}

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatCommentTimestamp(iso: string): string {
  const parsed = Date.parse(iso);
  if (!Number.isFinite(parsed)) return iso;
  const diffSeconds = Math.floor((Date.now() - parsed) / 1_000);
  if (diffSeconds < 60) return "just now";
  if (diffSeconds < 3_600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86_400) return `${Math.floor(diffSeconds / 3_600)}h ago`;
  if (diffSeconds < 7 * 86_400) return `${Math.floor(diffSeconds / 86_400)}d ago`;
  return shortDateFormatter.format(new Date(parsed));
}
