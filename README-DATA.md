# 数据预加载说明

## 概述

为了提升加载速度和支持离线使用，本项目支持将宝可梦数据预加载到本地 JSON 文件。

## 数据加载优先级

1. **本地 JSON 文件** (`public/data/pokemon-list.json`) - 最快，支持离线
2. **localStorage** - 次快，需要浏览器支持
3. **API 请求** - 最慢，需要网络连接

## 生成本地数据文件

### 方法 1: 使用 npm 脚本（推荐）

```bash
# 安装依赖（如果还没有安装 tsx）
pnpm install

# 运行数据生成脚本
pnpm generate-data
```

### 方法 2: 直接使用 tsx

```bash
# 安装 tsx（如果还没有）
pnpm add -D tsx

# 运行脚本
pnpm tsx scripts/generate-pokemon-data.ts
```

## 脚本说明

脚本会：
1. 从 PokeAPI 获取所有 1025 个宝可梦的数据
2. 包括：ID、名称（中/英/日）、类型、图片链接、世代
3. 分批获取（每批 20 个），避免 API 限流
4. 实时显示进度
5. 每批次自动保存，防止中途失败丢失数据
6. 最终保存到 `public/data/pokemon-list.json`

## 预计时间

- 总数据量：1025 个宝可梦
- 每批次：20 个
- 每批次延迟：约 2-3 秒（避免 API 限流）
- **预计总时间：约 2-3 分钟**

## 生成的文件

```
public/
  data/
    pokemon-list.json  (约 1-2 MB)
```

## 文件格式

```json
{
  "version": "1.0.0",
  "timestamp": 1234567890,
  "total": 1025,
  "data": [
    {
      "id": 1,
      "name": "bulbasaur",
      "names": {
        "en": "Bulbasaur",
        "zh": "妙蛙种子",
        "ja": "フシギダネ"
      },
      "types": ["grass", "poison"],
      "sprite": "https://...",
      "generation": 1
    },
    ...
  ]
}
```

## 使用本地数据

生成文件后，应用会自动：
1. 优先从 `public/data/pokemon-list.json` 加载
2. 如果文件不存在，则从 localStorage 加载
3. 如果都没有，则从 API 获取

## 更新数据

如果需要更新数据（例如新增了宝可梦），只需重新运行生成脚本：

```bash
pnpm generate-data
```

新生成的文件会覆盖旧文件。

## 注意事项

1. **首次运行**：需要网络连接，从 API 获取数据
2. **文件大小**：生成的 JSON 文件约 1-2 MB
3. **API 限流**：脚本已添加延迟，避免触发 API 限流
4. **错误处理**：如果某个宝可梦获取失败，会使用基础数据继续
5. **进度保存**：每批次都会保存，即使中途失败也不会丢失已获取的数据

## 离线使用

生成数据文件后，即使没有网络连接，应用也能：
- 显示所有宝可梦列表
- 搜索宝可梦
- 查看基本信息
- 筛选和排序

注意：宝可梦详情（招式、出现地点等）仍需要网络连接从 API 获取。


