import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  serverExternalPackages: ["xlsx"],
  // Prevent Next from picking an unrelated parent lockfile as the tracing root on Windows monorepos.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
