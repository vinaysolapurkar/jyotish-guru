import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel deployment
  poweredByHeader: false,
  reactStrictMode: true,

  // Ensure Prisma client works in serverless
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-libsql", "@libsql/client", "bcryptjs"],
};

export default nextConfig;
