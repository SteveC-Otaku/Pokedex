/** @type {import('next').NextConfig} */
// GitHub Pages 部署时需要使用 basePath
// 仓库名是 Pokedex，所以 basePath 是 /Pokedex
// 注意：当构建到 docs/ 目录时，总是使用 basePath
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
  // 设置环境变量，让客户端代码可以访问 basePath
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
