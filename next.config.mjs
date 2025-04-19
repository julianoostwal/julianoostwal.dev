/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'minio-sss8o88ck0o0ckggo4ogs48w.5.253.247.243.sslip.io',
            port: '',
            pathname: '/**',
          },
        ],
      },
};

export default nextConfig;
