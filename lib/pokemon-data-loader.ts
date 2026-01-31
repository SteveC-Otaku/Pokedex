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
const INDEX_FILE_PATH = `${basePath}/data/pokemon-index.json`
const CHUNKS_DIR = `${basePath}/data/pokemon-chunks`

// 缓存加载的数据
let cachedListData: PokemonListItem[] | null = null
let cachedFullData: StoredPokemonFullData["data"] | null = null
let cachedIndex: { chunks: any[], index: Record<string, { file: string, chunkIndex: number }> } | null = null
let cachedChunks: Map<number, StoredPokemonFullData["data"]> = new Map() // 缓存已加载的chunk

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
 * 加载索引文件
 */
async function loadIndex(): Promise<{ chunks: any[], index: Record<string, { file: string, chunkIndex: number }> } | null> {
  if (cachedIndex) {
    return cachedIndex
  }

  try {
    const response = await fetch(INDEX_FILE_PATH)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (!data.index || !data.chunks) {
      console.warn("索引文件格式无效")
      return null
    }

    cachedIndex = { chunks: data.chunks, index: data.index }
    return cachedIndex
  } catch (error) {
    console.warn("无法加载索引文件:", error)
    return null
  }
}

/**
 * 加载指定的chunk文件
 */
async function loadChunk(chunkIndex: number, fileName: string): Promise<Record<number, PokemonWithDetails> | null> {
  // 检查缓存
  if (cachedChunks.has(chunkIndex)) {
    return cachedChunks.get(chunkIndex)!
  }

  try {
    const response = await fetch(`${CHUNKS_DIR}/${fileName}`)
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    
    if (!data.data || typeof data.data !== "object") {
      console.warn(`Chunk文件格式无效: ${fileName}`)
      return null
    }

    // 转换为数字键
    const chunkData: Record<number, PokemonWithDetails> = {}
    Object.keys(data.data).forEach(key => {
      chunkData[Number.parseInt(key)] = data.data[key]
    })

    // 缓存
    cachedChunks.set(chunkIndex, chunkData)
    console.log(`✅ 加载了chunk文件: ${fileName} (${Object.keys(chunkData).length} 个宝可梦)`)
    return chunkData
  } catch (error) {
    console.warn(`无法加载chunk文件 ${fileName}:`, error)
    return null
  }
}

/**
 * 从本地 JSON 文件加载完整详情数据（支持分模块加载）
 * @param pokemonIds 可选：指定要加载的宝可梦ID数组，如果提供则只加载这些ID的数据
 */
export async function loadPokemonFullDataFromFile(pokemonIds?: number[]): Promise<Record<number, PokemonWithDetails> | null> {
  // 如果指定了ID列表，使用分模块加载
  if (pokemonIds && pokemonIds.length > 0) {
    const index = await loadIndex()
    if (!index) {
      // 回退到完整文件加载
      return loadFullDataFile()
    }

    const result: Record<number, PokemonWithDetails> = {}
    const chunksToLoad = new Set<number>()
    const fileMap = new Map<string, number[]>()

    // 确定需要加载哪些chunk
    for (const id of pokemonIds) {
      const indexEntry = index.index[id.toString()]
      if (indexEntry) {
        chunksToLoad.add(indexEntry.chunkIndex)
        if (!fileMap.has(indexEntry.file)) {
          fileMap.set(indexEntry.file, [])
        }
        fileMap.get(indexEntry.file)!.push(id)
      }
    }

    // 加载需要的chunk
    for (const chunkIndex of chunksToLoad) {
      const chunkFile = index.chunks[chunkIndex]
      if (chunkFile) {
        const chunkData = await loadChunk(chunkIndex, chunkFile.file)
        if (chunkData) {
          // 只提取需要的ID
          const fileIds = fileMap.get(chunkFile.file) || []
          fileIds.forEach(id => {
            if (chunkData[id]) {
              result[id] = chunkData[id]
            }
          })
        }
      }
    }

    if (Object.keys(result).length > 0) {
      console.log(`✅ 从分模块文件加载了 ${Object.keys(result).length} 个宝可梦的完整详情数据`)
      return result
    }
  }

  // 如果没有指定ID或分模块加载失败，尝试加载完整文件
  return loadFullDataFile()
}

/**
 * 加载完整数据文件（向后兼容）
 */
async function loadFullDataFile(): Promise<Record<number, PokemonWithDetails> | null> {
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

    // 转换为数字键
    const fullData: Record<number, PokemonWithDetails> = {}
    Object.keys(data.data).forEach(key => {
      fullData[Number.parseInt(key)] = data.data[key]
    })

    cachedFullData = fullData
    console.log(`✅ 从完整文件加载了 ${Object.keys(fullData).length} 个宝可梦的完整详情数据`)
    return fullData
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

