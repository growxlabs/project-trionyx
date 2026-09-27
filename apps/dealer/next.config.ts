import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@trionyx/ui',
    '@trionyx/design-tokens',
    '@trionyx/types',
    '@trionyx/auth',
    '@trionyx/validation',
    '@trionyx/database',
  ],
  serverExternalPackages: ['@libsql/client', '@node-rs/argon2', 'pg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
