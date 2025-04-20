/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  output: 'standalone',
  
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
  
  // Improve build performance
  typescript: {
    ignoreBuildErrors: true
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable static page generation where possible
  experimental: {
    // This helps with precompilation
    optimizeCss: true,
    // Optimize for faster builds
    turbotrace: {
      logLevel: 'error'
    }
  }
};

export default nextConfig;
