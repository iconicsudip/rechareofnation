import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Admin uploads (/api/admin/upload) now accept video files, which routinely
    // exceed the Proxy's default 10MB buffered-body limit — raise it so large
    // video uploads aren't silently truncated before reaching the route handler.
    proxyClientMaxBodySize: "200mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rechareofnations-uploads.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
