/**
 * 数据预加载脚本
 * 从 PokeAPI 获取所有宝可梦数据并保存为本地 JSON 文件
 * 
 * 使用方法：
 * 1. 安装依赖：pnpm install
 * 2. 运行脚本：pnpm tsx scripts/generate-pokemon-data.ts
 * 3. 生成的文件会保存在 public/data/pokemon-list.json
 */

import * as fs from "fs"
import * as path from "path"

const API_BASE = "https://pokeapi.co/api/v2"
const OUTPUT_DIR = path.join(process.cwd(), "public", "data")
const OUTPUT_FILE = path.join(OUTPUT_DIR, "pokemon-list.json")

interface PokemonListItem {
  id: number
  name: string
  names: { [lang: string]: string }
  types: string[]
  sprite: string
  generation: number
}

function getGenerationFromId(id: number): number {
  if (id <= 151) return 1
  if (id <= 251) return 2
  if (id <= 386) return 3
  if (id <= 493) return 4
  if (id <= 649) return 5
  if (id <= 721) return 6
  if (id <= 809) return 7
  if (id <= 905) return 8
  return 9
}

async function fetchWithDelay<T>(url: string, delay: number = 100): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay))
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API request failed: ${url}`)
  }
  return response.json() as Promise<T>
}

async function generatePokemonData() {
  console.log("🚀 开始生成宝可梦数据...")
  console.log("📡 正在从 PokeAPI 获取数据...")

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // 获取所有宝可梦列表
  const listData = await fetchWithDelay<{ results: { name: string; url: string }[] }>(
    `${API_BASE}/pokemon?limit=1025`,
    0
  )

  const pokemonList: PokemonListItem[] = []
  const total = listData.results.length
  const batchSize = 20 // 减小批次大小，避免API限流

  console.log(`📊 共需要获取 ${total} 个宝可梦的数据`)
  console.log(`⏳ 预计需要 ${Math.ceil(total / batchSize)} 批次，每批次约 ${batchSize * 0.1} 秒`)

  // 分批获取数据
  for (let i = 0; i < total; i += batchSize) {
    const batch = listData.results.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(total / batchSize)

    console.log(`\n📦 批次 ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, total)})`)

    const promises = batch.map(async (p, idx) => {
      const id = i + idx + 1
      try {
        // 获取宝可梦基本信息
        const pokemon = await fetchWithDelay<{
          types: { type: { name: string } }[]
          species: { url: string }
        }>(`${API_BASE}/pokemon/${id}`, 50)

        // 获取物种信息（包含多语言名称）
        const species = await fetchWithDelay<{
          names: { name: string; language: { name: string } }[]
        }>(pokemon.species.url, 50)

        const names: { [lang: string]: string } = { en: p.name }
        species.names.forEach((n) => {
          if (n.language.name === "en") names.en = n.name
          if (n.language.name === "zh-Hans") names.zh = n.name
          if (n.language.name === "zh-Hant") names.zhHant = n.name
          if (n.language.name === "ja") names.ja = n.name
        })
        if (!names.zh && names.zhHant) names.zh = names.zhHant

        const item: PokemonListItem = {
          id,
          name: p.name,
          names,
          types: pokemon.types.map((t) => t.type.name),
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          generation: getGenerationFromId(id),
        }

        process.stdout.write(`✓ ${id}: ${names.zh || names.en}\n`)
        return item
      } catch (error) {
        console.error(`✗ 获取 #${id} ${p.name} 失败:`, error)
        // 返回基础数据
        return {
          id,
          name: p.name,
          names: { en: p.name },
          types: [],
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          generation: getGenerationFromId(id),
        }
      }
    })

    const results = await Promise.all(promises)
    pokemonList.push(...results)

    // 每批次后保存一次（防止中途失败丢失数据）
    const dataToSave = {
      version: "1.0.0",
      timestamp: Date.now(),
      total: pokemonList.length,
      data: pokemonList,
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataToSave, null, 2), "utf-8")
  }

  // 最终保存
  const finalData = {
    version: "1.0.0",
    timestamp: Date.now(),
    total: pokemonList.length,
    data: pokemonList,
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2), "utf-8")

  console.log(`\n✅ 完成！`)
  console.log(`📁 数据已保存到: ${OUTPUT_FILE}`)
  console.log(`📊 共获取 ${pokemonList.length} 个宝可梦的数据`)
  console.log(`💾 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`)
}

// 运行脚本
generatePokemonData().catch((error) => {
  console.error("❌ 生成数据时出错:", error)
  process.exit(1)
})

