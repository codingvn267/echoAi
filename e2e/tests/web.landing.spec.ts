import { expect, test } from "@playwright/test";

test.describe("marketing landing page", () => {
  test("renders the hero and primary conversion path", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /an ai agent that handles your chat and voice support/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start free/i }).first()
    ).toHaveAttribute("href", "/sign-up");
  });

  test("shows pricing plans with plan CTAs", async ({ page }) => {
    await page.goto("/#pricing");

    await expect(
      page.getByRole("heading", { name: /simple pricing/i })
    ).toBeVisible();
    await expect(page.getByText("Free", { exact: true })).toBeVisible();
    await expect(page.getByText("Pro", { exact: true })).toBeVisible();
    await expect(page.getByText("Scale", { exact: true })).toBeVisible();
    await expect(page.getByText("Most popular")).toBeVisible();

    const planCtas = page.locator("#pricing [data-slot='button']");
    await expect(planCtas).toHaveCount(3);
    const backgrounds = await planCtas.evaluateAll((buttons) =>
      buttons.map((button) => getComputedStyle(button).backgroundImage)
    );
    expect(new Set(backgrounds).size).toBe(1);
    expect(backgrounds[0]).toContain("linear-gradient");
  });

  test("FAQ accordion expands", async ({ page }) => {
    await page.goto("/#faq");

    const question = page.getByRole("button", {
      name: /how do i install the widget/i,
    });
    await question.click();
    await expect(page.getByText(/paste one script tag/i)).toBeVisible();
  });

  test("guides index renders", async ({ page }) => {
    await page.goto("/guides");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("dashboard responds with restrictive security headers", async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(baseURL!);
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'"
    );
    expect(response.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin"
    );
  });

  test("unauthenticated dashboard routes redirect to sign-in", async ({
    page,
  }) => {
    await page.goto("/conversations");
    await page.waitForURL(/sign-in/);
    expect(page.url()).toContain("/sign-in");
  });
});
