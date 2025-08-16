import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ⛑️ Autorise le build même si des erreurs ESLint existent
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
