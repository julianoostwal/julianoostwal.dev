/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
            port: '',
            pathname: '/v0/b/julianoostwal-c3a80.appspot.com/**',
          },
        ],
      },
};

export default nextConfig;
