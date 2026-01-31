/**
 * 宝可梦形态本地图片映射
 * 如果本地有图片，优先使用本地图片而不是API图片
 */

// 形态名称到本地图片路径的映射
// 格式: "pokemon-form-name" -> "/Pokemons/图片文件名.webp"
export const FORM_IMAGE_MAP: { [formName: string]: string } = {
  // 武道熊师形态
  "urshifu-rapid-strike": "/Pokemons/武道熊师（连击流）.webp",
  "rapid-strike": "/Pokemons/武道熊师（连击流）.webp",
  
  // 爱管侍形态
  "indeedee-female": "/Pokemons/爱管侍（雌性）.webp",
  "female": "/Pokemons/爱管侍（雌性）.webp",
  
  // 洛托姆形态
  "rotom-heat": "/Pokemons/加热洛托姆.webp",
  "heat": "/Pokemons/加热洛托姆.webp",
  "rotom-wash": "/Pokemons/清洗洛托姆.webp",
  "wash": "/Pokemons/清洗洛托姆.webp",
  "rotom-frost": "/Pokemons/结冰洛托姆.webp",
  "frost": "/Pokemons/结冰洛托姆.webp",
  "rotom-fan": "/Pokemons/旋转洛托姆.webp",
  "fan": "/Pokemons/旋转洛托姆.webp",
  "rotom-mow": "/Pokemons/切割洛托姆.webp",
  "mow": "/Pokemons/切割洛托姆.webp",
  
  // 注意：一击流（single-strike）和雄性（male）是默认形态，使用默认图片
}

/**
 * 获取形态的本地图片路径
 * @param pokemonName 宝可梦名称（如 "urshifu", "indeedee"）
 * @param formName 形态名称（如 "rapid-strike", "female"）
 * @returns 本地图片路径，如果没有则返回 null
 */
export function getFormImagePath(pokemonName: string, formName: string): string | null {
  // 尝试完整名称匹配（如 "urshifu-rapid-strike"）
  const fullName = `${pokemonName}-${formName}`
  if (FORM_IMAGE_MAP[fullName]) {
    return FORM_IMAGE_MAP[fullName]
  }
  
  // 尝试只使用形态名称（如 "rapid-strike"）
  if (FORM_IMAGE_MAP[formName]) {
    return FORM_IMAGE_MAP[formName]
  }
  
  return null
}

