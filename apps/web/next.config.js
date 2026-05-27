/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile workspace packages so they work in the Next.js build
  transpilePackages: [
    "@repo/trpc",
    "@repo/services",
    "@repo/database",
    "@repo/logger",
    "@repo/ui",
  ],

  // Packages that use Node.js APIs (pg, drizzle) need to be external
  // so they run in Node.js runtime, not edge
  serverExternalPackages: ["pg", "drizzle-orm"],
};

export default nextConfig;
