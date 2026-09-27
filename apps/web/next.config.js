/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@truerefurb/shared-types', '@truerefurb/config', '@truerefurb/validation'],
};

module.exports = nextConfig;
