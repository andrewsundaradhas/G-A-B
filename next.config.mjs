/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MediaPipe tasks-vision ships wasm/worker code; keep it out of server bundling.
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
};

export default nextConfig;
