import type { Pokemon, Stats, Sprites, Ability, Move } from "./pokemon-types"

const API_BASE = "https://pokeapi.co/api/v2"

// Cache for API responses
const cache = new Map<string, unknown>()

async function fetchWithCache<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`API request failed: ${url}`)
  }

  const data = await response.json()
  cache.set(url, data)
  return data as T
}

/**
 * 获取宝可梦形态的完整数据（包括种族值、特性等）
 */
export async function fetchPokemonFormData(formName: string): Promise<{
  stats: Stats
  types: string[]
  abilities: Ability[]
  sprites: Sprites
  height: number
  weight: number
}> {
  try {
    // 确保形态名称格式正确（API 需要完整的形态名称，如 "rotom-wash"）
    const formPokemon = await fetchWithCache<{
      name: string
      types: { type: { name: string } }[]
      stats: { base_stat: number; stat: { name: string } }[]
      abilities: {
        ability: { name: string; url: string }
        is_hidden: boolean
        slot: number
      }[]
      sprites: {
        front_default: string | null
        back_default: string | null
        front_shiny: string | null
        back_shiny: string | null
        other?: { "official-artwork"?: { front_default?: string; front_shiny?: string } }
      }
      height: number
      weight: number
    }>(`${API_BASE}/pokemon/${formName}`)

    // 提取种族值
    const stats: Stats = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
      total: 0,
    }

    formPokemon.stats.forEach((stat) => {
      const statName = stat.stat.name.replace("-", "")
      if (statName === "hp") stats.hp = stat.base_stat
      else if (statName === "attack") stats.attack = stat.base_stat
      else if (statName === "defense") stats.defense = stat.base_stat
      else if (statName === "specialattack") stats.specialAttack = stat.base_stat
      else if (statName === "specialdefense") stats.specialDefense = stat.base_stat
      else if (statName === "speed") stats.speed = stat.base_stat
    })

    stats.total = stats.hp + stats.attack + stats.defense + stats.specialAttack + stats.specialDefense + stats.speed

    // 提取特性
    const abilities: Ability[] = []
    for (const ab of formPokemon.abilities) {
      try {
        const abilityData = await fetchWithCache<{
          names: { name: string; language: { name: string } }[]
          flavor_text_entries: { flavor_text: string; language: { name: string } }[]
        }>(ab.ability.url)

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

        abilities.push({
          name: ab.ability.name,
          names: abilityNames,
          isHidden: ab.is_hidden,
          description,
        })
      } catch {
        // Skip abilities that fail to load
      }
    }

    return {
      stats,
      types: formPokemon.types.map((t) => t.type.name),
      abilities,
      sprites: {
        front: formPokemon.sprites.front_default || "",
        back: formPokemon.sprites.back_default || "",
        frontShiny: formPokemon.sprites.front_shiny || "",
        backShiny: formPokemon.sprites.back_shiny || "",
        artwork: formPokemon.sprites.other?.["official-artwork"]?.front_default || "",
        artworkShiny: formPokemon.sprites.other?.["official-artwork"]?.front_shiny || "",
      },
      height: formPokemon.height,
      weight: formPokemon.weight,
    }
  } catch (error) {
    console.error(`Failed to fetch form data for ${formName}:`, error)
    // 提供更详细的错误信息
    if (error instanceof Error) {
      throw new Error(`无法加载形态数据 (${formName}): ${error.message}`)
    }
    throw new Error(`无法加载形态数据 (${formName}): 未知错误`)
  }
}

/**
 * 获取宝可梦形态的招式数据
 */
export async function fetchPokemonFormMoves(formName: string, generation?: number): Promise<Move[]> {
  try {
    const formPokemon = await fetchWithCache<{
      moves: {
        move: { name: string; url: string }
        version_group_details: {
          level_learned_at: number
          move_learn_method: { name: string }
          version_group: { name: string; url: string }
        }[]
      }[]
    }>(`${API_BASE}/pokemon/${formName}`)

    const moves: Move[] = []
    const seenMoves = new Set<string>()

    for (const m of formPokemon.moves) {
      if (seenMoves.has(m.move.name)) continue

      // Filter by generation if specified
      const relevantDetails = m.version_group_details.filter((d) => {
        if (!generation) return true
        const vgId = Number.parseInt(d.version_group.url.split("/").filter(Boolean).pop() || "1")
        return vgId <= generation * 2 // Rough mapping
      })

      if (relevantDetails.length === 0) continue

      try {
        const moveData = await fetchWithCache<{
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
        }>(m.move.url)

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

        const detail = relevantDetails[0]
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
  } catch (error) {
    console.error(`Failed to fetch form moves for ${formName}:`, error)
    throw error
  }
}

