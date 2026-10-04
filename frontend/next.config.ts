import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@medplum/core', '@medplum/fhirtypes'],
};

export default nextConfig;
