/**
 * 打包应用为可分发的静态文件
 * 生成一个包含所有必要文件的文件夹，可以直接分享给朋友使用
 */

import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"

const DIST_DIR = path.join(process.cwd(), "dist")
const OUTPUT_DIR = path.join(DIST_DIR, "Pokedex")

async function packageForDistribution() {
  console.log("📦 开始打包应用...\n")

  // 1. 清理旧的输出目录
  if (fs.existsSync(DIST_DIR)) {
    console.log("🧹 清理旧的输出目录...")
    fs.rmSync(DIST_DIR, { recursive: true, force: true })
  }

  // 2. 构建静态网站
  console.log("🔨 构建静态网站...")
  try {
    execSync("pnpm build", { stdio: "inherit" })
  } catch (error) {
    console.error("❌ 构建失败:", error)
    process.exit(1)
  }

  // 3. 创建输出目录
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })

  // 4. 复制构建输出
  console.log("📂 复制构建文件...")
  const outDir = path.join(process.cwd(), "out")
  if (fs.existsSync(outDir)) {
    // 复制所有文件，但排除data目录（稍后单独复制）
    const files = fs.readdirSync(outDir)
    files.forEach((file) => {
      if (file !== "data") {
        const srcPath = path.join(outDir, file)
        const destPath = path.join(OUTPUT_DIR, file)
        if (fs.statSync(srcPath).isDirectory()) {
          copyRecursiveSync(srcPath, destPath)
        } else {
          fs.copyFileSync(srcPath, destPath)
        }
      }
    })
  } else {
    console.error("❌ 错误：找不到 out 目录，请先运行 pnpm build")
    process.exit(1)
  }

  // 5. 复制数据文件（确保数据文件在正确位置）
  console.log("📊 复制数据文件...")
  const dataSource = path.join(process.cwd(), "public", "data")
  const dataDest = path.join(OUTPUT_DIR, "data")
  if (fs.existsSync(dataSource)) {
    fs.mkdirSync(dataDest, { recursive: true })
    copyRecursiveSync(dataSource, dataDest)
  } else {
    console.warn("⚠️  警告：找不到数据文件，应用可能无法正常工作")
  }

  // 6. 确保public文件夹中的其他资源也在正确位置
  console.log("🖼️  检查资源文件...")
  const publicSource = path.join(process.cwd(), "public")
  // 检查out目录中是否已经有public文件夹
  const outPublic = path.join(outDir, "public")
  if (!fs.existsSync(outPublic)) {
    // 如果没有，复制public文件夹（除了data）
    if (fs.existsSync(publicSource)) {
      const files = fs.readdirSync(publicSource)
      files.forEach((file) => {
        if (file !== "data") {
          const srcPath = path.join(publicSource, file)
          const destPath = path.join(OUTPUT_DIR, file)
          if (fs.statSync(srcPath).isDirectory()) {
            copyRecursiveSync(srcPath, destPath)
          } else {
            fs.copyFileSync(srcPath, destPath)
          }
        }
      })
    }
  }

  // 7. 创建启动说明文件
  console.log("📝 创建使用说明...")
  const readmeContent = `# 宝可梦图鉴 - 使用说明

## 如何使用

### 方法1：使用本地服务器（推荐）

1. 确保您的电脑已安装 Node.js（如果没有，请访问 https://nodejs.org/ 下载安装）

2. 打开命令行（Windows: 按 Win+R，输入 cmd，回车）

3. 进入这个文件夹：
   \`\`\`
   cd "${path.basename(OUTPUT_DIR)}"
   \`\`\`

4. 安装依赖（只需要第一次运行）：
   \`\`\`
   npm install -g serve
   \`\`\`

5. 启动服务器：
   \`\`\`
   serve -s . -l 3000
   \`\`\`

6. 打开浏览器，访问：http://localhost:3000

### 方法2：使用Python（如果已安装Python 3）

1. 双击 \`启动.py\` 文件
2. 浏览器会自动打开

**注意**：直接双击 index.html 文件无法正常工作，必须使用本地服务器！

## 文件说明

- \`data/\` - 宝可梦数据文件（不要删除）
- \`public/\` - 图片和资源文件（不要删除）
- \`index.html\` - 主页面

## 常见问题

**Q: 页面显示空白？**
A: 请使用方法1（本地服务器），直接打开HTML文件可能无法正常工作。

**Q: 数据加载不出来？**
A: 请确保 data 文件夹中的所有 JSON 文件都存在。

**Q: 如何更新数据？**
A: 联系开发者获取更新后的 data 文件夹，替换即可。

## 技术支持

如有问题，请联系开发者。
`
  fs.writeFileSync(path.join(OUTPUT_DIR, "README.txt"), readmeContent, "utf-8")

  // 8. 创建Windows批处理启动脚本
  const batContent = `@echo off
chcp 65001 >nul
title 宝可梦图鉴
color 0A
echo.
echo ========================================
echo    宝可梦图鉴 - 正在启动...
echo ========================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js
    echo.
    echo 请先安装 Node.js：
    echo 1. 访问 https://nodejs.org/
    echo 2. 下载并安装 LTS 版本
    echo 3. 安装完成后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo [√] 已检测到 Node.js
echo.

REM 检查是否安装了serve
where serve >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [提示] 正在安装 serve（只需要一次）...
    echo.
    call npm install -g serve
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 安装 serve 失败
        echo 请尝试手动运行: npm install -g serve
        pause
        exit /b 1
    )
    echo [√] serve 安装成功
    echo.
)

echo [提示] 正在启动本地服务器...
echo [提示] 浏览器将自动打开
echo [提示] 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

REM 等待1秒后打开浏览器
timeout /t 2 /nobreak >nul
start http://localhost:3000

REM 启动服务器（-s 表示单页应用模式，处理路由）
serve -s . -l 3000

pause
`
  fs.writeFileSync(path.join(OUTPUT_DIR, "启动.bat"), batContent, "utf-8")

  // 9. 创建简单的HTTP服务器脚本（使用Python，如果可用）
  const pythonServerContent = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的HTTP服务器，用于运行宝可梦图鉴
Python 3.x 自带，无需安装额外软件
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 3000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"服务器已启动！")
            print(f"访问地址: http://localhost:{PORT}")
            print(f"按 Ctrl+C 停止服务器")
            print()
            
            # 自动打开浏览器
            webbrowser.open(f'http://localhost:{PORT}')
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98 or e.errno == 48:  # Address already in use
            print(f"端口 {PORT} 已被占用，请关闭其他程序或修改端口号")
        else:
            print(f"启动失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
`
  fs.writeFileSync(path.join(OUTPUT_DIR, "启动.py"), pythonServerContent, "utf-8")

  // 10. 创建简单的HTML重定向页面（如果直接打开index.html）
  const redirectHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>宝可梦图鉴 - 请使用本地服务器</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
            max-width: 600px;
        }
        h1 { margin-top: 0; }
        .warning {
            background: rgba(255, 193, 7, 0.2);
            border: 2px solid #ffc107;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1rem 0;
        }
        .steps {
            text-align: left;
            background: rgba(0, 0, 0, 0.2);
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
        }
        .steps ol { margin: 0.5rem 0; }
        .steps li { margin: 0.5rem 0; }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.2rem 0.5rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 宝可梦图鉴</h1>
        <div class="warning">
            <strong>⚠️ 重要提示</strong><br>
            直接打开HTML文件无法正常工作！<br>
            必须使用本地服务器运行。
        </div>
        <div class="steps">
            <h3>📋 使用方法：</h3>
            <ol>
                <li><strong>Windows用户</strong>：双击 <code>启动.bat</code> 文件</li>
                <li><strong>有Python的用户</strong>：双击 <code>启动.py</code> 文件</li>
                <li><strong>手动启动</strong>：
                    <ol>
                        <li>安装 Node.js（如果还没有）</li>
                        <li>打开命令行，进入此文件夹</li>
                        <li>运行：<code>npm install -g serve</code></li>
                        <li>运行：<code>serve -s . -l 3000</code></li>
                        <li>浏览器访问：<code>http://localhost:3000</code></li>
                    </ol>
                </li>
            </ol>
        </div>
        <p>
            <small>如果浏览器自动打开了此页面，说明您直接打开了HTML文件。<br>
            请关闭此页面，使用上面的方法启动服务器。</small>
        </p>
    </div>
</body>
</html>`
  
  // 检查是否有index.html，如果有就备份并创建重定向页面
  const indexPath = path.join(OUTPUT_DIR, "index.html")
  if (fs.existsSync(indexPath)) {
    fs.writeFileSync(path.join(OUTPUT_DIR, "请使用服务器.html"), redirectHtml, "utf-8")
  }

  // 11. 计算文件大小
  const totalSize = getDirectorySize(OUTPUT_DIR)
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2)

  console.log(`\n✅ 打包完成！`)
  console.log(`📁 输出目录: ${OUTPUT_DIR}`)
  console.log(`💾 总大小: ${sizeMB} MB`)
  console.log(`\n📋 下一步：`)
  console.log(`   1. 将 "${path.basename(OUTPUT_DIR)}" 文件夹压缩成 ZIP`)
  console.log(`   2. 分享给朋友`)
  console.log(`   3. 朋友解压后，双击 "启动.bat" 即可使用`)
  console.log(`\n⚠️  重要：不要直接打开 index.html，必须使用启动脚本！`)
}

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()

  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true })
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

function getDirectorySize(dirPath: string): number {
  let size = 0
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      size += getDirectorySize(filePath)
    } else {
      size += stats.size
    }
  })

  return size
}

// 运行脚本
packageForDistribution().catch((error) => {
  console.error("❌ 打包失败:", error)
  process.exit(1)
})

