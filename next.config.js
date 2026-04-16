/** @type {import('next').NextConfig} */
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });

const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  /* config options here */
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL_APP,
    TENANT_PORTAL_DOMAIN: process.env.NEXT_PUBLIC_TENANT_PORTAL_DOMAIN,
    SIDEPANEL_1: process.env.NEXT_PUBLIC_SIDEPANEL_1,
    SIDEPANEL_2: process.env.NEXT_PUBLIC_SIDEPANEL_2,
    SIDEPANEL_3: process.env.NEXT_PUBLIC_SIDEPANEL_3,
    FOOTER: process.env.NEXT_PUBLIC_FOOTER,
    TITLE: process.env.NEXT_PUBLIC_TITLE,
    DESCRIPTION: process.env.NEXT_PUBLIC_DESCRIPTION,
    LOGIN: process.env.NEXT_PUBLIC_LOGIN,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    WSS_URL: process.env.NEXT_PUBLIC_WSS_URL,
    CHAT_SOCKET_URL: process.env.NEXT_PUBLIC_CHAT_SOCKET_URL,
    EXPANDED_LOGO: process.env.NEXT_PUBLIC_EXPANDED_LOGO,
    COLLAPSED_LOGO: process.env.NEXT_PUBLIC_COLLAPSED_LOGO,
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT
  },
  output: "standalone",
};

module.exports = nextConfig;
