/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "https://nondefectively-available-len.ngrok-free.dev",
    "http://nondefectively-available-len.ngrok-free.dev",
    "http://localhost:3000",
    "https://zyra-drab.vercel.app",
    "https://zyra-lorenzomarty-9203s-projects.vercel.app"
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
