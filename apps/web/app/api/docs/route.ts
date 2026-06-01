import { ApiReference } from "@scalar/nextjs-api-reference";

export const GET = ApiReference({
  spec: {
    url: "/api/docs/json",
  },
  theme: "saturn",
  darkMode: true,
  hideClientButton: true,
  customCss: `
    .show-api-client-button { display: none !important; }
  `,
});
