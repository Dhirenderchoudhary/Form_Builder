import { NextResponse } from "next/server";
import { generateOpenApiDocument } from "trpc-to-openapi";
import { serverRouter } from "@repo/trpc/server";

export function GET() {
  const openApiDocument = generateOpenApiDocument(serverRouter, {
    title: "Konoha Forms API",
    description: "Production-grade form builder API. Create dynamic forms, collect responses and track analytics.",
    version: "1.0.0",
    baseUrl: "/api/backend",
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  });

  openApiDocument.tags = [
    { name: "Forms", description: "Manage form configurations, fields, and settings" },
    { name: "Responses", description: "Access and manage form submissions" },
    { name: "Analytics", description: "View form performance and metrics" },
    { name: "Themes", description: "Manage visual themes for forms" },
    { name: "Explore", description: "Browse and discover templates" },
    { name: "Authentication", description: "User session and token management" },
    { name: "Health", description: "API system health checks" },
  ];

  return NextResponse.json(openApiDocument);
}
