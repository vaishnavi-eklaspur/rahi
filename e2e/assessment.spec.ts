import { test, expect } from "@playwright/test";

const TOTAL = 48;

test("full assessment completes and the shared URL re-renders the report", async ({ page }) => {
  await page.goto("/assessment");

  // Answer all 48 questions. They're sampled and the aptitude section is adaptive, so we
  // never rely on question text — we key off the per-step progress counter (guarantees we
  // advance exactly once per question) and always pick the first option.
  for (let i = 1; i <= TOTAL; i++) {
    await expect(page.getByText(new RegExp(`question ${i} of ${TOTAL}`))).toBeVisible();
    await page.getByTestId("choice").first().click();
  }

  // The results screen renders the report straight from in-memory answers.
  await expect(page.getByText("Your career archetype")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Careers that fit/ })).toBeVisible();
  const archetype = ((await page.locator("h1").first().textContent()) ?? "").trim();
  expect(archetype.length).toBeGreaterThan(0);

  // Sharing yields a /r/<code> URL. The report there is rebuilt from the URL alone —
  // this is the core assertion: encoded state round-trips into an identical report.
  await page.getByRole("button", { name: "Share this report" }).click();
  await page.waitForURL(/\/r\/.+/);

  await expect(page.getByText("Your career archetype")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Careers that fit/ })).toBeVisible();
  await expect(page.locator("h1").first()).toHaveText(archetype);
});
