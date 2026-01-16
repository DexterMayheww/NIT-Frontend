import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  images: {
    remotePatterns: [
      {
        protocol: "http",
        // hostname: "drupal-college-cms.ddev.site",
        hostname: "refers-edited-sympathy-replied.trycloudflare.com",
        pathname: '/sites/**',
      },
      {
        protocol: "https",
        hostname: "refers-edited-sympathy-replied.trycloudflare.com",
        pathname: '/sites/**',
      },
      {
        protocol: "http",
        // hostname: "drupal-college-cms.ddev.site",
        hostname: "drupal-college-cms.ddev.site",
        pathname: '/sites/**',
      },
      {
        protocol: "https",
        hostname: "drupal-college-cms.ddev.site",
        pathname: '/sites/**',
      }
    ]
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
