/**
 * 构建并准备 GitHub Pages 部署文件
 * 将构建后的文件复制到 docs/ 目录
 */

import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"

const DOCS_DIR = path.join(process.cwd(), "docs")
const OUT_DIR = path.join(process.cwd(), "out")

async function buildForGitHubPages() {
  console.log("📦 开始构建 GitHub Pages 版本...\n")

  // 1. 清理旧的 docs 目录
  if (fs.existsSync(DOCS_DIR)) {
    console.log("🧹 清理旧的 docs 目录...")
    fs.rmSync(DOCS_DIR, { recursive: true, force: true })
  }

  // 2. 构建静态网站（使用 GitHub Pages 配置）
  console.log("🔨 构建静态网站（GitHub Pages 模式）...")
  try {
    // 设置环境变量
    process.env.GITHUB_PAGES = "true"
    process.env.NODE_ENV = "production"
    
    execSync("pnpm build", { 
      stdio: "inherit",
      env: {
        ...process.env,
        GITHUB_PAGES: "true",
        NODE_ENV: "production",
      }
    })
  } catch (error) {
    console.error("❌ 构建失败:", error)
    process.exit(1)
  }

  // 3. 检查 out 目录是否存在
  if (!fs.existsSync(OUT_DIR)) {
    console.error("❌ 错误：out 目录不存在，构建可能失败")
    process.exit(1)
  }

  // 4. 创建 docs 目录
  console.log("📂 创建 docs 目录...")
  fs.mkdirSync(DOCS_DIR, { recursive: true })

  // 5. 复制构建输出到 docs 目录
  console.log("📋 复制构建文件到 docs/...")
  copyRecursiveSync(OUT_DIR, DOCS_DIR)

  // 6. 创建 .nojekyll 文件（告诉 GitHub Pages 不要使用 Jekyll）
  const nojekyllPath = path.join(DOCS_DIR, ".nojekyll")
  fs.writeFileSync(nojekyllPath, "")

  console.log("\n✅ 构建完成！")
  console.log(`📁 文件已复制到: ${DOCS_DIR}`)
  console.log("\n📋 下一步：")
  console.log("   1. git add docs/")
  console.log("   2. git commit -m 'Deploy to GitHub Pages'")
  console.log("   3. git push origin main")
  console.log("   4. 在 GitHub 仓库 Settings > Pages 中选择 Source: /docs")
}

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats?.isDirectory()

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      )
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

buildForGitHubPages().catch((error) => {
  console.error("❌ 错误:", error)
  process.exit(1)
})

