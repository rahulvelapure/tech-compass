# Tech Compass LinkedIn Publisher

The publisher posts at most one published article every two days, with a randomized posting time in India Standard Time (IST).

## How it works

1. GitHub Actions checks every 30 minutes.
2. The publisher keeps its state in the open GitHub issue named `Automation State — LinkedIn Publisher`.
3. It selects the oldest eligible published article that has not been posted.
4. It verifies that the article URL is live before posting.
5. It publishes one LinkedIn article post.
6. It records the LinkedIn post ID and timestamp.
7. It schedules the next post two calendar days later at a new random time.

The two-day gap is enforced by state, so the workflow frequency does not create duplicate posts.

## Required GitHub secrets

- `LINKEDIN_AUTHOR_URN` — `urn:li:person:...` for a personal profile or `urn:li:organization:...` for a company page.
- `LINKEDIN_ACCESS_TOKEN` — preferred for the first setup, or use the refresh-token flow below.
- `LINKEDIN_REFRESH_TOKEN` — optional if using refresh-token authentication.
- `LINKEDIN_CLIENT_ID` — required with refresh-token authentication.
- `LINKEDIN_CLIENT_SECRET` — required with refresh-token authentication.

## Optional GitHub variables

- `PUBLIC_SITE_URL` — absolute Tech Compass origin without a trailing slash.
- `LINKEDIN_VERSION` — LinkedIn REST API version used by the application.
- `LINKEDIN_START_DATE` — earliest publication date eligible for the queue. Default: `2026-08-24`.

## Important

Do not put LinkedIn tokens in repository files or `VITE_*` variables. They are server-side secrets and must remain in GitHub Actions secrets.

The publisher does not deploy the website. It only posts an article that is already live. A publication can therefore enter the queue only after its deployed URL is reachable.

## Manual run

The workflow has a `workflow_dispatch` trigger. A manual run still obeys the same two-day guard and one-post-per-day protection.

## First activation

After adding the LinkedIn OAuth credentials and GitHub secrets, run the workflow manually once. The first run creates the state issue and schedules the first randomized slot; it does not immediately post. This gives the operator a chance to inspect the queue and timing before the first automated post.
