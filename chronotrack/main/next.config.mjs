/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  output: 'standalone',

  // Optimize production builds
  swcMinify: true,
  
  // Improve production performance
  reactStrictMode: true,
  
  // Optimize images
  images: {
    unoptimized: true,
  },
  
  // Improve build performance
  typescript: {
    // Only do type checking in CI/CD, not during local builds
    ignoreBuildErrors: process.env.CI ? false : true
  },
  
  eslint: {
    // Only do linting in CI/CD, not during local builds
    ignoreDuringBuilds: process.env.CI ? false : true,
  },
  
  // Webpack optimization
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
    
    // Reduce the impact of unused dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any specific aliases here if needed
    };
    
    return config;
  },
  
  // Enable experimental features for better performance
  experimental: {
    // Modern JS features
    serverActions: true,
    // Optimize CSS
    optimizeCss: true,
  }
};

export default nextConfig;
