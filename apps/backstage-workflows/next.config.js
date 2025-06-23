/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/workflows',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/workflows' : undefined,
}

module.exports = nextConfig