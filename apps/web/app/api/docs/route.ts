import { ApiReference } from "@scalar/nextjs-api-reference";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { serverRouter } from "@repo/trpc/server";

const openApiDocument = generateOpenApiDocument(serverRouter, {
  title: "Konoha Forms API",
  description: "Production-grade form builder API. Create dynamic forms, collect responses and track analytics.",
  version: "1.0.0",
  baseUrl: "/api/backend",
  // tags array removed from here to avoid TS type error
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
});

// Override tags directly on the generated document to support OpenAPI Tag objects
openApiDocument.tags = [
  { name: "Forms", description: "Manage form configurations, fields, and settings" },
  { name: "Responses", description: "Access and manage form submissions" },
  { name: "Analytics", description: "View form performance and metrics" },
  { name: "Themes", description: "Manage visual themes for forms" },
  { name: "Explore", description: "Browse and discover templates" },
  { name: "Authentication", description: "User session and token management" },
  { name: "Health", description: "API system health checks" },
];


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
