"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

const FAVORITES_KEY = "pokedex-favorites"

interface FavoritesContextType {
  favorites: number[]
  toggleFavorite: (pokemonId: number) => void
  isFavorite: (pokemonId: number) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      }
    } catch (error) {
      console.error("Failed to load favorites:", error)
    }
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    try {
      if (favorites.length > 0 || localStorage.getItem(FAVORITES_KEY) !== null) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
      }
    } catch (error) {
      console.error("Failed to save favorites:", error)
    }
  }, [favorites])

  const toggleFavorite = useCallback((pokemonId: number) => {
    setFavorites((prev) => {
      if (prev.includes(pokemonId)) {
        return prev.filter((id) => id !== pokemonId)
      } else {
        return [...prev, pokemonId]
      }
    })
  }, [])

  const isFavorite = useCallback((pokemonId: number) => {
    return favorites.includes(pokemonId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}

