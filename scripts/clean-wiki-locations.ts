/**
 * 清理从Wiki获取的第8、9世代宝可梦出现地点数据
 */

import * as fs from "fs"
import * as path from "path"

const OUTPUT_DIR = path.join(process.cwd(), "public", "data")
const LIST_FILE = path.join(OUTPUT_DIR, "pokemon-list.json")
const FULL_DATA_FILE = path.join(OUTPUT_DIR, "pokemon-full-data.json")

async function cleanWikiLocations() {
  console.log("🧹 开始清理第8、9世代宝可梦的出现地点数据...\n")

  if (!fs.existsSync(LIST_FILE)) {
    console.error("❌ 错误：找不到 pokemon-list.json 文件")
    process.exit(1)
  }

  if (!fs.existsSync(FULL_DATA_FILE)) {
    console.error("❌ 错误：找不到 pokemon-full-data.json 文件")
    process.exit(1)
  }

  // 读取宝可梦列表
  console.log("📂 正在读取宝可梦列表...")
  const listContent = fs.readFileSync(LIST_FILE, "utf-8")
  const listData = JSON.parse(listContent)

  // 读取完整数据
  console.log("📂 正在读取完整数据文件...")
  const fullDataContent = fs.readFileSync(FULL_DATA_FILE, "utf-8")
  const fullData = JSON.parse(fullDataContent)

  if (!fullData.data || typeof fullData.data !== "object") {
    console.error("❌ 错误：数据文件格式无效")
    process.exit(1)
  }

  // 找出第8和第9世代的宝可梦ID
  const gen8And9Ids = listData.data
    .filter((p: any) => p.generation === 8 || p.generation === 9)
    .map((p: any) => p.id)

  console.log(`📊 找到 ${gen8And9Ids.length} 个第8/9世代的宝可梦`)
  console.log(`⏳ 开始清理数据...\n`)

  let cleanedCount = 0
  let notFoundCount = 0

  for (const id of gen8And9Ids) {
    if (fullData.data[id]) {
      // 清空出现地点数据
      fullData.data[id].locations = []
      // 标记为未检查，以便以后重新获取
      fullData.data[id].locationsChecked = false
      cleanedCount++
      
      const pokemon = listData.data.find((p: any) => p.id === id)
      const name = pokemon?.names?.zh || pokemon?.name || `#${id}`
      process.stdout.write(`✓ #${id} ${name}: 已清理出现地点数据\n`)
    } else {
      notFoundCount++
      process.stdout.write(`- #${id}: 不在完整数据中\n`)
    }
  }

  // 保存数据
  console.log(`\n💾 正在保存数据...`)
  fullData.timestamp = Date.now()
  fs.writeFileSync(FULL_DATA_FILE, JSON.stringify(fullData), "utf-8")

  console.log(`\n✅ 完成！`)
  console.log(`📁 数据已保存到: ${FULL_DATA_FILE}`)
  console.log(`🧹 已清理: ${cleanedCount} 个宝可梦的出现地点数据`)
  console.log(`❌ 未找到: ${notFoundCount} 个宝可梦`)
  console.log(`💾 文件大小: ${(fs.statSync(FULL_DATA_FILE).size / 1024 / 1024).toFixed(2)} MB`)
}

// 运行脚本
cleanWikiLocations().catch((error) => {
  console.error("❌ 清理数据时出错:", error)
  process.exit(1)
})


