# 开发者文档

本文档包含项目开发相关的技术细节和工具说明。

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **数据获取**: SWR
- **数据源**: 
  - [PokeAPI](https://pokeapi.co/)
  - [宝可梦中文 Wiki](https://wiki.52poke.com/)

## 📁 项目结构

```
Pokedex/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 主页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── pokemon-*.tsx      # 宝可梦相关组件
│   └── ui/                # UI 组件库
├── lib/                   # 工具函数
│   ├── pokemon-api.ts     # PokeAPI 接口
│   ├── pokemon-types.ts   # TypeScript 类型定义
│   ├── pokemon-utils.ts   # 工具函数（捕获率计算等）
│   └── utils.ts           # 通用工具
├── scripts/               # 数据生成脚本（开发工具）
│   ├── generate-*.ts      # 数据生成脚本
│   └── build-for-github-pages.ts # 部署脚本
├── public/                # 静态资源
│   └── data/              # 数据文件
└── contexts/              # React Context
    ├── language-context.tsx # 语言切换
    ├── favorites-context.tsx # 收藏功能
    └── teams-context.tsx  # 队伍保存
```

## 📝 数据生成脚本

项目包含以下数据生成脚本（位于 `scripts/` 目录）：

- `generate-pokemon-data.ts` - 生成基础宝可梦列表
- `generate-full-pokemon-data.ts` - 生成完整宝可梦数据
- `generate-pokemon-details.ts` - 生成宝可梦详细信息
- `update-pokemon-locations.ts` - 更新出现地点数据（从 PokeAPI）
- `clean-wiki-locations.ts` - 清理 Wiki 数据
- `package-for-distribution.ts` - 打包分发版本
- `build-for-github-pages.ts` - 构建 GitHub Pages 版本

### 使用方法

```bash
# 生成基础列表
pnpm generate-data

# 生成完整数据
pnpm generate-full-data

# 更新出现地点
pnpm update-locations

# 构建 GitHub Pages 版本
pnpm build:pages
```

## 🌐 GitHub Pages 部署

详细部署说明请查看 [DEPLOY.md](./DEPLOY.md)

## 📝 数据说明

项目使用本地 JSON 文件存储宝可梦数据：

- `public/data/pokemon-list.json`: 基础列表（编号、名称、图片等）
- `public/data/pokemon-full-data.json`: 完整数据（包含详细信息、招式、出现地点等）

数据文件已包含在仓库中，可直接使用。如果需要重新生成，请运行相应的数据生成脚本。

## 🔧 开发环境设置

1. 克隆仓库
2. 安装依赖：`pnpm install`
3. 运行开发服务器：`pnpm dev`
4. 访问 http://localhost:3000

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！







