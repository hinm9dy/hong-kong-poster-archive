import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vinext inspects multipart requests before route dispatch. Leave room for
  // form metadata; the upload route enforces the exact 5,000,000-byte file cap.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};

export default nextConfig;
