/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/cms',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/cms' : undefined,
}

module.exports = nextConfig