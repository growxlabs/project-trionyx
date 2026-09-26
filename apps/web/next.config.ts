import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@trionyx/ui', '@trionyx/design-tokens', '@trionyx/types'],
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
    ],
  },
};

export default nextConfig;
