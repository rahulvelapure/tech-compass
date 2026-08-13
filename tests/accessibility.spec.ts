import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Accessibility validation with axe-core.
 *
 * One case per page archetype rather than per URL: whatever breaks on one
 * article page breaks on all of them, and a suite that grows with the content
 * store stops being run. Dark mode is audited separately because contrast
 * regressions land there first and are invisible to anyone testing in light.
 */

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** One representative URL per distinct layout. */
const PAGES = [
  { name: "homepage", path: "/" },
  { name: "category hub", path: "/microsoft-intune" },
  { name: "article", path: "/microsoft-intune/enrollment-status-page-troubleshooting" },
  { name: "search", path: "/search?q=intune" },
  { name: "author", path: "/author/rahul-velapure" },
  { name: "tag", path: "/tag/hardware" },
  { name: "newsletter", path: "/newsletter" },
  { name: "newsletter confirmation", path: "/newsletter/confirmed" },
  { name: "about", path: "/about" },
  { name: "privacy", path: "/privacy" },
  { name: "not found", path: "/this-page-does-not-exist" },
];

function audit(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG);
}

/** Turns axe output into a failure message that names the fix, not just the rule. */
function describe(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .slice(0, 5)
        .map((node) => `      ${node.target.join(" ")}`)
        .join("\n");
      return `  [${violation.impact}] ${violation.id}: ${violation.help}\n    ${violation.helpUrl}\n${targets}`;
    })
    .join("\n\n");
}

for (const { name, path } of PAGES) {
  test(`${name} has no accessibility violations`, async ({ page }) => {
    const response = await page.goto(path);
    // A page that failed to load would trivially pass an axe scan.
    expect(response, `${path} did not respond`).not.toBeNull();

    const { violations } = await audit(page).analyze();
    expect(violations, `\n${describe(violations)}\n`).toEqual([]);
  });
}

test("article page has no accessibility violations in dark mode", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.goto("/microsoft-intune/enrollment-status-page-troubleshooting");
  await expect(page.locator("html")).toHaveClass(/dark/);

  const { violations } = await audit(page).analyze();
  expect(violations, `\n${describe(violations)}\n`).toEqual([]);
});

test("the theme choice survives a reload without flashing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /switch to dark theme/i }).click();
  await page.reload();

  // Applied by the pre-paint init script, so it is already set on first paint
  // rather than after hydration.
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("skip link is the first thing a keyboard user reaches", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const focused = page.locator(":focus");
  await expect(focused).toHaveText(/skip to content/i);
  await expect(focused).toBeVisible();
  await expect(focused).toHaveAttribute("href", "#main");
});

test("every page has exactly one h1 and a landmark main", async ({ page }) => {
  for (const { name, path } of PAGES) {
    await page.goto(path);
    await expect(page.locator("main#main"), `${name} is missing <main>`).toHaveCount(1);
    await expect(page.locator("h1"), `${name} does not have exactly one h1`).toHaveCount(1);
  }
});

test("article content renders without client-side JavaScript", async ({ browser }) => {
  // Static generation is the performance strategy; if the prose only appears
  // after hydration then crawlers and slow connections get an empty page.
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/microsoft-intune/enrollment-status-page-troubleshooting");

  await expect(page.locator("h1")).toBeVisible();
  // `.first()` — the related-articles rail also uses <article> elements.
  await expect(page.locator("article").first()).toContainText(/Enrollment Status Page/i);
  await context.close();
});
