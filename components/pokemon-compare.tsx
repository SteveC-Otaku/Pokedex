"use client"

import { X, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Pokemon } from "@/lib/pokemon-types"
import { getTypeName, GENERATIONS } from "@/lib/pokemon-types"
import { getTypeEffectiveness } from "@/lib/pokemon-utils"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { FavoriteButton } from "./favorite-button"
import { PokemonSearch } from "./pokemon-search"
import type { PokemonListItem } from "@/lib/pokemon-types"

interface PokemonCompareProps {
  pokemon1: Pokemon | null
  pokemon2: Pokemon | null
  pokemonList: PokemonListItem[]
  onSelectPokemon1: (pokemon: PokemonListItem) => void
  onSelectPokemon2: (pokemon: PokemonListItem) => void
  onClearPokemon1: () => void
  onClearPokemon2: () => void
  onClose: () => void
}

const STAT_COLORS: { [key: string]: string } = {
  hp: "[&>div]:bg-red-600 [&>div]:dark:bg-red-500",
  attack: "[&>div]:bg-orange-600 [&>div]:dark:bg-orange-500",
  defense: "[&>div]:bg-amber-500 [&>div]:dark:bg-amber-400",
  specialAttack: "[&>div]:bg-blue-600 [&>div]:dark:bg-blue-500",
  specialDefense: "[&>div]:bg-emerald-600 [&>div]:dark:bg-emerald-500",
  speed: "[&>div]:bg-purple-600 [&>div]:dark:bg-purple-500",
}

export function PokemonCompare({
  pokemon1,
  pokemon2,
  pokemonList,
  onSelectPokemon1,
  onSelectPokemon2,
  onClearPokemon1,
  onClearPokemon2,
  onClose,
}: PokemonCompareProps) {
  const { t, language } = useLanguage()

  const STAT_NAMES: { [key: string]: string } = {
    hp: t.hp,
    attack: t.attack,
    defense: t.defense,
    specialAttack: t.specialAttack,
    specialDefense: t.specialDefense,
    speed: t.speed,
  }

  const renderPokemonCard = (pokemon: Pokemon | null, onSelect: (pokemon: PokemonListItem) => void, side: "left" | "right") => {
    if (!pokemon) {
      return (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-center mb-4">
              {side === "left" ? t.selectPokemonToCompare : t.selectSecondPokemon}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PokemonSearch
              pokemonList={pokemonList}
              onSelect={onSelect}
              isLoading={false}
            />
          </CardContent>
        </Card>
      )
    }

    const typeEffectiveness = getTypeEffectiveness(pokemon.types)

    return (
      <Card className="flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={pokemon.sprites.front || "/placeholder.svg"}
                alt={pokemon.name}
                className="w-16 h-16 object-contain"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono text-sm">
                    #{pokemon.id.toString().padStart(3, "0")}
                  </span>
                  <CardTitle className="text-xl">
                    {pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}
                  </CardTitle>
                  <FavoriteButton pokemonId={pokemon.id} size="sm" />
                </div>
                <div className="flex gap-2 mt-1">
                  {pokemon.types.map((type) => (
                    <span key={type} className={`type-${type} px-2 py-0.5 rounded-full text-white text-xs`}>
                      {getTypeName(type, language)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={side === "left" ? onClearPokemon1 : onClearPokemon2}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div>
            <h4 className="font-medium mb-2">{t.stats}</h4>
            <div className="space-y-2">
              {Object.entries(pokemon.stats)
                .filter(([key]) => key !== "total")
                .map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{STAT_NAMES[key]}</span>
                      <span className="font-mono">{value}</span>
                    </div>
                    <Progress
                      value={(value / 255) * 100}
                      className={cn("h-2 bg-secondary/50", STAT_COLORS[key])}
                    />
                  </div>
                ))}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-medium">{t.total}</span>
                <span className="text-sm font-mono font-bold">{pokemon.stats.total}</span>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">{t.height}: </span>
              <span>{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t.weight}: </span>
              <span>{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t.captureRate}: </span>
              <span>{pokemon.species.captureRate}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t.generation}: </span>
              <span>
                {GENERATIONS.find((g) => g.id === pokemon.species.generation)?.names[language] ||
                  GENERATIONS.find((g) => g.id === pokemon.species.generation)?.names.zh}
              </span>
            </div>
          </div>

          {/* Type Effectiveness */}
          <div>
            <h4 className="font-medium mb-2">{t.weaknesses}</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(typeEffectiveness.defending)
                .filter(([, mult]) => mult > 1)
                .sort(([, a], [, b]) => b - a)
                .map(([type, mult]) => (
                  <Badge key={type} variant="destructive" className="text-xs">
                    {getTypeName(type, language)} ×{mult}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t.compare}</CardTitle>
          {(pokemon1 || pokemon2) && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t.clearComparison}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {renderPokemonCard(pokemon1, onSelectPokemon1, "left")}
          {pokemon1 && pokemon2 && (
            <div className="flex items-center justify-center p-4">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          {renderPokemonCard(pokemon2, onSelectPokemon2, "right")}
        </div>
        {pokemon1 && pokemon2 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="font-medium mb-2">{t.stats} {t.compare}</h4>
            <div className="space-y-2">
              {Object.entries(pokemon1.stats)
                .filter(([key]) => key !== "total")
                .map(([key]) => {
                  const val1 = pokemon1.stats[key as keyof typeof pokemon1.stats]
                  const val2 = pokemon2.stats[key as keyof typeof pokemon2.stats]
                  const diff = val1 - val2
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="w-20 text-sm text-muted-foreground">{STAT_NAMES[key]}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 text-right text-sm font-mono">{val1}</div>
                        <div className="w-16 text-center text-xs text-muted-foreground">
                          {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "="}
                        </div>
                        <div className="flex-1 text-left text-sm font-mono">{val2}</div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

