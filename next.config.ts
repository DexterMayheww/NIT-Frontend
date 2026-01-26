import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  
  images: {
    remotePatterns: [
      {
        protocol: "http",
        // hostname: "drupal-college-cms.ddev.site",
        hostname: "dev-nit-backend.pantheonsite.io",
        pathname: '/sites/**',
      },
      {
        protocol: "https",
        hostname: "dev-nit-backend.pantheonsite.io",
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
