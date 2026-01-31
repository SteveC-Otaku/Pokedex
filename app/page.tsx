"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { PokemonSearch } from "@/components/pokemon-search"
import { PokemonFilters, type FilterState, type SortBy, type SortOrder } from "@/components/pokemon-filters"
import { PokemonGrid } from "@/components/pokemon-grid"
import { PokemonDetail } from "@/components/pokemon-detail"
import { CatchCalculator } from "@/components/catch-calculator"
import { PokemonCompare } from "@/components/pokemon-compare"
import { TeamBuilder } from "@/components/team-builder"
import { FavoritesList } from "@/components/favorites-list"
import { TypeEffectivenessAndCoverage } from "@/components/type-effectiveness-calculator"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchPokemonBasicList, fetchPokemonDetail } from "@/lib/pokemon-api"
import type { Pokemon, PokemonListItem } from "@/lib/pokemon-types"
import { useLanguage } from "@/contexts/language-context"

const VALID_TABS = ["pokedex", "favorites", "compare", "team", "type-calc"]

function PokedexContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedGeneration, setSelectedGeneration] = useState(9)
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    region: null,
  })
  const [sortBy, setSortBy] = useState<SortBy>("id")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null)
  const [detailedPokemon, setDetailedPokemon] = useState<Pokemon | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [comparePokemon1, setComparePokemon1] = useState<Pokemon | null>(null)
  const [comparePokemon2, setComparePokemon2] = useState<Pokemon | null>(null)
  const [showCompare, setShowCompare] = useState(false)
  const [activeTab, setActiveTab] = useState("pokedex")

  useEffect(() => {
    const tab = searchParams.get("tab")
    const id = searchParams.get("id")
    if (tab && VALID_TABS.includes(tab)) setActiveTab(tab)
    if (id) {
      const n = Number.parseInt(id, 10)
      if (!Number.isNaN(n) && n > 0) setSelectedPokemonId(n)
    } else if (id === null) setSelectedPokemonId(null)
  }, [searchParams])

  const updateUrl = useCallback(
    (updates: { tab?: string; id?: number | null }) => {
      const params = new URLSearchParams(searchParams.toString())
      if (updates.tab !== undefined) {
        if (updates.tab) params.set("tab", updates.tab)
        else params.delete("tab")
      }
      if (updates.id !== undefined) {
        if (updates.id != null) params.set("id", String(updates.id))
        else params.delete("id")
      }
      router.replace(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Fetch pokemon list from local JSON file
  const { data: pokemonList, isLoading: isLoadingList } = useSWR("pokemon-list", fetchPokemonBasicList, {
    revalidateOnFocus: false,
  })

  // Load stats map for sorting by stats (only when needed)
  const needsStats = sortBy !== "id" && sortBy !== "name"
  const { data: statsMap } = useSWR(
    needsStats ? "pokemon-stats-map" : null,
    async () => {
      try {
        const response = await fetch("/data/pokemon-full-data.json")
        if (!response.ok) return null
        const data = await response.json()
        if (!data.data) return null
        
        // 提取所有宝可梦的 stats
        const map: Record<number, { [key: string]: number }> = {}
        Object.values(data.data).forEach((pokemon: any) => {
          if (pokemon.stats) {
            map[pokemon.id] = pokemon.stats
          }
        })
        return map
      } catch {
        return null
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  // Load detailed pokemon data with SWR caching
  const { data: cachedDetail, isLoading: isLoadingDetailSWR } = useSWR(
    selectedPokemonId ? `pokemon-detail-${selectedPokemonId}` : null,
    () => (selectedPokemonId ? fetchPokemonDetail(selectedPokemonId) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1分钟内不重复请求
    }
  )

  // Load detailed pokemon data
  const loadPokemonDetail = useCallback((id: number) => {
    setSelectedPokemonId(id)
  }, [])

  // 当缓存数据更新时，更新状态
  useEffect(() => {
    if (cachedDetail) {
      setDetailedPokemon(cachedDetail)
    }
    setIsLoadingDetail(isLoadingDetailSWR)
  }, [cachedDetail, isLoadingDetailSWR])

  const handleSelectPokemon = (pokemon: PokemonListItem) => {
    loadPokemonDetail(pokemon.id)
    updateUrl({ id: pokemon.id })
  }

  const handleSelectPokemonById = (id: number) => {
    loadPokemonDetail(id)
    updateUrl({ id })
  }

  const handleCloseDetail = () => {
    setSelectedPokemonId(null)
    setDetailedPokemon(null)
    updateUrl({ id: null })
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    updateUrl({ tab })
  }

  return (
    <div className="pokedex-root min-h-screen bg-background">
      <a
        href="#pokedex-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        跳到主内容
      </a>
      <header className="pokedex-header sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
                  <img 
                    src={(() => {
                      // 动态获取 basePath
                      if (typeof window !== 'undefined') {
                        // 客户端：从路径判断
                        const pathname = window.location.pathname
                        const basePath = pathname.startsWith('/Pokedex') ? '/Pokedex' : ''
                        return `${basePath}/Pokedex.webp`
                      }
                      // 服务端：使用环境变量
                      return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/Pokedex.webp`
                    })()}
                    alt={t.pokedex}
                    className="h-10 w-auto object-contain"
                    onError={(e) => {
                      // 如果图片加载失败，尝试使用绝对路径
                      const target = e.target as HTMLImageElement
                      if (!target.src.includes('/Pokedex/Pokedex.webp')) {
                        target.src = '/Pokedex/Pokedex.webp'
                      }
                    }}
                  />
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageSelector />
              <PokemonSearch pokemonList={pokemonList || []} onSelect={handleSelectPokemon} isLoading={isLoadingList} />
            </div>
          </div>
        </div>
      </header>

      <main id="pokedex-main" className="pokedex-main container mx-auto px-4 py-6" role="main">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="pokedex-tabs-list grid w-full grid-cols-5 mb-6" aria-label={t.pokedex}>
            <TabsTrigger className="pokedex-tabs-trigger min-h-11 touch-manipulation" value="pokedex">{t.pokedex}</TabsTrigger>
            <TabsTrigger className="pokedex-tabs-trigger min-h-11 touch-manipulation" value="favorites">{t.favorites}</TabsTrigger>
            <TabsTrigger className="pokedex-tabs-trigger min-h-11 touch-manipulation" value="compare">{t.compare}</TabsTrigger>
            <TabsTrigger className="pokedex-tabs-trigger min-h-11 touch-manipulation" value="team">{t.teamBuilder}</TabsTrigger>
            <TabsTrigger className="pokedex-tabs-trigger min-h-11 touch-manipulation" value="type-calc">{t.typeEffectivenessCalculator || "属性克制"}</TabsTrigger>
          </TabsList>

          <TabsContent value="pokedex" className="space-y-6">
        <div className="pokedex-content-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
                <PokemonFilters 
                  filters={filters} 
                sortBy={sortBy}
                sortOrder={sortOrder}
                  onFiltersChange={setFilters}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
              />

            <PokemonGrid
              pokemonList={pokemonList || []}
              filters={filters}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSelect={handleSelectPokemon}
              selectedId={selectedPokemonId ?? undefined}
              isLoading={isLoadingList}
                  statsMap={statsMap || undefined}
            />
          </div>

          <div className="pokedex-panel-right space-y-6 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="pokedex-detail-panel space-y-6">
                {isLoadingDetail && (
                  <Card className="pokedex-card p-8">
                    <div className="text-center text-muted-foreground">{t.loading}</div>
                  </Card>
                )}
                    {detailedPokemon && !isLoadingDetail && (
              <PokemonDetail
                        pokemon={detailedPokemon}
                selectedGeneration={selectedGeneration}
                onClose={handleCloseDetail}
                onSelectPokemon={handleSelectPokemonById}
                        onPokemonUpdate={(updatedPokemon) => {
                          // 当形态切换时，更新父组件的 detailedPokemon
                          setDetailedPokemon(updatedPokemon)
                        }}
              />
            )}
            <CatchCalculator pokemon={detailedPokemon} />
                </div>
          </div>
        </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="pokedex-content-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FavoritesList
                  onSelectPokemon={(pokemon) => {
                    setDetailedPokemon(pokemon)
                    setSelectedPokemonId(pokemon.id)
                  }}
                />
              </div>

              <div className="pokedex-panel-right space-y-6 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
                {isLoadingDetail && !detailedPokemon && (
                  <Card className="pokedex-card p-8">
                    <div className="text-center text-muted-foreground">{t.loading}</div>
                  </Card>
                )}
                {detailedPokemon && (
                  <>
                    <PokemonDetail
                      pokemon={detailedPokemon}
                      selectedGeneration={selectedGeneration}
                      onClose={handleCloseDetail}
                      onSelectPokemon={handleSelectPokemonById}
                      onPokemonUpdate={(updatedPokemon) => {
                        // 当形态切换时，更新父组件的 detailedPokemon
                        setDetailedPokemon(updatedPokemon)
                      }}
                    />
                    <CatchCalculator pokemon={detailedPokemon} />
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <PokemonCompare
              pokemon1={comparePokemon1}
              pokemon2={comparePokemon2}
              pokemonList={pokemonList || []}
              onSelectPokemon1={async (pokemon) => {
                try {
                  const detail = await fetchPokemonDetail(pokemon.id)
                  setComparePokemon1(detail)
                } catch (error) {
                  console.error("Failed to load pokemon:", error)
                }
              }}
              onSelectPokemon2={async (pokemon) => {
                try {
                  const detail = await fetchPokemonDetail(pokemon.id)
                  setComparePokemon2(detail)
                } catch (error) {
                  console.error("Failed to load pokemon:", error)
                }
              }}
              onClearPokemon1={() => setComparePokemon1(null)}
              onClearPokemon2={() => setComparePokemon2(null)}
              onClose={() => {
                setComparePokemon1(null)
                setComparePokemon2(null)
              }}
            />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamBuilder />
          </TabsContent>

          <TabsContent value="type-calc" className="space-y-6">
            <TypeEffectivenessAndCoverage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function PokedexFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  )
}

export default function Pokedex() {
  return (
    <Suspense fallback={<PokedexFallback />}>
      <PokedexContent />
    </Suspense>
  )
}
