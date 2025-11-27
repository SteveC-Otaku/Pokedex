"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  pokemonId: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FavoriteButton({ pokemonId, className, size = "md" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(pokemonId)

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        sizeClasses[size],
        "relative",
        favorited && "text-red-500 hover:text-red-600",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite(pokemonId)
      }}
      title={favorited ? "取消收藏" : "收藏"}
    >
      <Heart
        className={cn(
          "h-full w-full",
          favorited ? "fill-current" : "fill-none",
        )}
      />
    </Button>
  )
}

