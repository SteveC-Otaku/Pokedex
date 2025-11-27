/**
 * 宝可梦形态名称翻译
 */
export const FORM_NAMES: { [key: string]: { zh: string; en: string; ja: string } } = {
  // 洛托姆形态
  "heat": { zh: "加热", en: "Heat", ja: "ヒート" },
  "wash": { zh: "清洗", en: "Wash", ja: "ウォッシュ" },
  "frost": { zh: "结冰", en: "Frost", ja: "フロスト" },
  "fan": { zh: "旋转", en: "Fan", ja: "スピン" },
  "mow": { zh: "切割", en: "Mow", ja: "カット" },
  
  // 超极巨化
  "gmax": { zh: "超极巨化", en: "Gigantamax", ja: "キョダイマックス" },
  "gigantamax": { zh: "超极巨化", en: "Gigantamax", ja: "キョダイマックス" },
  
  // 其他常见形态
  "alola": { zh: "阿罗拉", en: "Alola", ja: "アローラ" },
  "galar": { zh: "伽勒尔", en: "Galar", ja: "ガラル" },
  "hisui": { zh: "洗翠", en: "Hisui", ja: "ヒスイ" },
  "paldea": { zh: "帕底亚", en: "Paldea", ja: "パルデア" },
  "mega": { zh: "超级进化", en: "Mega", ja: "メガ" },
  "mega-x": { zh: "超级进化X", en: "Mega X", ja: "メガX" },
  "mega-y": { zh: "超级进化Y", en: "Mega Y", ja: "メガY" },
  "primal": { zh: "原始回归", en: "Primal", ja: "ゲンシカイキ" },
  "eternal": { zh: "永恒", en: "Eternal", ja: "エターナル" },
  "origin": { zh: "起源", en: "Origin", ja: "オリジン" },
  "sky": { zh: "天空", en: "Sky", ja: "スカイ" },
  "land": { zh: "陆地", en: "Land", ja: "ランド" },
  "sunny": { zh: "晴天", en: "Sunny", ja: "サニー" },
  "rainy": { zh: "雨天", en: "Rainy", ja: "レイニー" },
  "snowy": { zh: "雪天", en: "Snowy", ja: "スノー" },
  "baile": { zh: "热辣热辣", en: "Baile", ja: "メラメラ" },
  "pom-pom": { zh: "啪滋啪滋", en: "Pom-Pom", ja: "パチパチ" },
  "pa'u": { zh: "呼拉呼拉", en: "Pa'u", ja: "フラフラ" },
  "sensu": { zh: "轻盈轻盈", en: "Sensu", ja: "ヒラヒラ" },
  "red-striped": { zh: "红色条纹", en: "Red-Striped", ja: "あかしま" },
  "blue-striped": { zh: "蓝色条纹", en: "Blue-Striped", ja: "あおしま" },
  "east": { zh: "东", en: "East", ja: "東" },
  "west": { zh: "西", en: "West", ja: "西" },
  "plant": { zh: "植物", en: "Plant", ja: "プラント" },
  "sandy": { zh: "沙地", en: "Sandy", ja: "サンデー" },
  "trash": { zh: "垃圾", en: "Trash", ja: "ダスト" },
  "overcast": { zh: "阴云", en: "Overcast", ja: "オーバーキャスト" },
  "sunshine": { zh: "阳光", en: "Sunshine", ja: "サンシャイン" },
  "dusk": { zh: "黄昏", en: "Dusk", ja: "たそがれ" },
  "dawn": { zh: "黎明", en: "Dawn", ja: "あかつき" },
  "midday": { zh: "正午", en: "Midday", ja: "まひる" },
  "midnight": { zh: "午夜", en: "Midnight", ja: "まよなか" },
  "pharaoh": { zh: "法老", en: "Pharaoh", ja: "ファラオ" },
  "dada": { zh: "达达", en: "Dada", ja: "ダダ" },
  "amped": { zh: "高调", en: "Amped", ja: "ハイテンション" },
  "low-key": { zh: "低调", en: "Low-Key", ja: "マイペース" },
  "ice": { zh: "冰", en: "Ice", ja: "アイス" },
  "electric": { zh: "电", en: "Electric", ja: "でんき" },
  "fire": { zh: "火", en: "Fire", ja: "ほのお" },
  "water": { zh: "水", en: "Water", ja: "みず" },
  "grass": { zh: "草", en: "Grass", ja: "くさ" },
  "fighting": { zh: "格斗", en: "Fighting", ja: "かくとう" },
  "psychic": { zh: "超能力", en: "Psychic", ja: "エスパー" },
  "dark": { zh: "恶", en: "Dark", ja: "あく" },
  "steel": { zh: "钢", en: "Steel", ja: "はがね" },
  "fairy": { zh: "妖精", en: "Fairy", ja: "フェアリー" },
  "dragon": { zh: "龙", en: "Dragon", ja: "ドラゴン" },
  "ghost": { zh: "幽灵", en: "Ghost", ja: "ゴースト" },
  "rock": { zh: "岩石", en: "Rock", ja: "いわ" },
  "ground": { zh: "地面", en: "Ground", ja: "じめん" },
  "flying": { zh: "飞行", en: "Flying", ja: "ひこう" },
  "bug": { zh: "虫", en: "Bug", ja: "むし" },
  "poison": { zh: "毒", en: "Poison", ja: "どく" },
  "normal": { zh: "一般", en: "Normal", ja: "ノーマル" },
}

/**
 * 获取形态名称的翻译
 */
export function getFormName(formName: string, language: "zh" | "en" | "ja" = "zh"): string {
  // 转换为小写并处理常见格式
  const normalized = formName.toLowerCase().replace(/-/g, "-")
  
  // 直接匹配
  if (FORM_NAMES[normalized]) {
    return FORM_NAMES[normalized][language] || FORM_NAMES[normalized].zh || formName
  }
  
  // 尝试匹配部分（如 "rotom-heat" -> "heat"）
  const parts = normalized.split("-")
  for (const part of parts) {
    if (FORM_NAMES[part]) {
      return FORM_NAMES[part][language] || FORM_NAMES[part].zh || formName
    }
  }
  
  // 如果包含 gmax 或 gigantamax
  if (normalized.includes("gmax") || normalized.includes("gigantamax")) {
    return FORM_NAMES["gmax"][language] || FORM_NAMES["gmax"].zh
  }
  
  // 默认返回原始名称（首字母大写）
  return formName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

