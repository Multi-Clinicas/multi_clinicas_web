import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "multiclinicas.com.br",
    "*.multiclinicas.com.br",
  ],
  async rewrites() {
    return [
      {
        // Proxya todas as chamadas /api/* para o backend Spring Boot,
        // eliminando CORS em desenvolvimento.
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
