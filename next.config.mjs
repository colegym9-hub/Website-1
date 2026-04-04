/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "maath"],
  async redirects() {
    return [
      { source: '/portfolio', destination: '/work', permanent: true },
      { source: '/services', destination: '/book', permanent: true },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "acmediaco.pixieset.com",
      },
      {
        protocol: "https",
        hostname: "images.pixieset.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "photos.smugmug.com",
      },
      {
        protocol: "https",
        hostname: "images-pw.pixieset.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default nextConfig
