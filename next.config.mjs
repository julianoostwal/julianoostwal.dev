/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Projects moved to the Quixly portfolio; keep old links working.
  async redirects() {
    return [
      { source: "/projects", destination: "https://quixly.dev/en/portfolio", permanent: true },
      { source: "/projects/:path*", destination: "https://quixly.dev/en/portfolio", permanent: true },
    ];
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
