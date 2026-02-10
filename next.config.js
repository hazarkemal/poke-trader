/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3']
  },
  images: {
    domains: ['courtyard.io', 'images.pokemontcg.io']
  }
};

module.exports = nextConfig;
