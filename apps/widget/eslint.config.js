import { nextJsConfig } from "@workspace/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      "turbo/no-undeclared-env-vars": [
        "warn",
        {
          allowList: [
            "^NODE_ENV$",
            "^TURNSTILE_SECRET_KEY$",
            "^WIDGET_PROXY_SECRET$",
          ],
        },
      ],
    },
  },
];
