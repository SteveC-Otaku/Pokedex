# GitHub Pages 部署问题排查

## 常见错误及解决方案

### 1. 构建失败

**错误信息**：`Build failed` 或 `pnpm build` 失败

**可能原因**：
- 依赖安装失败
- TypeScript 编译错误
- 内存不足

**解决方案**：
1. 检查 Actions 日志中的具体错误信息
2. 确保 `pnpm-lock.yaml` 文件已提交
3. 检查 `package.json` 中的依赖是否正确

### 2. out 目录不存在

**错误信息**：`out directory not found`

**可能原因**：
- Next.js 构建失败
- `next.config.mjs` 配置错误

**解决方案**：
1. 检查 `next.config.mjs` 中的 `distDir: 'out'` 配置
2. 确保 `output: 'export'` 已设置
3. 本地测试：运行 `pnpm build` 检查是否生成 `out` 目录

### 3. 权限错误

**错误信息**：`Permission denied` 或 `pages: write` 权限不足

**解决方案**：
1. 进入仓库 **Settings > Actions > General**
2. 确保 **Workflow permissions** 设置为：
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

### 4. basePath 路径错误

**错误信息**：网站显示但资源加载失败（404）

**解决方案**：
1. 确保 `next.config.mjs` 中设置了正确的 `basePath: '/Pokedex'`
2. 确保构建时设置了 `GITHUB_PAGES: 'true'` 环境变量

### 5. 数据文件太大

**错误信息**：上传超时或文件过大

**解决方案**：
- 数据文件约 35MB，在 GitHub 限制内，应该没问题
- 如果超时，可以尝试增加 Actions 超时时间

## 诊断步骤

### 步骤 1：检查 Actions 日志

1. 进入仓库的 **Actions** 标签
2. 点击失败的 workflow
3. 查看具体的错误信息
4. 重点关注：
   - `Install dependencies` 步骤
   - `Build` 步骤
   - `Upload artifact` 步骤

### 步骤 2：本地测试构建

```bash
# 设置环境变量
$env:GITHUB_PAGES='true'
$env:NODE_ENV='production'

# 构建
pnpm build

# 检查输出
ls out/
```

### 步骤 3：检查配置文件

确保以下文件存在且正确：

- ✅ `.github/workflows/deploy.yml` - 工作流配置
- ✅ `next.config.mjs` - Next.js 配置（包含 `basePath`）
- ✅ `package.json` - 包含 `build` 脚本
- ✅ `pnpm-lock.yaml` - 锁定文件

### 步骤 4：验证 Pages 设置

1. 进入 **Settings > Pages**
2. 确认：
   - **Source**: `GitHub Actions`（不是 branch）
   - **Branch**: 显示为 `GitHub Actions`

## 获取帮助

如果以上步骤都无法解决问题，请：

1. 复制完整的错误日志
2. 检查 Actions 运行日志
3. 提供具体的错误信息

## 手动部署（临时方案）

如果自动部署一直失败，可以手动部署：

```bash
# 1. 本地构建
$env:GITHUB_PAGES='true'; pnpm build

# 2. 创建 gh-pages 分支（如果不存在）
git checkout --orphan gh-pages
git rm -rf .

# 3. 复制 out 目录内容到根目录
cp -r out/* .

# 4. 提交
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# 5. 在 Settings > Pages 中选择 gh-pages 分支
```


