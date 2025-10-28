/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ✅ Skip TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip linting errors
  },
};

export default nextConfig;
