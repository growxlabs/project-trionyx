import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@trionyx/ai',
    '@trionyx/ui',
    '@trionyx/design-tokens',
    '@trionyx/types',
    '@trionyx/auth',
    '@trionyx/validation',
    '@trionyx/database',
    'streamdown',
    '@streamdown/code',
    'shiki',
    '@json-render/react',
    '@json-render/core',
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
