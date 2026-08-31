import path from 'path';
import os from 'os';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Webpack Cache Fix ────────────────────────────────────────────────────────
  // Redirect webpack's file-system cache outside of the OneDrive-synced folder.
  // OneDrive tries to sync .next/cache while webpack is mid-write, causing
  // ENOENT errors on Windows when renaming temp pack files.
  webpack(config, { dev }) {
    if (dev) {
      config.cache = {
        type: 'filesystem',
        cacheDirectory: path.join(os.tmpdir(), 'mili-next-cache'),
        compression: false,
      };
    }
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.vercel.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
