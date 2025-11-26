/** @type {import('next').NextConfig} */
// GitHub Pages 部署时需要使用 basePath
// 仓库名是 Pokedex，所以 basePath 是 /Pokedex
const isGitHubPages = process.env.GITHUB_PAGES === 'true' || process.env.NODE_ENV === 'production'
const basePath = isGitHubPages ? '/Pokedex' : ''

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  basePath: basePath,
  assetPrefix: basePath,
}

export default nextConfig
