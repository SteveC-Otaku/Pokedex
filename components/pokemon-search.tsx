"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { PokemonListItem } from "@/lib/pokemon-types"
import { getTypeName } from "@/lib/pokemon-types"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface PokemonSearchProps {
  pokemonList: PokemonListItem[]
  onSelect: (pokemon: PokemonListItem) => void
  isLoading?: boolean
}

export function PokemonSearch({ pokemonList, onSelect, isLoading }: PokemonSearchProps) {
  const { t, language } = useLanguage()
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<PokemonListItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const searchPokemon = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions([])
        return
      }

      const q = searchQuery.trim()
      
      const results = pokemonList
        .filter((p) => {
          // Search by ID (support both original and padded format)
          const idStr = p.id.toString()
          const idPadded = idStr.padStart(3, "0")
          if (idStr === q || idPadded === q) {
            return true
          }
          
          // Only search by Chinese name
          if (p.names.zh && p.names.zh.includes(q)) {
            return true
          }
          
          // Fallback: if no Chinese name, check if query matches the ID
          // This ensures ID search still works even without Chinese name
          return false
        })
        .slice(0, 10)

      setSuggestions(results)
      setSelectedIndex(-1)
    },
    [pokemonList],
  )

  useEffect(() => {
    searchPokemon(query)
  }, [query, searchPokemon])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[selectedIndex])
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleSelect = (pokemon: PokemonListItem) => {
    onSelect(pokemon)
    setQuery("")
    setSuggestions([])
    setIsOpen(false)
  }

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[selectedIndex] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={isLoading ? t.loading : t.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="pl-10 pr-10 bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setSuggestions([])
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto"
        >
          {suggestions.map((pokemon, index) => (
            <li
              key={pokemon.id}
              onClick={() => handleSelect(pokemon)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                index === selectedIndex ? "bg-primary/20" : "hover:bg-secondary/50",
              )}
            >
              <img
                src={pokemon.sprite || "/placeholder.svg"}
                alt={pokemon.name}
                className="w-10 h-10 pixelated flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-muted-foreground text-xs font-mono flex-shrink-0">
                    #{pokemon.id.toString().padStart(3, "0")}
                  </span>
                  <span className="font-medium truncate text-sm">{pokemon.names[language] || pokemon.names.zh || pokemon.names.en || pokemon.name}</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {pokemon.types.map((type) => (
                    <span key={type} className={`type-${type} text-[10px] px-1 py-0.5 rounded text-white flex-shrink-0`}>
                      {getTypeName(type, language)}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
