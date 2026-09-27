import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@trionyx/ui', '@trionyx/design-tokens', '@trionyx/types', '@trionyx/api', '@trionyx/database', '@trionyx/validation'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.21st.dev',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  serverExternalPackages: ['@libsql/client', 'pg'],
};

export default nextConfig;
