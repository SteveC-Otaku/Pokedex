"use client"

import { useState, useCallback, useEffect } from "react"
import useSWR from "swr"
import { PokemonSearch } from "@/components/pokemon-search"
import { PokemonFilters, type FilterState, type SortBy, type SortOrder } from "@/components/pokemon-filters"
import { PokemonGrid } from "@/components/pokemon-grid"
import { PokemonDetail } from "@/components/pokemon-detail"
import { CatchCalculator } from "@/components/catch-calculator"
import { PokemonCompare } from "@/components/pokemon-compare"
import { TeamBuilder } from "@/components/team-builder"
import { FavoritesList } from "@/components/favorites-list"
import { LanguageSelector } from "@/components/language-selector"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchPokemonBasicList, fetchPokemonDetail } from "@/lib/pokemon-api"
import type { Pokemon, PokemonListItem } from "@/lib/pokemon-types"
import { useLanguage } from "@/contexts/language-context"

export default function Pokedex() {
  const { t } = useLanguage()
  const [selectedGeneration, setSelectedGeneration] = useState(9)
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    region: null, // null 表示全部地区（全国图鉴）
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
  }

  const handleSelectPokemonById = (id: number) => {
    loadPokemonDetail(id)
  }

  const handleCloseDetail = () => {
    setSelectedPokemonId(null)
    setDetailedPokemon(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={typeof window !== 'undefined' && window.location.pathname.startsWith('/Pokedex') 
                  ? '/Pokedex/Pokedex.webp' 
                  : '/Pokedex.webp'}
                alt={t.pokedex}
                className="h-10 w-auto object-contain"
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

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pokedex">{t.pokedex}</TabsTrigger>
            <TabsTrigger value="favorites">{t.favorites}</TabsTrigger>
            <TabsTrigger value="compare">{t.compare}</TabsTrigger>
            <TabsTrigger value="team">{t.teamBuilder}</TabsTrigger>
          </TabsList>

          <TabsContent value="pokedex" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left panel - Pokemon Grid */}
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

              {/* Right panel - Detail & Calculator */}
              <div className="space-y-6 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto">
                {isLoadingDetail && (
                  <Card className="p-8">
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
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <FavoritesList
              onSelectPokemon={(pokemon) => {
                setDetailedPokemon(pokemon)
                setSelectedPokemonId(pokemon.id)
                setActiveTab("pokedex") // Switch to pokedex tab to see details
              }}
            />
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
        </Tabs>
      </main>
    </div>
  )
}
