# 宝可梦图鉴数据结构和转换指南

本文档定义了前端期望的 JSON 数据结构，以及从 veekun/pokedex 数据源转换的指南。

## 📁 前端文件结构

```
public/
  data/
    pokemon-list.json          # 宝可梦列表（简化信息，用于列表展示）
    pokemon-full-data.json     # 完整宝可梦数据（按 ID 索引的对象）
```

## 📋 数据结构定义

### 1. 宝可梦列表 (`pokemon-list.json`)

用于列表展示和搜索，包含基本信息。

```json
{
  "version": "1.0.0",
  "timestamp": 1764153975547,
  "total": 1025,
  "data": [
    {
      "id": 1,
      "name": "bulbasaur",
      "names": {
        "en": "Bulbasaur",
        "zh": "妙蛙种子",
        "zhHant": "妙蛙種子",
        "ja": "フシギダネ"
      },
      "types": ["grass", "poison"],
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
      "generation": 1
    }
  ]
}
```

**字段说明：**
- `id`: 宝可梦全国图鉴编号（必需）
- `name`: 英文名称（小写，用于 API 查询）
- `names`: 多语言名称映射（必需：en, zh, zhHant, ja）
- `types`: 属性数组（1-2 个属性）
- `sprite`: 默认形态的正面图片 URL
- `generation`: 所属世代（1-9）

---

### 2. 完整宝可梦数据 (`pokemon-full-data.json`)

包含所有详细信息，按 ID 索引。

```json
{
  "version": "1.0.0",
  "timestamp": 1764153975547,
  "data": {
    "1": {
      "id": 1,
      "name": "bulbasaur",
      "names": {
        "en": "Bulbasaur",
        "zh": "妙蛙种子",
        "zhHant": "妙蛙種子",
        "ja": "フシギダネ"
      },
      "types": ["grass", "poison"],
      "abilities": [
        {
          "name": "overgrow",
          "names": {
            "en": "Overgrow",
            "zh": "茂盛",
            "zhHant": "茂盛",
            "ja": "しんりょく"
          },
          "isHidden": false,
          "description": "当HP减少的时候，草属性的招式威力会提高。"
        },
        {
          "name": "chlorophyll",
          "names": {
            "en": "Chlorophyll",
            "zh": "叶绿素",
            "zhHant": "葉綠素",
            "ja": "ようりょくそ"
          },
          "isHidden": true,
          "description": "天气为晴朗时，速度会提高。"
        }
      ],
      "stats": {
        "hp": 45,
        "attack": 49,
        "defense": 49,
        "specialAttack": 65,
        "specialDefense": 65,
        "speed": 45,
        "total": 318
      },
      "sprites": {
        "front": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        "back": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png",
        "frontShiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
        "backShiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/1.png",
        "frontFemale": null,
        "backFemale": null,
        "frontShinyFemale": null,
        "backShinyFemale": null,
        "artwork": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
        "artworkShiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png"
      },
      "species": {
        "captureRate": 45,
        "baseHappiness": 70,
        "genera": "种子宝可梦",
        "habitat": "grassland",
        "generation": 1,
        "growthRate": "medium-slow",
        "genderRate": 1
      },
      "height": 7,
      "weight": 69,
      "forms": [
        {
          "name": "bulbasaur",
          "formName": "default",
          "sprites": {
            "front": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
            "back": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png",
            "frontShiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
            "backShiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/1.png",
            "artwork": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
            "artworkShiny": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1.png"
          },
          "types": ["grass", "poison"]
        }
      ],
      "evolutionChain": [
        {
          "id": 1,
          "name": "bulbasaur",
          "names": {
            "en": "Bulbasaur",
            "zh": "妙蛙种子",
            "zhHant": "妙蛙種子",
            "ja": "フシギダネ"
          },
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
          "evolutionDetails": [],
          "evolvesTo": [
            {
              "id": 2,
              "name": "ivysaur",
              "names": {
                "en": "Ivysaur",
                "zh": "妙蛙草",
                "zhHant": "妙蛙草",
                "ja": "フシギソウ"
              },
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
              "evolutionDetails": [
                {
                  "trigger": "level-up",
                  "minLevel": 16
                }
              ],
              "evolvesTo": [
                {
                  "id": 3,
                  "name": "venusaur",
                  "names": {
                    "en": "Venusaur",
                    "zh": "妙蛙花",
                    "zhHant": "妙蛙花",
                    "ja": "フシギバナ"
                  },
                  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
                  "evolutionDetails": [
                    {
                      "trigger": "level-up",
                      "minLevel": 32
                    }
                  ],
                  "evolvesTo": []
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
```

**字段说明：**

#### 基础信息
- `id`: 全国图鉴编号
- `name`: 英文名称（小写）
- `names`: 多语言名称（必需：en, zh, zhHant, ja）

#### 属性与能力
- `types`: 属性数组（1-2 个）
- `abilities`: 特性数组
  - `name`: 英文名称（小写）
  - `names`: 多语言名称
  - `isHidden`: 是否为隐藏特性
  - `description`: 特性描述（优先中文，其次英文）

#### 种族值
- `stats`: 种族值对象
  - `hp`, `attack`, `defense`, `specialAttack`, `specialDefense`, `speed`: 各项数值
  - `total`: 总和

#### 图片资源
- `sprites`: 精灵图片对象
  - `front`, `back`: 普通形态
  - `frontShiny`, `backShiny`: 闪光形态
  - `frontFemale`, `backFemale`: 雌性形态（可选）
  - `frontShinyFemale`, `backShinyFemale`: 闪光雌性形态（可选）
  - `artwork`: 官方立绘
  - `artworkShiny`: 闪光官方立绘（可选）

#### 物种信息
- `species`: 物种相关数据
  - `captureRate`: 捕获率（0-255）
  - `baseHappiness`: 基础亲密度（0-255）
  - `genera`: 分类描述（如"种子宝可梦"）
  - `habitat`: 栖息地（英文）
  - `generation`: 所属世代
  - `growthRate`: 成长速度（"slow", "medium-slow", "medium", "medium-fast", "fast", "fluctuating"）
  - `genderRate`: 性别比例（-1=无性别, 0=100%雌, 8=100%雄, 1-7=不同比例）

#### 形态信息
- `height`: 身高（分米）
- `weight`: 体重（百克）
- `forms`: 形态数组（至少包含默认形态）
  - `name`: 形态的英文名称
  - `formName`: 形态标识（"default" 表示默认形态）
  - `sprites`: 该形态的图片
  - `types`: 该形态的属性（可能不同）

#### 进化链
- `evolutionChain`: 进化链数组（通常只有一个根节点）
  - `id`, `name`, `names`, `sprite`: 基本信息
  - `evolutionDetails`: 进化条件数组（根节点通常为空）
    - `trigger`: 触发方式（"level-up", "trade", "use-item", "shed" 等）
    - `minLevel`: 最低等级（可选）
    - `item`: 所需道具（可选）
    - `timeOfDay`: 时间要求（"day", "night", ""）（可选）
    - `location`: 地点要求（可选）
    - `otherCondition`: 其他条件（可选）
  - `evolvesTo`: 进化目标数组（递归结构）

---

### 3. 招式数据（动态加载）

招式数据通过 API 动态加载，但也可以预生成。结构如下：

```json
{
  "id": 1,
  "name": "pound",
  "names": {
    "en": "Pound",
    "zh": "拍击",
    "zhHant": "拍擊",
    "ja": "はたく"
  },
  "type": "normal",
  "category": "physical",
  "power": 40,
  "accuracy": 100,
  "pp": 35,
  "description": "用长长的尾巴或手等拍打对手进行攻击。",
  "learnMethod": "level-up",
  "levelLearnedAt": 1,
  "generation": 1
}
```

**字段说明：**
- `id`: 招式 ID
- `name`: 英文名称（小写）
- `names`: 多语言名称
- `type`: 属性
- `category`: 分类（"physical", "special", "status"）
- `power`: 威力（null 表示变化类招式）
- `accuracy`: 命中率（null 表示必中）
- `pp`: PP 值
- `description`: 招式描述（优先中文）
- `learnMethod`: 学习方式（"level-up", "machine", "tutor", "egg"）
- `levelLearnedAt`: 学习等级（仅 level-up 时存在）
- `generation`: 所属世代

**学习方式说明：**
- `level-up`: 升级学习
- `machine`: 学习机/招式记录
- `tutor`: 招式教学
- `egg`: 蛋招式

---

### 4. 出现地点数据（动态加载）

```json
{
  "name": "route-1",
  "names": {
    "en": "Route 1",
    "zh": "1号道路",
    "zhHant": "1號道路",
    "ja": "1番道路"
  },
  "game": "red",
  "generation": 1,
  "encounterMethod": "walk",
  "chance": 20,
  "minLevel": 2,
  "maxLevel": 5
}
```

**字段说明：**
- `name`: 地点英文名称
- `names`: 多语言名称
- `game`: 游戏版本（英文标识）
- `generation`: 所属世代
- `encounterMethod`: 遭遇方式（"walk", "surf", "fish", "headbutt" 等）
- `chance`: 出现概率（百分比）
- `minLevel`, `maxLevel`: 等级范围

---

## 🔄 从 veekun/pokedex 转换指南

### veekun/pokedex 数据库表结构

veekun/pokedex 使用 SQLite 数据库，主要表包括：

- `pokemon`: 宝可梦基础信息
- `pokemon_species`: 物种信息
- `pokemon_species_names`: 物种名称（多语言）
- `pokemon_types`: 属性关联
- `pokemon_stats`: 种族值
- `abilities`: 特性
- `ability_names`: 特性名称（多语言）
- `pokemon_abilities`: 宝可梦-特性关联
- `pokemon_forms`: 形态
- `pokemon_form_names`: 形态名称
- `evolution_chains`: 进化链
- `pokemon_evolution`: 进化关系
- `moves`: 招式
- `move_names`: 招式名称
- `pokemon_moves`: 宝可梦-招式关联
- `locations`: 地点
- `location_names`: 地点名称
- `pokemon_encounters`: 遭遇记录

### 转换步骤

#### 1. 提取宝可梦列表

```sql
-- 从 veekun 数据库提取列表数据
SELECT 
  p.id,
  p.identifier AS name,
  psn.name AS name_zh,
  psn2.name AS name_zhHant,
  psn3.name AS name_ja,
  psn4.name AS name_en,
  ps.generation_id AS generation
FROM pokemon p
JOIN pokemon_species ps ON p.species_id = ps.id
LEFT JOIN pokemon_species_names psn ON ps.id = psn.pokemon_species_id AND psn.local_language_id = 12 -- zh-Hans
LEFT JOIN pokemon_species_names psn2 ON ps.id = psn2.pokemon_species_id AND psn2.local_language_id = 11 -- zh-Hant
LEFT JOIN pokemon_species_names psn3 ON ps.id = psn3.pokemon_species_id AND psn3.local_language_id = 1 -- ja
LEFT JOIN pokemon_species_names psn4 ON ps.id = psn4.pokemon_species_id AND psn4.local_language_id = 9 -- en
ORDER BY p.id;
```

#### 2. 提取属性

```sql
-- 获取每个宝可梦的属性
SELECT 
  pt.pokemon_id,
  t.identifier AS type_name,
  pt.slot
FROM pokemon_types pt
JOIN types t ON pt.type_id = t.id
ORDER BY pt.pokemon_id, pt.slot;
```

#### 3. 提取种族值

```sql
-- 获取种族值
SELECT 
  ps.pokemon_id,
  s.identifier AS stat_name,
  ps.base_stat
FROM pokemon_stats ps
JOIN stats s ON ps.stat_id = s.id
ORDER BY ps.pokemon_id, ps.stat_id;
```

#### 4. 提取特性

```sql
-- 获取特性信息
SELECT 
  pa.pokemon_id,
  a.id AS ability_id,
  a.identifier AS ability_name,
  an.name AS ability_name_zh,
  an2.name AS ability_name_en,
  an3.name AS ability_name_ja,
  pa.is_hidden,
  pa.slot
FROM pokemon_abilities pa
JOIN abilities a ON pa.ability_id = a.id
LEFT JOIN ability_names an ON a.id = an.ability_id AND an.local_language_id = 12
LEFT JOIN ability_names an2 ON a.id = an2.ability_id AND an2.local_language_id = 9
LEFT JOIN ability_names an3 ON a.id = an3.ability_id AND an3.local_language_id = 1
ORDER BY pa.pokemon_id, pa.slot;
```

#### 5. 提取进化链

```sql
-- 获取进化链（需要递归查询）
-- 注意：veekun 的进化链结构可能需要复杂的递归查询
SELECT 
  pe.evolved_species_id,
  pe.evolution_trigger_id,
  pe.minimum_level,
  pe.trigger_item_id,
  pe.time_of_day,
  pe.location_id,
  pe.relative_physical_stats,
  pe.party_species_id,
  pe.party_type_id,
  pe.trade_species_id,
  pe.needs_overworld_rain,
  pe.turn_upside_down
FROM pokemon_evolution pe;
```

#### 6. 提取形态信息

```sql
-- 获取形态
SELECT 
  pf.pokemon_id,
  pf.form_identifier,
  pfn.name AS form_name_zh,
  pfn2.name AS form_name_en
FROM pokemon_forms pf
LEFT JOIN pokemon_form_names pfn ON pf.id = pfn.pokemon_form_id AND pfn.local_language_id = 12
LEFT JOIN pokemon_form_names pfn2 ON pf.id = pfn2.pokemon_form_id AND pfn2.local_language_id = 9
WHERE pf.is_default = 0; -- 非默认形态
```

#### 7. 提取招式数据

```sql
-- 获取招式学习信息
SELECT 
  pm.pokemon_id,
  m.id AS move_id,
  m.identifier AS move_name,
  mn.name AS move_name_zh,
  mn2.name AS move_name_en,
  m.type_id,
  m.damage_class_id,
  m.power,
  m.accuracy,
  m.pp,
  pm.version_group_id,
  pm.level,
  mm.identifier AS method_name
FROM pokemon_moves pm
JOIN moves m ON pm.move_id = m.id
LEFT JOIN move_names mn ON m.id = mn.move_id AND mn.local_language_id = 12
LEFT JOIN move_names mn2 ON m.id = mn2.move_id AND mn2.local_language_id = 9
JOIN move_learn_methods mm ON pm.move_learn_method_id = mm.id
WHERE pm.version_group_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100)
ORDER BY pm.pokemon_id, pm.level, mm.identifier;
```

#### 8. 提取出现地点

```sql
-- 获取出现地点
SELECT 
  pe.pokemon_id,
  l.identifier AS location_name,
  ln.name AS location_name_zh,
  ln2.name AS location_name_en,
  vg.identifier AS version_group,
  em.identifier AS encounter_method,
  pe.min_level,
  pe.max_level,
  pe.chance
FROM pokemon_encounters pe
JOIN locations l ON pe.location_id = l.id
LEFT JOIN location_names ln ON l.id = ln.location_id AND ln.local_language_id = 12
LEFT JOIN location_names ln2 ON l.id = ln2.location_id AND ln2.local_language_id = 9
JOIN version_groups vg ON pe.version_id = vg.id
JOIN encounter_methods em ON pe.encounter_method_id = em.id
ORDER BY pe.pokemon_id, pe.location_id;
```

### 数据转换脚本示例（Python）

```python
import sqlite3
import json
from typing import Dict, List, Any

def convert_veekun_to_pokedex(veekun_db_path: str, output_dir: str):
    """
    从 veekun/pokedex 数据库转换为前端需要的 JSON 格式
    """
    conn = sqlite3.connect(veekun_db_path)
    conn.row_factory = sqlite3.Row
    
    # 1. 生成宝可梦列表
    pokemon_list = []
    cursor = conn.execute("""
        SELECT p.id, p.identifier, ps.generation_id,
               psn.name AS name_zh, psn2.name AS name_zhHant,
               psn3.name AS name_ja, psn4.name AS name_en
        FROM pokemon p
        JOIN pokemon_species ps ON p.species_id = ps.id
        LEFT JOIN pokemon_species_names psn ON ps.id = psn.pokemon_species_id AND psn.local_language_id = 12
        LEFT JOIN pokemon_species_names psn2 ON ps.id = psn2.pokemon_species_id AND psn2.local_language_id = 11
        LEFT JOIN pokemon_species_names psn3 ON ps.id = psn3.pokemon_species_id AND psn3.local_language_id = 1
        LEFT JOIN pokemon_species_names psn4 ON ps.id = psn4.pokemon_species_id AND psn4.local_language_id = 9
        ORDER BY p.id
    """)
    
    for row in cursor:
        # 获取属性
        types_cursor = conn.execute("""
            SELECT t.identifier
            FROM pokemon_types pt
            JOIN types t ON pt.type_id = t.id
            WHERE pt.pokemon_id = ?
            ORDER BY pt.slot
        """, (row['id'],))
        types = [r['identifier'] for r in types_cursor]
        
        pokemon_list.append({
            'id': row['id'],
            'name': row['identifier'],
            'names': {
                'zh': row['name_zh'] or row['name_en'],
                'zhHant': row['name_zhHant'] or row['name_zh'],
                'ja': row['name_ja'] or row['name_en'],
                'en': row['name_en']
            },
            'types': types,
            'sprite': f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{row['id']}.png",
            'generation': row['generation_id']
        })
    
    # 保存列表文件
    with open(f'{output_dir}/pokemon-list.json', 'w', encoding='utf-8') as f:
        json.dump({
            'version': '1.0.0',
            'timestamp': int(__import__('time').time() * 1000),
            'total': len(pokemon_list),
            'data': pokemon_list
        }, f, ensure_ascii=False, indent=2)
    
    # 2. 生成完整数据（需要更复杂的查询）
    # ... 实现完整数据的提取和转换 ...
    
    conn.close()

if __name__ == '__main__':
    convert_veekun_to_pokedex('pokedex.sqlite', 'public/data')
```

---

## 📝 注意事项

1. **多语言支持**：确保所有名称字段都包含 `en`, `zh`, `zhHant`, `ja` 四种语言
2. **图片 URL**：使用 PokeAPI 的 CDN 或自建图片服务
3. **形态处理**：每个宝可梦至少需要一个默认形态，特殊形态（如洛托姆）需要单独处理
4. **进化链递归**：进化链是递归结构，需要正确处理 `evolvesTo` 数组
5. **招式过滤**：按世代过滤招式，确保只显示对应世代的招式
6. **数据完整性**：确保所有必需字段都有值，可选字段可以为 `null` 或省略

---

## 🔗 相关资源

- [veekun/pokedex GitHub](https://github.com/veekun/pokedex)
- [PokeAPI](https://pokeapi.co/)
- [PokeAPI Sprites](https://github.com/PokeAPI/sprites)






