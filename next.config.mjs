/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["www.dbeauty.fi"], // Add your hostname here
      },
      typescript: {
        ignoreBuildErrors: true,
      },
};

export default nextConfig;
