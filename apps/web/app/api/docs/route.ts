import { ApiReference } from "@scalar/nextjs-api-reference";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { serverRouter } from "@repo/trpc/server";

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Konoha Forms API",
  description: "Production-grade form builder API. Create dynamic forms, collect responses and track analytics.",
  version: "1.0.0",
  baseUrl: "/api/backend",
  tags: ["forms", "fields", "responses", "analytics", "themes", "explore", "health", "auth"],
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
});

export const GET = ApiReference({
  spec: {
    content: openApiDocument,
  },
  theme: "saturn",
  darkMode: true,
  hideClientButton: true,
  customCss: `
    .show-api-client-button { display: none !important; }
  `,
});
