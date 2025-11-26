/**
 * 详情数据预加载脚本
 * 从 PokeAPI 获取所有宝可梦的完整详情数据（包括招式、出现地点等）并保存为本地 JSON 文件
 * 
 * 使用方法：
 * 1. 安装依赖：pnpm install
 * 2. 运行脚本：pnpm tsx scripts/generate-pokemon-details.ts
 * 3. 生成的文件会保存在 public/data/pokemon-details.json
 */

import * as fs from "fs"
import * as path from "path"
import type { Pokemon, Move, Location } from "../lib/pokemon-types"

const API_BASE = "https://pokeapi.co/api/v2"
const OUTPUT_DIR = path.join(process.cwd(), "public", "data")
const OUTPUT_FILE = path.join(OUTPUT_DIR, "pokemon-details.json")

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

async function fetchPokemonMoves(pokemonId: number): Promise<Move[]> {
  try {
    const pokemon = await fetchWithDelay<{
      moves: {
        move: { name: string; url: string }
        version_group_details: {
          level_learned_at: number
          move_learn_method: { name: string }
          version_group: { url: string }
        }[]
      }[]
    }>(`${API_BASE}/pokemon/${pokemonId}`, 50)

    const moves: Move[] = []
    const seenMoves = new Set<string>()

    for (const m of pokemon.moves) {
      if (seenMoves.has(m.move.name)) continue

      try {
        const moveData = await fetchWithDelay<{
          id: number
          name: string
          names: { name: string; language: { name: string } }[]
          type: { name: string }
          damage_class: { name: string }
          power: number | null
          accuracy: number | null
          pp: number
          flavor_text_entries: { flavor_text: string; language: { name: string }; version_group: { name: string } }[]
          generation: { url: string }
        }>(m.move.url, 50)

        const moveNames: { [lang: string]: string } = {}
        moveData.names.forEach((n) => {
          if (n.language.name === "en") moveNames.en = n.name
          if (n.language.name === "zh-Hans") moveNames.zh = n.name
          if (n.language.name === "zh-Hant") moveNames.zhHant = n.name
        })
        if (!moveNames.zh && moveNames.zhHant) moveNames.zh = moveNames.zhHant

        let description = ""
        for (const f of moveData.flavor_text_entries) {
          if (f.language.name === "zh-Hans" || f.language.name === "zh-Hant") {
            description = f.flavor_text
            break
          }
        }
        if (!description) {
          const en = moveData.flavor_text_entries.find((f) => f.language.name === "en")
          if (en) description = en.flavor_text
        }

        const detail = m.version_group_details[0]
        const moveGenId = Number.parseInt(moveData.generation.url.split("/").filter(Boolean).pop() || "1")

        moves.push({
          id: moveData.id,
          name: moveData.name,
          names: moveNames,
          type: moveData.type.name,
          category: moveData.damage_class.name as "physical" | "special" | "status",
          power: moveData.power,
          accuracy: moveData.accuracy,
          pp: moveData.pp,
          description,
          learnMethod: detail.move_learn_method.name,
          levelLearnedAt: detail.level_learned_at || undefined,
          generation: moveGenId,
        })

        seenMoves.add(m.move.name)
      } catch {
        // Skip moves that fail to load
      }
    }

    return moves.sort((a, b) => {
      if (a.learnMethod !== b.learnMethod) {
        const order = ["level-up", "machine", "tutor", "egg"]
        return order.indexOf(a.learnMethod) - order.indexOf(b.learnMethod)
      }
      if (a.levelLearnedAt && b.levelLearnedAt) {
        return a.levelLearnedAt - b.levelLearnedAt
      }
      return 0
    })
  } catch {
    return []
  }
}

async function fetchPokemonLocations(pokemonId: number): Promise<Location[]> {
  try {
    const encounters = await fetchWithDelay<
      {
        location_area: { name: string; url: string }
        version_details: {
          version: { name: string; url: string }
          encounter_details: {
            chance: number
            method: { name: string }
            min_level: number
            max_level: number
          }[]
        }[]
      }[]
    >(`${API_BASE}/pokemon/${pokemonId}/encounters`, 50)

    const locations: Location[] = []

    for (const enc of encounters) {
      for (const vd of enc.version_details) {
        const versionId = Number.parseInt(vd.version.url.split("/").filter(Boolean).pop() || "1")
        const versionGen = Math.ceil(versionId / 2)

        try {
          const locationArea = await fetchWithDelay<{
            location: { name: string; url: string }
            names: { name: string; language: { name: string } }[]
          }>(enc.location_area.url, 50)

          const locData = await fetchWithDelay<{
            names: { name: string; language: { name: string } }[]
          }>(locationArea.location.url, 50)

          const locNames: { [lang: string]: string } = {}
          locData.names.forEach((n) => {
            if (n.language.name === "en") locNames.en = n.name
            if (n.language.name === "zh-Hans") locNames.zh = n.name
            if (n.language.name === "zh-Hant") locNames.zhHant = n.name
          })
          if (!locNames.zh && locNames.zhHant) locNames.zh = locNames.zhHant

          for (const detail of vd.encounter_details) {
            locations.push({
              name: locationArea.location.name,
              names: locNames,
              game: vd.version.name,
              generation: versionGen,
              encounterMethod: detail.method.name,
              chance: detail.chance,
              minLevel: detail.min_level,
              maxLevel: detail.max_level,
            })
          }
        } catch {
          // Skip locations that fail to load
        }
      }
    }

    return locations
  } catch {
    return []
  }
}

async function generatePokemonDetails() {
  console.log("🚀 开始生成宝可梦详情数据...")
  console.log("📡 正在从 PokeAPI 获取数据...")

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // 读取列表数据以获取所有宝可梦 ID
  const listFile = path.join(OUTPUT_DIR, "pokemon-list.json")
  if (!fs.existsSync(listFile)) {
    console.error("❌ 错误：找不到 pokemon-list.json 文件")
    console.error("   请先运行 pnpm generate-data 生成列表数据")
    process.exit(1)
  }

  const listData = JSON.parse(fs.readFileSync(listFile, "utf-8"))
  const pokemonIds = listData.data.map((p: { id: number }) => p.id)

  const detailsMap: Record<number, { moves: Move[]; locations: Location[] }> = {}
  const total = pokemonIds.length
  const batchSize = 5 // 详情数据获取较慢，使用更小的批次

  console.log(`📊 共需要获取 ${total} 个宝可梦的详情数据`)
  console.log(`⏳ 预计需要 ${Math.ceil(total / batchSize)} 批次，每批次约 ${batchSize * 2} 秒`)

  // 分批获取数据
  for (let i = 0; i < total; i += batchSize) {
    const batch = pokemonIds.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(total / batchSize)

    console.log(`\n📦 批次 ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, total)})`)

    const promises = batch.map(async (id: number) => {
      try {
        const [moves, locations] = await Promise.all([
          fetchPokemonMoves(id),
          fetchPokemonLocations(id),
        ])

        detailsMap[id] = { moves, locations }
        process.stdout.write(`✓ #${id}: ${moves.length} 招式, ${locations.length} 地点\n`)
        return { id, success: true }
      } catch (error) {
        console.error(`✗ 获取 #${id} 详情失败:`, error)
        detailsMap[id] = { moves: [], locations: [] }
        return { id, success: false }
      }
    })

    await Promise.all(promises)

    // 每批次后保存一次（防止中途失败丢失数据）
    const dataToSave = {
      version: "1.0.0",
      timestamp: Date.now(),
      total: Object.keys(detailsMap).length,
      data: detailsMap,
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataToSave, null, 2), "utf-8")
  }

  // 最终保存
  const finalData = {
    version: "1.0.0",
    timestamp: Date.now(),
    total: Object.keys(detailsMap).length,
    data: detailsMap,
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2), "utf-8")

  console.log(`\n✅ 完成！`)
  console.log(`📁 数据已保存到: ${OUTPUT_FILE}`)
  console.log(`📊 共获取 ${Object.keys(detailsMap).length} 个宝可梦的详情数据`)
  console.log(`💾 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`)
}

// 运行脚本
generatePokemonDetails().catch((error) => {
  console.error("❌ 生成数据时出错:", error)
  process.exit(1)
})


