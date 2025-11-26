export interface Pokemon {
  id: number
  name: string
  names: { [lang: string]: string }
  types: string[]
  abilities: Ability[]
  stats: Stats
  sprites: Sprites
  species: Species
  height: number
  weight: number
  forms: PokemonForm[]
}

export interface Ability {
  name: string
  names: { [lang: string]: string }
  isHidden: boolean
  description: string
}

export interface Stats {
  hp: number
  attack: number
  defense: number
  specialAttack: number
  specialDefense: number
  speed: number
  total: number
}

export interface Sprites {
  front: string
  back: string
  frontShiny: string
  backShiny: string
  frontFemale?: string
  backFemale?: string
  frontShinyFemale?: string
  backShinyFemale?: string
  artwork: string
  artworkShiny?: string
}

export interface Species {
  captureRate: number
  baseHappiness: number
  evolutionChain: EvolutionNode[]
  genera: string
  habitat: string
  generation: number
  growthRate: string
  genderRate: number
}

export interface EvolutionNode {
  id: number
  name: string
  names: { [lang: string]: string }
  sprite: string
  evolutionDetails?: EvolutionDetail[]
  evolvesTo: EvolutionNode[]
}

export interface EvolutionDetail {
  trigger: string
  minLevel?: number
  item?: string
  timeOfDay?: string
  location?: string
  otherCondition?: string
}

export interface PokemonForm {
  name: string
  formName: string
  sprites: Sprites
  types: string[]
}

export interface Move {
  id: number
  name: string
  names: { [lang: string]: string }
  type: string
  category: "physical" | "special" | "status"
  power: number | null
  accuracy: number | null
  pp: number
  description: string
  learnMethod: string
  levelLearnedAt?: number
  generation: number
}

export interface Location {
  name: string
  names: { [lang: string]: string }
  game: string
  generation: number
  encounterMethod: string
  chance: number
  minLevel: number
  maxLevel: number
}

export interface PokemonListItem {
  id: number
  name: string
  names: { [lang: string]: string }
  types: string[]
  sprite: string
  generation: number
}

export interface Generation {
  id: number
  name: string
  names: { [lang: string]: string }
  region: string
  pokemonRange: [number, number]
  games: string[]
}

export interface TypeEffectiveness {
  attacking: { [type: string]: number }
  defending: { [type: string]: number }
}

export interface CatchRateResult {
  ballName: string
  ballNameZh: string
  rate: number
  probability: number
  modifier: number
  spriteUrl?: string
}

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const

export const TYPE_NAMES_ZH: { [key: string]: string } = {
  normal: "一般",
  fire: "火",
  water: "水",
  electric: "电",
  grass: "草",
  ice: "冰",
  fighting: "格斗",
  poison: "毒",
  ground: "地面",
  flying: "飞行",
  psychic: "超能力",
  bug: "虫",
  rock: "岩石",
  ghost: "幽灵",
  dragon: "龙",
  dark: "恶",
  steel: "钢",
  fairy: "妖精",
}

export const TYPE_NAMES_EN: { [key: string]: string } = {
  normal: "Normal",
  fire: "Fire",
  water: "Water",
  electric: "Electric",
  grass: "Grass",
  ice: "Ice",
  fighting: "Fighting",
  poison: "Poison",
  ground: "Ground",
  flying: "Flying",
  psychic: "Psychic",
  bug: "Bug",
  rock: "Rock",
  ghost: "Ghost",
  dragon: "Dragon",
  dark: "Dark",
  steel: "Steel",
  fairy: "Fairy",
}

export const TYPE_NAMES_JA: { [key: string]: string } = {
  normal: "ノーマル",
  fire: "ほのお",
  water: "みず",
  electric: "でんき",
  grass: "くさ",
  ice: "こおり",
  fighting: "かくとう",
  poison: "どく",
  ground: "じめん",
  flying: "ひこう",
  psychic: "エスパー",
  bug: "むし",
  rock: "いわ",
  ghost: "ゴースト",
  dragon: "ドラゴン",
  dark: "あく",
  steel: "はがね",
  fairy: "フェアリー",
}

export function getTypeName(type: string, language: "zh" | "en" | "ja" = "zh"): string {
  if (language === "en") {
    return TYPE_NAMES_EN[type] || type
  }
  if (language === "ja") {
    return TYPE_NAMES_JA[type] || type
  }
  return TYPE_NAMES_ZH[type] || type
}

export const GENERATIONS: Generation[] = [
  {
    id: 1,
    name: "generation-i",
    names: { en: "Generation I", zh: "第一世代" },
    region: "kanto",
    pokemonRange: [1, 151],
    games: ["red", "blue", "yellow"],
  },
  {
    id: 2,
    name: "generation-ii",
    names: { en: "Generation II", zh: "第二世代" },
    region: "johto",
    pokemonRange: [152, 251],
    games: ["gold", "silver", "crystal"],
  },
  {
    id: 3,
    name: "generation-iii",
    names: { en: "Generation III", zh: "第三世代" },
    region: "hoenn",
    pokemonRange: [252, 386],
    games: ["ruby", "sapphire", "emerald"],
  },
  {
    id: 4,
    name: "generation-iv",
    names: { en: "Generation IV", zh: "第四世代" },
    region: "sinnoh",
    pokemonRange: [387, 493],
    games: ["diamond", "pearl", "platinum"],
  },
  {
    id: 5,
    name: "generation-v",
    names: { en: "Generation V", zh: "第五世代" },
    region: "unova",
    pokemonRange: [494, 649],
    games: ["black", "white", "black-2", "white-2"],
  },
  {
    id: 6,
    name: "generation-vi",
    names: { en: "Generation VI", zh: "第六世代" },
    region: "kalos",
    pokemonRange: [650, 721],
    games: ["x", "y"],
  },
  {
    id: 7,
    name: "generation-vii",
    names: { en: "Generation VII", zh: "第七世代" },
    region: "alola",
    pokemonRange: [722, 809],
    games: ["sun", "moon", "ultra-sun", "ultra-moon"],
  },
  {
    id: 8,
    name: "generation-viii",
    names: { en: "Generation VIII", zh: "第八世代" },
    region: "galar",
    pokemonRange: [810, 905],
    games: ["sword", "shield"],
  },
  {
    id: 9,
    name: "generation-ix",
    names: { en: "Generation IX", zh: "第九世代" },
    region: "paldea",
    pokemonRange: [906, 1025],
    games: ["scarlet", "violet"],
  },
]

export const REGION_NAMES_ZH: { [key: string]: string } = {
  kanto: "关都",
  johto: "城都",
  hoenn: "丰缘",
  sinnoh: "神奥",
  unova: "合众",
  kalos: "卡洛斯",
  alola: "阿罗拉",
  galar: "伽勒尔",
  paldea: "帕底亚",
}
