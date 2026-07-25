import { expect, test } from "@playwright/test";

test.describe("customer widget", () => {
  test("shows the error screen when organizationId is missing", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText(/organization id is required/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("shows the error screen for an unknown organization", async ({
    page,
  }) => {
    await page.goto("/?organizationId=org_does_not_exist_e2e");
    // Either the backend answers "invalid" or (with no backend configured)
    // verification fails — both must land on the error screen, never a chat.
    await expect(
      page.getByText(
        /invalid configuration|unable to verify organization|organization not (found|valid)/i
      )
    ).toBeVisible({ timeout: 20_000 });
  });

  test("contact-session API rejects malformed submissions", async ({
    request,
    baseURL,
  }) => {
    const response = await request.post(`${baseURL}/api/contact-sessions`, {
      data: { name: "", email: "not-an-email", organizationId: "" },
    });
    expect([400, 503]).toContain(response.status());
  });

  test("widget responds with framing and hardening headers", async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(baseURL!);
    expect(response.headers()["content-security-policy"]).toContain(
      "frame-ancestors"
    );
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });
});
