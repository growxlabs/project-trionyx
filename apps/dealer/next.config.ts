import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@trionyx/ui', '@trionyx/design-tokens', '@trionyx/types'],
};

export default nextConfig;
