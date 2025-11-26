/**
 * 补充缺失的宝可梦出现地点数据
 * 特别针对第8和第9世代的宝可梦
 */

import * as fs from "fs"
import * as path from "path"

const API_BASE = "https://pokeapi.co/api/v2"
const OUTPUT_DIR = path.join(process.cwd(), "public", "data")
const OUTPUT_FILE = path.join(OUTPUT_DIR, "pokemon-full-data.json")

interface Location {
  name: string
  names: { [lang: string]: string }
  game: string
  generation: number
  encounterMethod: string
  chance: number
  minLevel: number
  maxLevel: number
}

async function fetchWithDelay<T>(url: string, delay: number = 100): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay))
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

async function fetchPokemonLocations(id: number): Promise<Location[]> {
  const locations: Location[] = []
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
    >(`${API_BASE}/pokemon/${id}/encounters`, 50)

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
            if (n.language.name === "ja") locNames.ja = n.name
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
        } catch (error) {
          // Skip locations that fail to load
          console.error(`  警告: 获取地点信息失败 (${enc.location_area.name})`)
        }
      }
    }
  } catch (error) {
    console.error(`  错误: 获取出现地点失败:`, error)
  }

  return locations
}

async function updatePokemonLocations() {
  console.log("🚀 开始补充宝可梦出现地点数据...")
  console.log("📡 正在从 PokeAPI 获取数据...")

  if (!fs.existsSync(OUTPUT_FILE)) {
    console.error("❌ 错误：找不到 pokemon-full-data.json 文件")
    console.error("   请先运行 pnpm generate-full-data 生成完整数据")
    process.exit(1)
  }

  // 读取现有数据
  console.log("📂 正在读取现有数据文件...")
  const fileContent = fs.readFileSync(OUTPUT_FILE, "utf-8")
  const data = JSON.parse(fileContent)

  if (!data.data || typeof data.data !== "object") {
    console.error("❌ 错误：数据文件格式无效")
    process.exit(1)
  }

  // 找出没有检查过出现地点的宝可梦（locationsChecked 为 undefined 或 false）
  const pokemonWithoutLocations: number[] = []
  Object.values(data.data).forEach((pokemon: any) => {
    if (pokemon.locationsChecked === undefined || pokemon.locationsChecked === false) {
      pokemonWithoutLocations.push(pokemon.id)
    }
  })

  console.log(`📊 发现 ${pokemonWithoutLocations.length} 个宝可梦没有出现地点数据`)
  console.log(`⏳ 开始补充数据...\n`)

  const batchSize = 5
  let updatedCount = 0
  let failedCount = 0

  for (let i = 0; i < pokemonWithoutLocations.length; i += batchSize) {
    const batch = pokemonWithoutLocations.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(pokemonWithoutLocations.length / batchSize)

    console.log(`📦 批次 ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, pokemonWithoutLocations.length)})`)

    const promises = batch.map(async (id: number) => {
      try {
        const locations = await fetchPokemonLocations(id)
        // 标记为已检查
        data.data[id].locationsChecked = true
        if (locations.length > 0) {
          data.data[id].locations = locations
          updatedCount++
          process.stdout.write(`✓ #${id}: 获取了 ${locations.length} 个出现地点\n`)
        } else {
          // 即使没有出现地点，也标记为已检查（空数组）
          data.data[id].locations = []
          process.stdout.write(`- #${id}: 无出现地点（可能是传说/神话宝可梦）\n`)
        }
      } catch (error) {
        // 即使获取失败，也标记为已检查（避免重复尝试）
        data.data[id].locationsChecked = true
        data.data[id].locations = []
        failedCount++
        process.stdout.write(`✗ #${id}: 获取失败\n`)
      }
    })

    await Promise.all(promises)

    // 每批次后保存一次
    if (batchNum % 5 === 0 || batchNum === totalBatches) {
      data.timestamp = Date.now()
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data), "utf-8")
      console.log(`💾 已保存进度 (${updatedCount} 个已更新, ${failedCount} 个失败)`)
    }
  }

  // 最终保存
  data.timestamp = Date.now()
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data), "utf-8")

  console.log(`\n✅ 完成！`)
  console.log(`📁 数据已保存到: ${OUTPUT_FILE}`)
  console.log(`📊 成功更新: ${updatedCount} 个宝可梦`)
  console.log(`❌ 失败: ${failedCount} 个宝可梦`)
  console.log(`💾 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`)
}

// 运行脚本
updatePokemonLocations().catch((error) => {
  console.error("❌ 更新出现地点时出错:", error)
  process.exit(1)
})

