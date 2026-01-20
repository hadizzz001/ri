/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["www.dbeauty.fi"], // Add your hostname here
      },
          eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
