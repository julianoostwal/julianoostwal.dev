/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
  },
  // Disable powered by header
  poweredByHeader: false,
  // Compress responses
  compress: true,
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["lucide-react", "@heroui/react", "framer-motion"],
  },
};

export default nextConfig;
