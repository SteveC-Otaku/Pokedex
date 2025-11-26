/**
 * 完整数据预加载脚本
 * 从 PokeAPI 获取所有宝可梦的完整数据（包括详情、招式、出现地点等）并保存为本地 JSON 文件
 * 
 * 使用方法：
 * 1. 安装依赖：pnpm install
 * 2. 运行脚本：pnpm tsx scripts/generate-full-pokemon-data.ts
 * 3. 生成的文件会保存在 public/data/pokemon-full-data.json
 */

import * as fs from "fs"
import * as path from "path"
import type { Pokemon, Move, Location } from "../lib/pokemon-types"

// 扩展 Pokemon 类型以包含 moves 和 locations
type PokemonWithDetails = Pokemon & {
  moves: Move[]
  locations: Location[]
}

const API_BASE = "https://pokeapi.co/api/v2"
const OUTPUT_DIR = path.join(process.cwd(), "public", "data")
const OUTPUT_FILE = path.join(OUTPUT_DIR, "pokemon-full-data.json")

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

async function fetchFullPokemonDetail(id: number): Promise<Pokemon | null> {
  try {
    // 获取宝可梦基本信息
    const pokemon = await fetchWithDelay<{
      id: number
      name: string
      height: number
      weight: number
      types: { slot: number; type: { name: string } }[]
      abilities: { ability: { name: string; url: string }; is_hidden: boolean }[]
      stats: { base_stat: number; stat: { name: string } }[]
      sprites: {
        front_default: string
        back_default: string
        front_shiny: string
        back_shiny: string
        front_female: string | null
        back_female: string | null
        front_shiny_female: string | null
        back_shiny_female: string | null
        other: {
          "official-artwork": {
            front_default: string
            front_shiny: string
          }
        }
      }
      moves: {
        move: { name: string; url: string }
        version_group_details: {
          level_learned_at: number
          move_learn_method: { name: string }
          version_group: { url: string }
        }[]
      }[]
      forms: { name: string; url: string }[]
      species: { url: string }
    }>(`${API_BASE}/pokemon/${id}`, 50)

    // 获取物种数据
    const speciesData = await fetchWithDelay<{
      capture_rate: number
      base_happiness: number
      genera: { genus: string; language: { name: string } }[]
      names: { name: string; language: { name: string } }[]
      habitat: { name: string } | null
      generation: { url: string }
      growth_rate: { name: string }
      gender_rate: number
      evolution_chain: { url: string }
      varieties: { is_default: boolean; pokemon: { name: string; url: string } }[]
    }>(pokemon.species.url, 50)

    const genId = Number.parseInt(speciesData.generation.url.split("/").filter(Boolean).pop() || "1")

    // 解析名称
    const names: { [lang: string]: string } = {}
    speciesData.names.forEach((n) => {
      if (n.language.name === "en") names.en = n.name
      if (n.language.name === "zh-Hans") names.zh = n.name
      if (n.language.name === "zh-Hant") names.zhHant = n.name
      if (n.language.name === "ja") names.ja = n.name
    })
    if (!names.zh && names.zhHant) names.zh = names.zhHant

    // 解析分类
    let genera = ""
    for (const g of speciesData.genera) {
      if (g.language.name === "zh-Hans" || g.language.name === "zh-Hant") {
        genera = g.genus
        break
      }
    }
    if (!genera) {
      const en = speciesData.genera.find((g) => g.language.name === "en")
      if (en) genera = en.genus
    }

    // 获取特性
    const abilities = await Promise.all(
      pokemon.abilities.map(async (a) => {
        const abilityData = await fetchWithDelay<{
          names: { name: string; language: { name: string } }[]
          flavor_text_entries: { flavor_text: string; language: { name: string } }[]
        }>(a.ability.url, 50)

        const abilityNames: { [lang: string]: string } = {}
        abilityData.names.forEach((n) => {
          if (n.language.name === "en") abilityNames.en = n.name
          if (n.language.name === "zh-Hans") abilityNames.zh = n.name
          if (n.language.name === "zh-Hant") abilityNames.zhHant = n.name
        })
        if (!abilityNames.zh && abilityNames.zhHant) abilityNames.zh = abilityNames.zhHant

        let description = ""
        for (const f of abilityData.flavor_text_entries) {
          if (f.language.name === "zh-Hans" || f.language.name === "zh-Hant") {
            description = f.flavor_text
            break
          }
        }
        if (!description) {
          const en = abilityData.flavor_text_entries.find((f) => f.language.name === "en")
          if (en) description = en.flavor_text
        }

        return {
          name: a.ability.name,
          names: abilityNames,
          isHidden: a.is_hidden,
          description,
        }
      }),
    )

    // 解析种族值
    const statsMap: { [key: string]: number } = {}
    pokemon.stats.forEach((s) => {
      statsMap[s.stat.name] = s.base_stat
    })
    const stats = {
      hp: statsMap["hp"] || 0,
      attack: statsMap["attack"] || 0,
      defense: statsMap["defense"] || 0,
      specialAttack: statsMap["special-attack"] || 0,
      specialDefense: statsMap["special-defense"] || 0,
      speed: statsMap["speed"] || 0,
      total: Object.values(statsMap).reduce((a, b) => a + b, 0),
    }

    // 解析图片
    const sprites = {
      front: pokemon.sprites.front_default || "",
      back: pokemon.sprites.back_default || "",
      frontShiny: pokemon.sprites.front_shiny || "",
      backShiny: pokemon.sprites.back_shiny || "",
      frontFemale: pokemon.sprites.front_female || undefined,
      backFemale: pokemon.sprites.back_female || undefined,
      frontShinyFemale: pokemon.sprites.front_shiny_female || undefined,
      backShinyFemale: pokemon.sprites.back_shiny_female || undefined,
      artwork: pokemon.sprites.other["official-artwork"].front_default || "",
      artworkShiny: pokemon.sprites.other["official-artwork"].front_shiny || undefined,
    }

    // 获取进化链（简化版，只获取基本信息）
    let evolutionChain: any[] = []
    try {
      const evolutionData = await fetchWithDelay<{
        chain: {
          species: { name: string; url: string }
          evolution_details: {
            trigger: { name: string }
            min_level: number | null
            item: { name: string } | null
            time_of_day: string
            location: { name: string } | null
          }[]
          evolves_to: unknown[]
        }
      }>(speciesData.evolution_chain.url, 50)

      const parseEvolutionChain = async (chain: typeof evolutionData.chain): Promise<any> => {
        const speciesId = Number.parseInt(chain.species.url.split("/").filter(Boolean).pop() || "1")

        const speciesInfo = await fetchWithDelay<{
          names: { name: string; language: { name: string } }[]
        }>(chain.species.url, 50)

        const evoNames: { [lang: string]: string } = {}
        speciesInfo.names.forEach((n) => {
          if (n.language.name === "en") evoNames.en = n.name
          if (n.language.name === "zh-Hans") evoNames.zh = n.name
          if (n.language.name === "zh-Hant") evoNames.zhHant = n.name
        })
        if (!evoNames.zh && evoNames.zhHant) evoNames.zh = evoNames.zhHant

        const evolvesToNodes = await Promise.all(
          (chain.evolves_to as (typeof evolutionData.chain)[]).map((e) => parseEvolutionChain(e)),
        )

        return {
          id: speciesId,
          name: chain.species.name,
          names: evoNames,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
          evolutionDetails: chain.evolution_details.map((d) => ({
            trigger: d.trigger.name,
            minLevel: d.min_level || undefined,
            item: d.item?.name,
            timeOfDay: d.time_of_day || undefined,
            location: d.location?.name,
          })),
          evolvesTo: evolvesToNodes,
        }
      }

      evolutionChain = [await parseEvolutionChain(evolutionData.chain)]
    } catch {
      // Skip evolution chain if it fails
    }

    // 获取形态
    const forms: any[] = []
    for (const variety of speciesData.varieties) {
      if (variety.is_default) continue
      try {
        const formPokemon = await fetchWithDelay<{
          name: string
          types: { type: { name: string } }[]
          sprites: {
            front_default: string
            back_default: string
            front_shiny: string
            back_shiny: string
            other: { "official-artwork": { front_default: string; front_shiny: string } }
          }
        }>(variety.pokemon.url, 50)

        forms.push({
          name: formPokemon.name,
          formName: formPokemon.name.replace(`${pokemon.name}-`, ""),
          sprites: {
            front: formPokemon.sprites.front_default || "",
            back: formPokemon.sprites.back_default || "",
            frontShiny: formPokemon.sprites.front_shiny || "",
            backShiny: formPokemon.sprites.back_shiny || "",
            artwork: formPokemon.sprites.other["official-artwork"].front_default || "",
            artworkShiny: formPokemon.sprites.other["official-artwork"].front_shiny || "",
          },
          types: formPokemon.types.map((t) => t.type.name),
        })
      } catch {
        // Skip forms that fail to load
      }
    }

    // 获取招式（获取所有版本的招式，不筛选）
    const moves: Move[] = []
    const seenMoves = new Set<string>()

    for (const m of pokemon.moves || []) {
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

        // 使用第一个版本组详情（保存所有招式，不筛选世代）
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

    // 获取出现地点
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
    } catch {
      // Skip locations if API fails
    }

    const species = {
      captureRate: speciesData.capture_rate,
      baseHappiness: speciesData.base_happiness || 0,
      evolutionChain,
      genera,
      habitat: speciesData.habitat?.name || "",
      generation: genId,
      growthRate: speciesData.growth_rate.name,
      genderRate: speciesData.gender_rate,
    }

    return {
      id: pokemon.id,
      name: pokemon.name,
      names,
      types: pokemon.types.map((t) => t.type.name),
      abilities,
      stats,
      sprites,
      species,
      height: pokemon.height,
      weight: pokemon.weight,
      forms,
      moves,
      locations,
      locationsChecked: true, // 标记为已检查过出现地点
    }
  } catch (error) {
    console.error(`获取 #${id} 详情失败:`, error)
    return null
  }
}

async function generateFullPokemonData() {
  console.log("🚀 开始生成完整宝可梦数据...")
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
  const allPokemonIds = listData.data.map((p: { id: number }) => p.id)

  // 尝试加载已有的数据（断点续传）
  // 优化：只加载 ID 列表，不加载完整数据，减少内存占用
  let detailsMap: Record<number, PokemonWithDetails> = {}
  let existingIds = new Set<number>()
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      // 使用流式读取，只获取已有的 ID 列表
      const fileContent = fs.readFileSync(OUTPUT_FILE, "utf-8")
      const fileSize = fs.statSync(OUTPUT_FILE).size / 1024 / 1024
      
      if (fileSize > 50) {
        // 如果文件太大（>50MB），使用轻量级方式只读取 ID
        console.log(`📂 发现已有数据文件 (${fileSize.toFixed(1)} MB)，文件较大，使用轻量级加载...`)
        // 使用正则表达式快速提取所有 ID，避免完整解析
        const idMatches = fileContent.match(/"id"\s*:\s*(\d+)/g)
        if (idMatches) {
          idMatches.forEach(match => {
            const id = Number.parseInt(match.match(/\d+/)?.[0] || "0")
            if (id > 0) existingIds.add(id)
          })
          console.log(`📂 已识别 ${existingIds.size} 个已有宝可梦 ID`)
        }
        // 不加载完整数据，只标记为已存在
        console.log(`🔄 将从中断处继续（不加载完整数据到内存）...`)
      } else {
        // 文件较小，可以完整加载
        const existingData = JSON.parse(fileContent)
        if (existingData.data && typeof existingData.data === "object") {
          detailsMap = existingData.data
          existingIds = new Set(Object.keys(detailsMap).map(Number))
          console.log(`📂 发现已有数据文件，已加载 ${Object.keys(detailsMap).length} 个宝可梦的数据`)
          console.log(`🔄 将从中断处继续...`)
        }
      }
    } catch (error) {
      console.log("⚠️  无法读取已有数据文件，将从头开始")
    }
  }

  // 过滤出需要获取的宝可梦 ID
  const pokemonIds = allPokemonIds.filter((id: number) => !existingIds.has(id))
  const total = allPokemonIds.length
  const alreadyHave = existingIds.size
  const batchSize = 3 // 详情数据获取很慢，使用很小的批次
  const saveInterval = 10 // 每 10 个批次保存一次，减少内存压力

  console.log(`📊 共需要获取 ${total} 个宝可梦的完整详情数据`)
  console.log(`✅ 已有 ${alreadyHave} 个，待获取 ${pokemonIds.length} 个`)
  if (pokemonIds.length > 0) {
    console.log(`⏳ 预计需要 ${Math.ceil(pokemonIds.length / batchSize)} 批次，每批次约 ${batchSize * 5} 秒`)
    console.log(`⏰ 总预计时间：约 ${Math.ceil((pokemonIds.length / batchSize) * batchSize * 5 / 60)} 分钟`)
  } else {
    console.log(`✅ 所有数据已完整，无需继续获取`)
  }

  // 如果所有数据都已存在，直接返回
  if (pokemonIds.length === 0) {
    console.log(`\n✅ 所有数据已完整！`)
    console.log(`📁 数据文件: ${OUTPUT_FILE}`)
    console.log(`📊 共 ${Object.keys(detailsMap).length} 个宝可梦的完整详情数据`)
    console.log(`💾 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`)
    return
  }

  // 分批获取数据
  for (let i = 0; i < pokemonIds.length; i += batchSize) {
    const batch = pokemonIds.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(pokemonIds.length / batchSize)

    console.log(`\n📦 批次 ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, pokemonIds.length)})`)

    const promises = batch.map(async (id: number) => {
      const detail = await fetchFullPokemonDetail(id)
      if (detail) {
        detailsMap[id] = detail as PokemonWithDetails
        process.stdout.write(
          `✓ #${id}: ${detail.moves.length} 招式, ${detail.locations.length} 地点\n`
        )
      } else {
        process.stdout.write(`✗ #${id}: 获取失败\n`)
      }
    })

    await Promise.all(promises)

    // 每 N 个批次保存一次（减少内存压力）
    const shouldSave = (batchNum % saveInterval === 0) || (batchNum === totalBatches)
    
    if (shouldSave) {
      // 每批次后保存一次（防止中途失败丢失数据）
      // 优化：如果文件很大，使用增量追加方式，而不是重写整个文件
      const currentTotal = alreadyHave + Object.keys(detailsMap).length
      const shouldUseIncremental = fs.existsSync(OUTPUT_FILE) && fs.statSync(OUTPUT_FILE).size > 50 * 1024 * 1024 // 50MB
      
      if (shouldUseIncremental && Object.keys(detailsMap).length > 0) {
        // 增量保存：只保存新获取的数据
        try {
          // 读取现有文件
          const existingContent = fs.readFileSync(OUTPUT_FILE, "utf-8")
          const existingData = JSON.parse(existingContent)
          
          // 合并新数据
          Object.assign(existingData.data, detailsMap)
          existingData.total = Object.keys(existingData.data).length
          existingData.timestamp = Date.now()
          
          // 使用压缩格式保存（不格式化），减少内存占用
          fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingData), "utf-8")
          console.log(`💾 已保存 ${currentTotal}/${total} 个宝可梦的数据 (进度: ${((currentTotal / total) * 100).toFixed(1)}%) [增量模式]`)
          
          // 清空 detailsMap 以释放内存（数据已保存）
          detailsMap = {}
        } catch (error) {
          console.error(`⚠️  增量保存失败，使用完整保存:`, error)
          // 回退到完整保存：重新读取文件
          try {
            const existingContent = fs.readFileSync(OUTPUT_FILE, "utf-8")
            const existingData = JSON.parse(existingContent)
            const dataToSave = {
              version: "1.0.0",
              timestamp: Date.now(),
              total: currentTotal,
              data: { ...existingData.data, ...detailsMap },
            }
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataToSave), "utf-8")
            console.log(`💾 已保存 ${currentTotal}/${total} 个宝可梦的数据 (进度: ${((currentTotal / total) * 100).toFixed(1)}%)`)
          } catch (retryError) {
            console.error(`❌ 保存失败:`, retryError)
          }
        }
      } else {
        // 正常保存（文件较小或首次保存）
        const dataToSave = {
          version: "1.0.0",
          timestamp: Date.now(),
          total: currentTotal,
          data: detailsMap,
        }
        // 使用压缩格式保存（不格式化），减少内存占用
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(dataToSave), "utf-8")
        console.log(`💾 已保存 ${currentTotal}/${total} 个宝可梦的数据 (进度: ${((currentTotal / total) * 100).toFixed(1)}%)`)
      }
    } else {
      // 不保存，只显示进度
      const currentTotal = alreadyHave + Object.keys(detailsMap).length
      console.log(`📊 进度: ${currentTotal}/${total} (${((currentTotal / total) * 100).toFixed(1)}%) - 将在第 ${Math.ceil(batchNum / saveInterval) * saveInterval} 批次保存`)
    }
  }

  // 最终保存（合并所有数据）
  if (Object.keys(detailsMap).length > 0 || !fs.existsSync(OUTPUT_FILE)) {
    let finalData: any
    if (fs.existsSync(OUTPUT_FILE)) {
      // 读取现有数据并合并
      const existingContent = fs.readFileSync(OUTPUT_FILE, "utf-8")
      const existingData = JSON.parse(existingContent)
      Object.assign(existingData.data, detailsMap)
      finalData = {
        version: "1.0.0",
        timestamp: Date.now(),
        total: Object.keys(existingData.data).length,
        data: existingData.data,
      }
    } else {
      finalData = {
        version: "1.0.0",
        timestamp: Date.now(),
        total: Object.keys(detailsMap).length,
        data: detailsMap,
      }
    }
    // 使用压缩格式保存（不格式化），减少内存占用
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData), "utf-8")
  }

  // 读取最终统计信息
  let finalTotal = 0
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const finalContent = fs.readFileSync(OUTPUT_FILE, "utf-8")
      const finalData = JSON.parse(finalContent)
      finalTotal = Object.keys(finalData.data || {}).length
    } catch {
      finalTotal = alreadyHave + Object.keys(detailsMap).length
    }
  } else {
    finalTotal = Object.keys(detailsMap).length
  }

  console.log(`\n✅ 完成！`)
  console.log(`📁 数据已保存到: ${OUTPUT_FILE}`)
  console.log(`📊 共获取 ${finalTotal} 个宝可梦的完整详情数据`)
  if (fs.existsSync(OUTPUT_FILE)) {
    console.log(`💾 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`)
  }
}

// 运行脚本
generateFullPokemonData().catch((error) => {
  console.error("❌ 生成数据时出错:", error)
  process.exit(1)
})

