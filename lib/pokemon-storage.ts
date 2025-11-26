import type { PokemonListItem } from "./pokemon-types"

const STORAGE_KEY = "pokedex-pokemon-list"
const STORAGE_VERSION = "1.0.0"
const STORAGE_VERSION_KEY = "pokedex-storage-version"

export interface StoredPokemonList {
  version: string
  timestamp: number
  data: PokemonListItem[]
}

/**
 * Save pokemon list to localStorage
 */
export function savePokemonListToStorage(pokemonList: PokemonListItem[]): void {
  if (typeof window === "undefined") return

  const stored: StoredPokemonList = {
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    data: pokemonList,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION)
  } catch (error) {
    console.error("Failed to save pokemon list to localStorage:", error)
  }
}

/**
 * Load pokemon list from localStorage
 */
export function loadPokemonListFromStorage(): PokemonListItem[] | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const parsed: StoredPokemonList = JSON.parse(stored)

    // Check if version matches
    if (parsed.version !== STORAGE_VERSION) {
      console.log("Storage version mismatch, clearing old data")
      clearPokemonListStorage()
      return null
    }

    // Check if data is older than 7 days (optional: refresh data)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (parsed.timestamp < sevenDaysAgo) {
      console.log("Stored data is older than 7 days, consider refreshing")
      // Still return the data, but you might want to refresh in background
    }

    return parsed.data
  } catch (error) {
    console.error("Failed to load pokemon list from localStorage:", error)
    return null
  }
}

/**
 * Clear pokemon list from localStorage
 */
export function clearPokemonListStorage(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_VERSION_KEY)
  } catch (error) {
    console.error("Failed to clear pokemon list from localStorage:", error)
  }
}

/**
 * Export pokemon list as JSON file
 */
export function exportPokemonListAsJSON(pokemonList: PokemonListItem[]): void {
  const dataStr = JSON.stringify(pokemonList, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `pokemon-list-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export pokemon list as CSV file
 */
export function exportPokemonListAsCSV(pokemonList: PokemonListItem[]): void {
  const headers = ["ID", "Name (EN)", "Name (ZH)", "Name (JA)", "Types", "Generation"]
  const rows = pokemonList.map((p) => [
    p.id.toString(),
    p.names.en || p.name,
    p.names.zh || "",
    p.names.ja || "",
    p.types.join(", "),
    p.generation.toString(),
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = `pokemon-list-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Check if pokemon list exists in storage
 */
export function hasPokemonListInStorage(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEY) !== null
}

// Pokemon Detail Storage
const DETAIL_STORAGE_PREFIX = "pokedex-pokemon-detail-"

export function savePokemonDetailToStorage(id: number, pokemon: unknown): void {
  if (typeof window === "undefined") return

  try {
    const key = `${DETAIL_STORAGE_PREFIX}${id}`
    const data = {
      timestamp: Date.now(),
      data: pokemon,
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save pokemon detail to localStorage:", error)
  }
}

export function loadPokemonDetailFromStorage(id: number): unknown | null {
  if (typeof window === "undefined") return null

  try {
    const key = `${DETAIL_STORAGE_PREFIX}${id}`
    const stored = localStorage.getItem(key)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    
    // 检查数据是否过期（7天）
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (parsed.timestamp < sevenDaysAgo) {
      localStorage.removeItem(key)
      return null
    }

    return parsed.data
  } catch (error) {
    console.error("Failed to load pokemon detail from localStorage:", error)
    return null
  }
}

export function clearPokemonDetailStorage(): void {
  if (typeof window === "undefined") return

  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(DETAIL_STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Failed to clear pokemon detail storage:", error)
  }
}

