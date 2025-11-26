import type { CatchRateResult, TypeEffectiveness } from "./pokemon-types"

// Type effectiveness chart
const TYPE_CHART: { [attacker: string]: { [defender: string]: number } } = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

export function getTypeEffectiveness(types: string[]): TypeEffectiveness {
  const attacking: { [type: string]: number } = {}
  const defending: { [type: string]: number } = {}

  const allTypes = Object.keys(TYPE_CHART)

  // Calculate attacking effectiveness (best multiplier for each defending type)
  for (const defType of allTypes) {
    let bestMultiplier = 1
    for (const atkType of types) {
      const multiplier = TYPE_CHART[atkType]?.[defType] ?? 1
      if (multiplier > bestMultiplier) bestMultiplier = multiplier
    }
    if (bestMultiplier !== 1) attacking[defType] = bestMultiplier
  }

  // Calculate defending effectiveness (combined multiplier from all attacking types)
  for (const atkType of allTypes) {
    let multiplier = 1
    for (const defType of types) {
      multiplier *= TYPE_CHART[atkType]?.[defType] ?? 1
    }
    if (multiplier !== 1) defending[atkType] = multiplier
  }

  return { attacking, defending }
}

// HP calculation formula
export function calculateHP(
  baseHP: number,
  level: number,
  iv = 15, // Default to average IV
  ev = 0,
): number {
  return Math.floor(((2 * baseHP + iv + ev / 4) * level) / 100) + level + 10
}

// Pokéball modifiers
const POKEBALL_MODIFIERS: {
  name: string
  nameZh: string
  baseModifier: number
  spriteUrl?: string
  conditions?: {
    name: string
    nameZh: string
    modifier: number
    type: "checkbox" | "radio"
    group?: string
  }[]
}[] = [
  { name: "Poké Ball", nameZh: "精灵球", baseModifier: 1, spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" },
  { name: "Great Ball", nameZh: "超级球", baseModifier: 1.5, spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png" },
  { name: "Ultra Ball", nameZh: "高级球", baseModifier: 2, spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" },
  {
    name: "Net Ball",
    nameZh: "网球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/net-ball.png",
    conditions: [{ name: "Water/Bug type", nameZh: "水/虫属性", modifier: 3.5, type: "checkbox" }],
  },
  {
    name: "Nest Ball",
    nameZh: "巢穴球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nest-ball.png",
    conditions: [{ name: "Low level (≤30)", nameZh: "低等级(≤30)", modifier: 3, type: "checkbox" }],
  },
  {
    name: "Repeat Ball",
    nameZh: "重复球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/repeat-ball.png",
    conditions: [{ name: "Already caught", nameZh: "已捕获过", modifier: 3.5, type: "checkbox" }],
  },
  {
    name: "Timer Ball",
    nameZh: "计时球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/timer-ball.png",
    conditions: [{ name: "10+ turns", nameZh: "10回合以上", modifier: 4, type: "checkbox" }],
  },
  {
    name: "Dusk Ball",
    nameZh: "黑暗球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dusk-ball.png",
    conditions: [{ name: "Night/Cave", nameZh: "夜晚/洞穴", modifier: 3, type: "checkbox" }],
  },
  {
    name: "Quick Ball",
    nameZh: "先机球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png",
    conditions: [{ name: "First turn", nameZh: "第一回合", modifier: 5, type: "checkbox" }],
  },
  {
    name: "Dive Ball",
    nameZh: "潜水球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dive-ball.png",
    conditions: [{ name: "Surfing/Fishing", nameZh: "冲浪/钓鱼", modifier: 3.5, type: "checkbox" }],
  },
  {
    name: "Luxury Ball",
    nameZh: "豪华球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/luxury-ball.png",
  },
  {
    name: "Premier Ball",
    nameZh: "纪念球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/premier-ball.png",
  },
  {
    name: "Heal Ball",
    nameZh: "治愈球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heal-ball.png",
  },
  {
    name: "Level Ball",
    nameZh: "等级球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/level-ball.png",
    conditions: [{ name: "Your Pokémon 4x+ higher level", nameZh: "己方等级4倍以上", modifier: 8, type: "checkbox" }],
  },
  {
    name: "Love Ball",
    nameZh: "甜蜜球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/love-ball.png",
    conditions: [{ name: "Same species, opposite gender", nameZh: "同种异性", modifier: 8, type: "checkbox" }],
  },
  {
    name: "Moon Ball",
    nameZh: "月亮球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/moon-ball.png",
    conditions: [{ name: "Moon Stone evolution", nameZh: "月之石进化", modifier: 4, type: "checkbox" }],
  },
  {
    name: "Heavy Ball",
    nameZh: "沉重球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/heavy-ball.png",
    conditions: [{ name: "Heavy Pokémon (≥300kg)", nameZh: "重型宝可梦(≥300kg)", modifier: 30, type: "checkbox" }],
  },
  {
    name: "Fast Ball",
    nameZh: "速度球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fast-ball.png",
    conditions: [{ name: "Speed ≥100", nameZh: "速度≥100", modifier: 4, type: "checkbox" }],
  },
  {
    name: "Friend Ball",
    nameZh: "友友球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/friend-ball.png",
  },
  {
    name: "Lure Ball",
    nameZh: "诱饵球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/lure-ball.png",
    conditions: [{ name: "Fishing", nameZh: "钓鱼", modifier: 4, type: "checkbox" }],
  },
  {
    name: "Dream Ball",
    nameZh: "梦境球",
    baseModifier: 1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dream-ball.png",
    conditions: [{ name: "Sleeping Pokémon", nameZh: "睡眠中", modifier: 4, type: "checkbox" }],
  },
  {
    name: "Beast Ball",
    nameZh: "究极球",
    baseModifier: 0.1,
    spriteUrl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/beast-ball.png",
    conditions: [{ name: "Ultra Beast", nameZh: "究极异兽", modifier: 5, type: "checkbox" }],
  },
]

// Status condition modifiers
const STATUS_MODIFIERS: {
  name: string
  nameZh: string
  modifier: number
  color: string
}[] = [
  { name: "None", nameZh: "无", modifier: 1, color: "bg-muted" },
  { name: "Burn", nameZh: "灼伤", modifier: 1.5, color: "bg-red-500" },
  { name: "Freeze", nameZh: "冰冻", modifier: 2.5, color: "bg-cyan-300" },
  { name: "Paralysis", nameZh: "麻痹", modifier: 1.5, color: "bg-yellow-400" },
  { name: "Poison", nameZh: "中毒", modifier: 1.5, color: "bg-purple-500" },
  { name: "Sleep", nameZh: "睡眠", modifier: 2.5, color: "bg-blue-400" },
]

export function getPokeballModifiers() {
  return POKEBALL_MODIFIERS
}

export function getStatusModifiers() {
  return STATUS_MODIFIERS
}

// Catch rate calculation
// Formula: catchRate = (((3 * maxHP - 2 * currentHP) * captureRate * ballModifier) / (3 * maxHP)) * statusModifier
export function calculateCatchRate(
  captureRate: number,
  maxHP: number,
  currentHP: number,
  ballModifier: number,
  statusModifier: number,
): number {
  const a = (((3 * maxHP - 2 * currentHP) * captureRate * ballModifier) / (3 * maxHP)) * statusModifier

  // Calculate probability
  if (a >= 255) return 1

  const b = 65536 / Math.pow(255 / a, 0.1875)
  const probability = Math.pow(b / 65536, 4)

  return Math.min(1, probability)
}

export function calculateAllCatchRates(
  captureRate: number,
  maxHP: number,
  currentHP: number,
  statusModifier: number,
  activeConditions: { [ballName: string]: boolean },
): CatchRateResult[] {
  return POKEBALL_MODIFIERS
    .filter((ball) => ball.name !== "Master Ball") // 排除大师球
    .map((ball) => {
      let modifier = ball.baseModifier

      // Apply active conditions
      if (ball.conditions) {
        for (const cond of ball.conditions) {
          const condKey = `${ball.name}-${cond.name}`
          if (activeConditions[condKey]) {
            modifier = cond.modifier
          }
        }
      }

      const probability = calculateCatchRate(captureRate, maxHP, currentHP, modifier, statusModifier)

      return {
        ballName: ball.name,
        ballNameZh: ball.nameZh,
        rate: captureRate,
        probability,
        modifier,
        spriteUrl: ball.spriteUrl,
      }
    })
    .sort((a, b) => b.probability - a.probability)
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}
