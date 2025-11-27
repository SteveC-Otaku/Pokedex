# GitHub Pages 部署指南

## 📋 部署步骤

### 1. 确保所有更改已提交

首先，确保你的代码更改已经提交到本地仓库：

```bash
# 查看更改状态
git status

# 如果有未提交的更改，先提交
git add .
git commit -m "添加新功能：队伍保存、形态切换等"
```

### 2. 构建并准备部署文件

#### 方法一：使用构建脚本（推荐）

如果 `scripts/build-for-github-pages.ts` 存在：

```bash
pnpm build:pages
```

#### 方法二：手动构建

```bash
# 设置环境变量并构建
$env:GITHUB_PAGES="true"; $env:NODE_ENV="production"; pnpm build

# 将 out 目录内容复制到 docs 目录
# Windows PowerShell:
Copy-Item -Path out\* -Destination docs\ -Recurse -Force

# Windows CMD:
xcopy /E /I /Y out docs

# Linux/Mac:
cp -r out/* docs/

# 创建 .nojekyll 文件（告诉 GitHub Pages 不要使用 Jekyll）
New-Item -Path docs\.nojekyll -ItemType File -Force
```

### 3. 提交并推送到 GitHub

```bash
# 添加 docs 目录到 Git
git add docs/

# 提交更改
git commit -m "Deploy to GitHub Pages"

# 推送到远程仓库
git push origin main
```

### 4. 配置 GitHub Pages（首次部署）

如果这是第一次部署，需要在 GitHub 仓库设置中配置：

1. 打开 GitHub 仓库页面
2. 点击 **Settings**（设置）
3. 在左侧菜单找到 **Pages**（页面）
4. 在 **Source**（源）部分：
   - 选择 **Deploy from a branch**（从分支部署）
   - **Branch**（分支）选择 `main`
   - **Folder**（文件夹）选择 `/docs`
5. 点击 **Save**（保存）

### 5. 等待部署完成

- GitHub Pages 通常需要几分钟来部署
- 部署完成后，访问：`https://stevec-otaku.github.io/Pokedex/`

## 🔄 更新部署

每次更新代码后，只需重复步骤 2-3：

```bash
# 1. 构建
pnpm build:pages

# 2. 提交并推送
git add docs/
git commit -m "Update deployment"
git push origin main
```

## ⚠️ 注意事项

1. **确保数据文件已包含**：
   - `public/data/pokemon-list.json`
   - `public/data/pokemon-full-data.json`
   - 这些文件需要被复制到 `docs/` 目录

2. **检查 `.nojekyll` 文件**：
   - `docs/.nojekyll` 文件必须存在
   - 这告诉 GitHub Pages 不要使用 Jekyll 处理

3. **basePath 配置**：
   - 确保 `next.config.mjs` 中设置了正确的 `basePath: '/Pokedex'`
   - 构建脚本会自动设置环境变量

4. **文件大小限制**：
   - GitHub Pages 单个文件限制为 100MB
   - 仓库总大小限制为 1GB
   - 如果数据文件太大，可能需要使用 Git LFS

## 🐛 常见问题

### 问题：页面显示 404

**解决方案**：
- 检查 GitHub Pages 设置中 Source 是否选择了 `/docs`
- 确认 `basePath` 配置正确
- 检查 URL 是否正确：`https://stevec-otaku.github.io/Pokedex/`（注意末尾的斜杠）

### 问题：图片或资源加载失败

**解决方案**：
- 检查 `next.config.mjs` 中的 `basePath` 和 `assetPrefix` 设置
- 确认所有资源路径都使用了 `process.env.NEXT_PUBLIC_BASE_PATH`

### 问题：数据文件未加载

**解决方案**：
- 确认 `public/data/` 目录下的文件已复制到 `docs/data/`
- 检查浏览器控制台的网络请求，确认文件路径正确

## 📝 快速部署命令（一键部署）

可以创建一个批处理文件或脚本来自动化部署：

**Windows (`deploy.bat`)**:
```batch
@echo off
echo Building for GitHub Pages...
call pnpm build:pages
echo.
echo Committing changes...
git add docs/
git commit -m "Deploy to GitHub Pages"
echo.
echo Pushing to GitHub...
git push origin main
echo.
echo Deployment complete! Please wait a few minutes for GitHub Pages to update.
pause
```

**Linux/Mac (`deploy.sh`)**:
```bash
#!/bin/bash
echo "Building for GitHub Pages..."
pnpm build:pages
echo ""
echo "Committing changes..."
git add docs/
git commit -m "Deploy to GitHub Pages"
echo ""
echo "Pushing to GitHub..."
git push origin main
echo ""
echo "Deployment complete! Please wait a few minutes for GitHub Pages to update."
```

使用方法：
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

