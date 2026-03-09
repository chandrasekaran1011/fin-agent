/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["faiss-node", "@prisma/client", "ioredis"],
};

export default nextConfig;
