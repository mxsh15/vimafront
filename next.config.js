console.log("NEXT CONFIG LOADED", process.env.NODE_ENV);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cacheComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5167",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
