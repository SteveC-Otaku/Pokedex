/**
 * 本地数据加载器
 * 从本地 JSON 文件加载数据
 */

import type { PokemonListItem, Pokemon, Move, Location } from "./pokemon-types"

export interface StoredPokemonData {
  version: string
  timestamp: number
  total: number
  data: PokemonListItem[]
}

export interface PokemonWithDetails extends Pokemon {
  moves: Move[]
  locations: Location[]
  locationsChecked?: boolean // 标记是否已检查过出现地点（true=已检查但无出现地点，false/undefined=未检查）
}

export interface StoredPokemonFullData {
  version: string
  timestamp: number
  total: number
  data: Record<number, PokemonWithDetails>
}

// 动态获取 basePath（GitHub Pages 使用 /Pokedex）
const getBasePath = () => {
  // 在浏览器环境中，从 window.location 检测
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname
    // 如果路径以 /Pokedex 开头，说明使用了 basePath
    if (pathname.startsWith('/Pokedex')) {
      return '/Pokedex'
    }
  }
  // 构建时设置的环境变量
  return process.env.NEXT_PUBLIC_BASE_PATH || ''
}

const basePath = getBasePath()
const LIST_FILE_PATH = `${basePath}/data/pokemon-list.json`
const FULL_DATA_FILE_PATH = `${basePath}/data/pokemon-full-data.json`

// 缓存加载的数据
let cachedListData: PokemonListItem[] | null = null
let cachedFullData: StoredPokemonFullData["data"] | null = null

/**
 * 从本地 JSON 文件加载宝可梦列表
 */
export async function loadPokemonListFromFile(): Promise<PokemonListItem[] | null> {
  if (cachedListData) {
    return cachedListData
  }

  try {
    const response = await fetch(LIST_FILE_PATH)
    if (!response.ok) {
      return null
    }

    const data: StoredPokemonData = await response.json()
    
    // 验证数据格式
    if (!data.data || !Array.isArray(data.data)) {
      console.warn("本地数据格式无效")
      return null
    }

    cachedListData = data.data
    console.log(`✅ 从本地文件加载了 ${data.data.length} 个宝可梦数据`)
    return data.data
  } catch (error) {
    console.warn("无法从本地文件加载数据:", error)
    return null
  }
}

/**
 * 从本地 JSON 文件加载完整详情数据
 */
export async function loadPokemonFullDataFromFile(): Promise<Record<number, PokemonWithDetails> | null> {
  if (cachedFullData) {
    return cachedFullData
  }

  try {
    const response = await fetch(FULL_DATA_FILE_PATH)
    if (!response.ok) {
      return null
    }

    const data: StoredPokemonFullData = await response.json()
    
    // 验证数据格式
    if (!data.data || typeof data.data !== "object") {
      console.warn("本地详情数据格式无效")
      return null
    }

    cachedFullData = data.data
    console.log(`✅ 从本地文件加载了 ${Object.keys(data.data).length} 个宝可梦的完整详情数据`)
    return data.data
  } catch (error) {
    console.warn("无法从本地文件加载详情数据:", error)
    return null
  }
}

/**
 * 检查本地数据文件是否存在
 */
export function hasLocalDataFile(): boolean {
  return true // 总是返回 true，让 fetch 来处理错误
}

