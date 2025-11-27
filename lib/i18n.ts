export type Language = "zh" | "en" | "ja"

export interface Translations {
  // Common
  loading: string
  select: string
  clear: string
  close: string
  all: string
  
  // Header
  pokedex: string
  selectGeneration: string
  allGenerations: string
  
  // Search
  searchPlaceholder: string
  noResults: string
  
  // Filters
  filter: string
  type: string
  region: string
  selectType: string
  selectRegion: string
  
  // Sort
  sort: string
  sortById: string
  sortByName: string
  sortOrder: string
  ascending: string
  descending: string
  
  // Pokemon Grid
  noPokemonFound: string
  
  // Pokemon Detail
  height: string
  weight: string
  captureRate: string
  generation: string
  stats: string
  abilities: string
  evolution: string
  typeEffectiveness: string
  moves: string
  locations: string
  attackEffectiveness: string
  defenseEffectiveness: string
  weaknesses: string
  resistances: string
  immunities: string
  levelUpMoves: string
  tmMoves: string
  moreMoves: string
  noLocations: string
  noWildLocations: string
  locationsNotLoaded: string
  locationStats: string
  withLocations: string
  notChecked: string
  allForms: string
  normal: string
  shiny: string
  female: string
  shinyFemale: string
  showShiny: string
  showNormal: string
  hiddenAbility: string
  
  // Catch Calculator
  catchCalculator: string
  selectPokemonFirst: string
  baseCaptureRate: string
  level: string
  currentHP: string
  max: string
  statusCondition: string
  none: string
  sleep: string
  freeze: string
  paralysis: string
  burn: string
  poison: string
  pokeball: string
  catchRate: string
  probability: string
  
  // Stats
  hp: string
  attack: string
  defense: string
  specialAttack: string
  specialDefense: string
  speed: string
  total: string
  
  // Data Management
  dataManagement: string
  clearCache: string
  refreshData: string
  exportJSON: string
  exportCSV: string
  storedDataAvailable: string
  
  // Favorites
  favorites: string
  addToFavorites: string
  removeFromFavorites: string
  
  // Compare
  compare: string
  selectPokemonToCompare: string
  selectSecondPokemon: string
  clearComparison: string
  
  // Team Builder
  teamBuilder: string
  addToTeam: string
  removeFromTeam: string
  teamCoverage: string
  offensiveCoverage: string
  defensiveCoverage: string
  selectMoves: string
  teamSlot: string
  empty: string
  typeCoverage: string
  superEffective: string
  notVeryEffective: string
  noEffect: string
  ability: string
  selectAbility: string
  effortValues: string
  totalEVs: string
  remainingEVs: string
  form: string
  selectForm: string
  defaultForm: string
  saveTeam: string
  loadTeam: string
  deleteTeam: string
  teamName: string
  enterTeamName: string
  savedTeams: string
  noSavedTeams: string
  confirmDeleteTeam: string
  teamSaved: string
  teamLoaded: string
  teamDeleted: string
  renameTeam: string
}

export const translations: Record<Language, Translations> = {
  zh: {
    loading: "加载中...",
    select: "选择",
    clear: "清除",
    close: "关闭",
    all: "全部",
    pokedex: "Pokédex 图鉴",
    selectGeneration: "选择世代",
    allGenerations: "全部世代",
    searchPlaceholder: "搜索宝可梦...",
    noResults: "没有结果",
    filter: "筛选",
    type: "属性",
    region: "地区",
    selectType: "选择属性",
    selectRegion: "选择地区",
    sort: "排序",
    sortById: "按编号",
    sortByName: "按名称",
    sortOrder: "排序方向",
    ascending: "升序",
    descending: "降序",
    noPokemonFound: "没有找到符合条件的宝可梦",
    height: "身高",
    weight: "体重",
    captureRate: "捕获率",
    generation: "世代",
    stats: "种族值",
    abilities: "特性",
    evolution: "进化",
    typeEffectiveness: "属性克制",
    moves: "招式",
    locations: "出现地点",
    attackEffectiveness: "攻击时效果加成",
    defenseEffectiveness: "防御时受到伤害",
    weaknesses: "弱点",
    resistances: "抵抗",
    immunities: "免疫",
    levelUpMoves: "升级习得",
    tmMoves: "技能机习得",
    moreMoves: "还有 {count} 个招式...",
    noLocations: "该宝可梦在选择的世代中没有野外出现地点",
    noWildLocations: "该宝可梦在野外无出现地点",
    locationsNotLoaded: "出现地点数据未加载",
    locationStats: "出现地点统计",
    withLocations: "有出现地点",
    notChecked: "未检查",
    allForms: "所有形态",
    normal: "普通",
    shiny: "闪光",
    female: "雌性",
    shinyFemale: "闪光雌性",
    showShiny: "显示闪光",
    showNormal: "显示普通",
    hiddenAbility: "隐藏特性",
    catchCalculator: "捕获率计算器",
    selectPokemonFirst: "请先选择一个宝可梦",
    baseCaptureRate: "基础捕获率",
    level: "等级",
    currentHP: "当前HP",
    max: "最大",
    statusCondition: "异常状态",
    none: "无",
    sleep: "睡眠",
    freeze: "冰冻",
    paralysis: "麻痹",
    burn: "灼伤",
    poison: "中毒",
    pokeball: "精灵球",
    catchRate: "捕获率",
    probability: "成功率",
    hp: "HP",
    attack: "攻击",
    defense: "防御",
    specialAttack: "特攻",
    specialDefense: "特防",
    speed: "速度",
    total: "总计",
    dataManagement: "数据管理",
    clearCache: "清除缓存",
    refreshData: "刷新数据",
    exportJSON: "导出为 JSON",
    exportCSV: "导出为 CSV",
    storedDataAvailable: "本地数据可用",
    favorites: "收藏",
    addToFavorites: "添加到收藏",
    removeFromFavorites: "取消收藏",
    compare: "对比",
    selectPokemonToCompare: "选择要对比的宝可梦",
    selectSecondPokemon: "选择第二只宝可梦",
    clearComparison: "清除对比",
    teamBuilder: "队伍构建器",
    addToTeam: "添加到队伍",
    removeFromTeam: "从队伍移除",
    teamCoverage: "队伍覆盖",
    offensiveCoverage: "打击面",
    defensiveCoverage: "属性覆盖",
    selectMoves: "选择招式",
    teamSlot: "队伍位置",
    empty: "空",
    typeCoverage: "属性覆盖",
    superEffective: "效果绝佳",
    notVeryEffective: "效果不好",
    noEffect: "无效",
    ability: "特性",
    selectAbility: "选择特性",
    effortValues: "努力值",
    totalEVs: "总努力值",
    remainingEVs: "剩余",
    form: "形态",
    selectForm: "选择形态",
    defaultForm: "默认形态",
    saveTeam: "保存队伍",
    loadTeam: "加载队伍",
    deleteTeam: "删除队伍",
    teamName: "队伍名称",
    enterTeamName: "输入队伍名称",
    savedTeams: "已保存的队伍",
    noSavedTeams: "暂无保存的队伍",
    confirmDeleteTeam: "确定要删除这个队伍吗？",
    teamSaved: "队伍已保存",
    teamLoaded: "队伍已加载",
    teamDeleted: "队伍已删除",
    renameTeam: "重命名队伍",
  },
  en: {
    loading: "Loading...",
    select: "Select",
    clear: "Clear",
    close: "Close",
    all: "All",
    pokedex: "Pokédex",
    selectGeneration: "Select Generation",
    allGenerations: "All Generations",
    searchPlaceholder: "Search Pokémon...",
    noResults: "No results",
    filter: "Filter",
    type: "Type",
    region: "Region",
    selectType: "Select Type",
    selectRegion: "Select Region",
    sort: "Sort",
    sortById: "By ID",
    sortByName: "By Name",
    sortOrder: "Sort Order",
    ascending: "Ascending",
    descending: "Descending",
    noPokemonFound: "No Pokémon found",
    height: "Height",
    weight: "Weight",
    captureRate: "Capture Rate",
    generation: "Generation",
    stats: "Base Stats",
    abilities: "Abilities",
    evolution: "Evolution",
    typeEffectiveness: "Type Effectiveness",
    moves: "Moves",
    locations: "Locations",
    attackEffectiveness: "Attack Effectiveness",
    defenseEffectiveness: "Defense Effectiveness",
    weaknesses: "Weaknesses",
    resistances: "Resistances",
    immunities: "Immunities",
    levelUpMoves: "Level Up",
    tmMoves: "TM/TR",
    moreMoves: "{count} more moves...",
    noLocations: "This Pokémon has no wild locations in the selected generation",
    noWildLocations: "This Pokémon has no wild locations",
    locationsNotLoaded: "Location data not loaded",
    locationStats: "Location Statistics",
    withLocations: "With Locations",
    notChecked: "Not Checked",
    allForms: "All Forms",
    normal: "Normal",
    shiny: "Shiny",
    female: "Female",
    shinyFemale: "Shiny Female",
    showShiny: "Show Shiny",
    showNormal: "Show Normal",
    hiddenAbility: "Hidden Ability",
    catchCalculator: "Catch Rate Calculator",
    selectPokemonFirst: "Please select a Pokémon first",
    baseCaptureRate: "Base Capture Rate",
    level: "Level",
    currentHP: "Current HP",
    max: "Max",
    statusCondition: "Status Condition",
    none: "None",
    sleep: "Sleep",
    freeze: "Freeze",
    paralysis: "Paralysis",
    burn: "Burn",
    poison: "Poison",
    pokeball: "Poké Ball",
    catchRate: "Catch Rate",
    probability: "Probability",
    hp: "HP",
    attack: "Attack",
    defense: "Defense",
    specialAttack: "Sp. Atk",
    specialDefense: "Sp. Def",
    speed: "Speed",
    total: "Total",
    dataManagement: "Data Management",
    clearCache: "Clear Cache",
    refreshData: "Refresh Data",
    exportJSON: "Export as JSON",
    exportCSV: "Export as CSV",
    storedDataAvailable: "Stored data available",
    favorites: "Favorites",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    compare: "Compare",
    selectPokemonToCompare: "Select Pokémon to Compare",
    selectSecondPokemon: "Select Second Pokémon",
    clearComparison: "Clear Comparison",
    teamBuilder: "Team Builder",
    addToTeam: "Add to Team",
    removeFromTeam: "Remove from Team",
    teamCoverage: "Team Coverage",
    offensiveCoverage: "Offensive Coverage",
    defensiveCoverage: "Defensive Coverage",
    selectMoves: "Select Moves",
    teamSlot: "Team Slot",
    empty: "Empty",
    typeCoverage: "Type Coverage",
    superEffective: "Super Effective",
    notVeryEffective: "Not Very Effective",
    noEffect: "No Effect",
    ability: "Ability",
    selectAbility: "Select Ability",
    effortValues: "Effort Values",
    totalEVs: "Total EVs",
    remainingEVs: "Remaining",
    form: "Form",
    selectForm: "Select Form",
    defaultForm: "Default Form",
    saveTeam: "Save Team",
    loadTeam: "Load Team",
    deleteTeam: "Delete Team",
    teamName: "Team Name",
    enterTeamName: "Enter team name",
    savedTeams: "Saved Teams",
    noSavedTeams: "No saved teams",
    confirmDeleteTeam: "Are you sure you want to delete this team?",
    teamSaved: "Team saved",
    teamLoaded: "Team loaded",
    teamDeleted: "Team deleted",
    renameTeam: "Rename Team",
  },
  ja: {
    loading: "読み込み中...",
    select: "選択",
    clear: "クリア",
    close: "閉じる",
    all: "すべて",
    pokedex: "ポケモン図鑑",
    selectGeneration: "世代を選択",
    allGenerations: "すべての世代",
    searchPlaceholder: "ポケモンを検索...",
    noResults: "結果なし",
    filter: "フィルター",
    type: "タイプ",
    region: "地方",
    selectType: "タイプを選択",
    selectRegion: "地方を選択",
    sort: "並び替え",
    sortById: "図鑑番号順",
    sortByName: "名前順",
    sortOrder: "並び順",
    ascending: "昇順",
    descending: "降順",
    noPokemonFound: "条件に合うポケモンが見つかりませんでした",
    height: "高さ",
    weight: "重さ",
    captureRate: "捕獲率",
    generation: "世代",
    stats: "種族値",
    abilities: "特性",
    evolution: "進化",
    typeEffectiveness: "タイプ相性",
    moves: "技",
    locations: "出現場所",
    attackEffectiveness: "攻撃時の効果",
    defenseEffectiveness: "防御時の効果",
    weaknesses: "弱点",
    resistances: "耐性",
    immunities: "無効",
    levelUpMoves: "レベルアップで覚える技",
    tmMoves: "わざマシンで覚える技",
    moreMoves: "あと {count} 個の技...",
    noLocations: "選択した世代では野生で出現しません",
    noWildLocations: "野生で出現しません",
    locationsNotLoaded: "出現場所データが読み込まれていません",
    locationStats: "出現場所統計",
    withLocations: "出現場所あり",
    notChecked: "未確認",
    allForms: "すべてのフォルム",
    normal: "通常",
    shiny: "色違い",
    female: "メス",
    shinyFemale: "色違いメス",
    showShiny: "色違いを表示",
    showNormal: "通常を表示",
    hiddenAbility: "夢特性",
    catchCalculator: "捕獲率計算機",
    selectPokemonFirst: "まずポケモンを選択してください",
    baseCaptureRate: "基礎捕獲率",
    level: "レベル",
    currentHP: "現在のHP",
    max: "最大",
    statusCondition: "状態異常",
    none: "なし",
    sleep: "ねむり",
    freeze: "こおり",
    paralysis: "まひ",
    burn: "やけど",
    poison: "どく",
    pokeball: "モンスターボール",
    catchRate: "捕獲率",
    probability: "成功率",
    hp: "HP",
    attack: "攻撃",
    defense: "防御",
    specialAttack: "特攻",
    specialDefense: "特防",
    speed: "素早さ",
    total: "合計",
    dataManagement: "データ管理",
    clearCache: "キャッシュをクリア",
    refreshData: "データを更新",
    exportJSON: "JSONとしてエクスポート",
    exportCSV: "CSVとしてエクスポート",
    storedDataAvailable: "ローカルデータ利用可能",
    favorites: "お気に入り",
    addToFavorites: "お気に入りに追加",
    removeFromFavorites: "お気に入りから削除",
    compare: "比較",
    selectPokemonToCompare: "比較するポケモンを選択",
    selectSecondPokemon: "2匹目のポケモンを選択",
    clearComparison: "比較をクリア",
    teamBuilder: "チームビルダー",
    addToTeam: "チームに追加",
    removeFromTeam: "チームから削除",
    teamCoverage: "チームカバレッジ",
    offensiveCoverage: "攻撃カバレッジ",
    defensiveCoverage: "防御カバレッジ",
    selectMoves: "技を選択",
    teamSlot: "チームスロット",
    empty: "空",
    typeCoverage: "タイプカバレッジ",
    superEffective: "効果抜群",
    notVeryEffective: "効果いまひとつ",
    noEffect: "効果なし",
    ability: "特性",
    selectAbility: "特性を選択",
    effortValues: "努力値",
    totalEVs: "合計努力値",
    remainingEVs: "残り",
    form: "フォルム",
    selectForm: "フォルムを選択",
    defaultForm: "デフォルトフォルム",
    saveTeam: "チームを保存",
    loadTeam: "チームを読み込む",
    deleteTeam: "チームを削除",
    teamName: "チーム名",
    enterTeamName: "チーム名を入力",
    savedTeams: "保存されたチーム",
    noSavedTeams: "保存されたチームはありません",
    confirmDeleteTeam: "このチームを削除してもよろしいですか？",
    teamSaved: "チームを保存しました",
    teamLoaded: "チームを読み込みました",
    teamDeleted: "チームを削除しました",
    renameTeam: "チーム名を変更",
  },
}

