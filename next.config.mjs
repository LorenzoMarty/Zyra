/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "https://nondefectively-available-len.ngrok-free.dev",
    "http://nondefectively-available-len.ngrok-free.dev",
    "http://localhost:3000"
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "picsum.photos" }
    ]
  }
};

export default nextConfig;
