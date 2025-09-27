/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allow importing code from sibling directories, e.g. niraya-nextjs
    externalDir: true,
  },
};

module.exports = nextConfig;
