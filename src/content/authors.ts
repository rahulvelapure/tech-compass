import type { Author } from "./types";

/**
 * Public author profiles.
 *
 * Deliberately minimal. These fields are the *only* biographical information
 * the site publishes — no employer, no exact job title, no location, no
 * contact details. The role line is a description of what the person writes
 * about, not a position at a company, and it must stay that way: a job title
 * here would put employer-identifying information into the byline of every
 * article, the author page and the Person schema at once.
 */
export const authors: Author[] = [
  {
    id: "rahul-velapure",
    name: "Rahul Velapure",
    initials: "RV",
    role: "Technology writer",
    bio: "Technology professional writing about IT infrastructure, cybersecurity, cloud, AI, automation, software, hardware and emerging technology.",
  },
];

export const defaultAuthorId = "rahul-velapure";

export function getAuthor(id: string): Author {
  return authors.find((a) => a.id === id) ?? authors[0]!;
}
