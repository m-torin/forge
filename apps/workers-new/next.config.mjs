/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
