import type {
  Pokemon,
  PokemonListItem,
  Move,
  Location,
  EvolutionNode,
  Stats,
  Sprites,
  Ability,
  PokemonForm,
  Species,
} from "./pokemon-types"
import { loadPokemonListFromFile, loadPokemonFullDataFromFile } from "./pokemon-data-loader"
import type { Pokemon } from "./pokemon-types"

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

export async function fetchPokemonList(): Promise<PokemonListItem[]> {
  const data = await fetchWithCache<{ results: { name: string; url: string }[] }>(`${API_BASE}/pokemon?limit=1025`)

  const pokemonList: PokemonListItem[] = []

  // Fetch basic info for each pokemon (we'll batch this)
  const batchSize = 50
  for (let i = 0; i < data.results.length; i += batchSize) {
    const batch = data.results.slice(i, i + batchSize)
    const promises = batch.map(async (p, idx) => {
      const id = i + idx + 1
      try {
        const pokemon = await fetchWithCache<{
          id: number
          name: string
          types: { type: { name: string } }[]
          sprites: { front_default: string }
        }>(`${API_BASE}/pokemon/${id}`)

        const species = await fetchWithCache<{
          names: { name: string; language: { name: string } }[]
          generation: { url: string }
        }>(`${API_BASE}/pokemon-species/${id}`)

        const genId = Number.parseInt(species.generation.url.split("/").filter(Boolean).pop() || "1")

        const names: { [lang: string]: string } = {}
        species.names.forEach((n) => {
          if (n.language.name === "en") names.en = n.name
          if (n.language.name === "zh-Hans") names.zh = n.name
          if (n.language.name === "zh-Hant") names.zhHant = n.name
          if (n.language.name === "ja") names.ja = n.name
        })
        if (!names.zh && names.zhHant) names.zh = names.zhHant

        return {
          id: pokemon.id,
          name: pokemon.name,
          names,
          types: pokemon.types.map((t) => t.type.name),
          sprite: pokemon.sprites.front_default || "",
          generation: genId,
        }
      } catch {
        return null
      }
    })

    const results = await Promise.all(promises)
    pokemonList.push(...results.filter((p): p is PokemonListItem => p !== null))
  }

  return pokemonList
}

export async function fetchPokemonBasicList(): Promise<PokemonListItem[]> {
  // 只从本地 JSON 文件加载
  const fileData = await loadPokemonListFromFile()
  if (!fileData || fileData.length === 0) {
    throw new Error("无法加载宝可梦数据。请确保 public/data/pokemon-list.json 文件存在。运行 pnpm generate-data 生成数据文件。")
  }
  return fileData
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

export async function fetchPokemonDetail(idOrName: number | string): Promise<Pokemon> {
  // 优先从本地完整数据文件加载
  if (typeof idOrName === "number") {
    const fullData = await loadPokemonFullDataFromFile()
    if (fullData && fullData[idOrName]) {
      const fullPokemon = fullData[idOrName]
      // 返回 Pokemon 格式（不包含 moves 和 locations，它们单独获取）
      // 但保留 locationsChecked 标记
      const { moves, locations, locationsChecked, ...pokemonData } = fullPokemon
      const result = pokemonData as Pokemon & { locationsChecked?: boolean }
      if (locationsChecked !== undefined) {
        (result as any).locationsChecked = locationsChecked
      }
      console.log(`✅ 从本地文件加载了宝可梦详情 #${idOrName}`)
      return result
    }
  }

  // 如果本地文件没有，从 API 获取
  const pokemon = await fetchWithCache<{
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
    forms: { name: string; url: string }[]
    species: { url: string }
  }>(`${API_BASE}/pokemon/${idOrName}`)

  // Fetch species data
  const speciesData = await fetchWithCache<{
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
  }>(pokemon.species.url)

  const genId = Number.parseInt(speciesData.generation.url.split("/").filter(Boolean).pop() || "1")

  // Parse names
  const names: { [lang: string]: string } = {}
  speciesData.names.forEach((n) => {
    if (n.language.name === "en") names.en = n.name
    if (n.language.name === "zh-Hans") names.zh = n.name
    if (n.language.name === "zh-Hant") names.zhHant = n.name
    if (n.language.name === "ja") names.ja = n.name
  })
  if (!names.zh && names.zhHant) names.zh = names.zhHant

  // Parse genera
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

  // Fetch abilities
  const abilities: Ability[] = await Promise.all(
    pokemon.abilities.map(async (a) => {
      const abilityData = await fetchWithCache<{
        names: { name: string; language: { name: string } }[]
        flavor_text_entries: { flavor_text: string; language: { name: string } }[]
      }>(a.ability.url)

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

  // Parse stats
  const statsMap: { [key: string]: number } = {}
  pokemon.stats.forEach((s) => {
    statsMap[s.stat.name] = s.base_stat
  })
  const stats: Stats = {
    hp: statsMap["hp"] || 0,
    attack: statsMap["attack"] || 0,
    defense: statsMap["defense"] || 0,
    specialAttack: statsMap["special-attack"] || 0,
    specialDefense: statsMap["special-defense"] || 0,
    speed: statsMap["speed"] || 0,
    total: Object.values(statsMap).reduce((a, b) => a + b, 0),
  }

  // Parse sprites
  const sprites: Sprites = {
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

  // Fetch evolution chain
  const evolutionData = await fetchWithCache<{
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
  }>(speciesData.evolution_chain.url)

  const parseEvolutionChain = async (chain: typeof evolutionData.chain): Promise<EvolutionNode> => {
    const speciesId = Number.parseInt(chain.species.url.split("/").filter(Boolean).pop() || "1")

    const speciesInfo = await fetchWithCache<{
      names: { name: string; language: { name: string } }[]
    }>(chain.species.url)

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

  const evolutionChain = [await parseEvolutionChain(evolutionData.chain)]

  // Fetch forms
  const forms: PokemonForm[] = []
  for (const variety of speciesData.varieties) {
    if (variety.is_default) continue
    try {
      const formPokemon = await fetchWithCache<{
        name: string
        types: { type: { name: string } }[]
        sprites: {
          front_default: string
          back_default: string
          front_shiny: string
          back_shiny: string
          other: { "official-artwork": { front_default: string; front_shiny: string } }
        }
      }>(variety.pokemon.url)

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

  const species: Species = {
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
  }
}

export async function fetchPokemonMoves(pokemonId: number, generation?: number): Promise<Move[]> {
  // 优先从本地完整数据文件加载
  const fullData = await loadPokemonFullDataFromFile()
  if (fullData && fullData[pokemonId] && fullData[pokemonId].moves) {
    let moves = fullData[pokemonId].moves
    // 如果指定了世代，进行筛选
    if (generation) {
      moves = moves.filter((m) => m.generation <= generation)
    }
    console.log(`✅ 从本地文件加载了宝可梦 #${pokemonId} 的 ${moves.length} 个招式`)
    return moves
  }

  // 如果本地文件没有，从 API 获取
  const pokemon = await fetchWithCache<{
    moves: {
      move: { name: string; url: string }
      version_group_details: {
        level_learned_at: number
        move_learn_method: { name: string }
        version_group: { name: string; url: string }
      }[]
    }[]
  }>(`${API_BASE}/pokemon/${pokemonId}`)

  const moves: Move[] = []
  const seenMoves = new Set<string>()

  for (const m of pokemon.moves) {
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
}

export async function fetchPokemonLocations(pokemonId: number, generation?: number): Promise<Location[]> {
  // 优先从本地完整数据文件加载
  const fullData = await loadPokemonFullDataFromFile()
  if (fullData && fullData[pokemonId] && fullData[pokemonId].locations) {
    let locations = fullData[pokemonId].locations
    // 如果指定了世代，进行筛选（但默认不筛选，显示所有世代）
    if (generation) {
      locations = locations.filter((l) => l.generation === generation)
    }
    // 如果本地数据有出现地点，直接返回
    if (locations.length > 0) {
      console.log(`✅ 从本地文件加载了宝可梦 #${pokemonId} 的 ${locations.length} 个出现地点`)
      return locations
    }
    // 如果本地数据为空数组，继续尝试从API获取
  }

  // 如果本地文件没有，从 API 获取
  try {
    const encounters = await fetchWithCache<
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
    >(`${API_BASE}/pokemon/${pokemonId}/encounters`)

    const locations: Location[] = []

    for (const enc of encounters) {
      for (const vd of enc.version_details) {
        const versionId = Number.parseInt(vd.version.url.split("/").filter(Boolean).pop() || "1")
        const versionGen = Math.ceil(versionId / 2)

        if (generation && versionGen !== generation) continue

        try {
          const locationArea = await fetchWithCache<{
            location: { name: string; url: string }
            names: { name: string; language: { name: string } }[]
          }>(enc.location_area.url)

          const locData = await fetchWithCache<{
            names: { name: string; language: { name: string } }[]
          }>(locationArea.location.url)

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

export function clearCache(): void {
  cache.clear()
}
