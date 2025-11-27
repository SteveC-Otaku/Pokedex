"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFavorites } from "@/hooks/use-favorites"
import { fetchPokemonBasicList, fetchPokemonDetail } from "@/lib/pokemon-api"
import type { Pokemon, PokemonListItem } from "@/lib/pokemon-types"
import { getTypeName } from "@/lib/pokemon-types"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

interface FavoritesListProps {
  onSelectPokemon: (pokemon: Pokemon) => void
}

export function FavoritesList({ onSelectPokemon }: FavoritesListProps) {
  const { t, language } = useLanguage()
  const { favorites, toggleFavorite, clearFavorites } = useFavorites()
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([])
  const [favoritePokemon, setFavoritePokemon] = useState<Pokemon[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load pokemon list
  useEffect(() => {
    const loadList = async () => {
      try {
        const list = await fetchPokemonBasicList()
        setPokemonList(list)
      } catch (error) {
        console.error("Failed to load pokemon list:", error)
      }
    }
    loadList()
  }, [])

  // Load favorite pokemon details
  useEffect(() => {
    const loadFavorites = async () => {
      if (favorites.length === 0) {
        setFavoritePokemon([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const details = await Promise.all(
          favorites.map((id) => fetchPokemonDetail(id))
        )
        // Sort by ID to maintain order
        details.sort((a, b) => a.id - b.id)
        setFavoritePokemon(details)
      } catch (error) {
        console.error("Failed to load favorite pokemon:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [favorites])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t.favorites}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">{t.loading}</div>
        </CardContent>
      </Card>
    )
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t.favorites}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 space-y-4">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">
              还没有收藏任何宝可梦
            </p>
            <p className="text-sm text-muted-foreground">
              点击宝可梦卡片上的 ❤️ 图标来收藏它们
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-current" />
            {t.favorites} ({favorites.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFavorites}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            清空收藏
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {favoritePokemon.map((pokemon) => (
            <button
              key={pokemon.id}
              onClick={() => onSelectPokemon(pokemon)}
              className={cn(
                "group relative aspect-square rounded-xl bg-card border border-border/50 p-2 transition-all duration-200",
                "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-105",
              )}
            >
              <div className="absolute top-2 left-2 text-xs font-mono text-muted-foreground">
                #{pokemon.id.toString().padStart(3, "0")}
              </div>
              <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-red-600"
                  onClick={() => toggleFavorite(pokemon.id)}
                  title="取消收藏"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0 pb-16">
                <img
                  src={pokemon.sprites.front || "/placeholder.svg"}
                  alt={pokemon.name}
                  className="w-full h-full max-h-full object-contain pixelated"
                  loading="lazy"
                />
              </div>
              <div className="absolute bottom-2 left-2 right-2 z-10">
                <div className="bg-card/95 backdrop-blur-sm rounded-md px-1 py-0.5">
                  <div className="text-sm font-medium truncate text-center">
                    {pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}
                  </div>
                  <div className="flex justify-center gap-1 mt-1">
                    {pokemon.types.map((type) => (
                      <span key={type} className={`type-${type} text-[10px] px-1.5 py-0.5 rounded text-white`}>
                        {getTypeName(type, language)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

