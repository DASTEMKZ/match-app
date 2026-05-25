import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/match-app" : "",
  assetPrefix: isProd ? "/match-app/" : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
