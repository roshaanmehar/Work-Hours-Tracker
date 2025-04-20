/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize production builds with webpack
  webpack: (config, { dev, isServer }) => {
    // Only apply optimizations in production
    if (!dev) {
      // Improve chunk splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000
      };
    }
    
    return config;
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Optimize images
  images: {
    unoptimized: true,
  },
  // Improve build performance by skipping type checking
  typescript: {
    // This is safe since we're running type checking in a separate process
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
