"use client"

import { useState } from "react"
import { RefreshCw, Download, Trash2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { clearCache } from "@/lib/pokemon-api"
import {
  clearPokemonListStorage,
  clearPokemonDetailStorage,
  exportPokemonListAsJSON,
  exportPokemonListAsCSV,
  hasPokemonListInStorage,
} from "@/lib/pokemon-storage"
import { useLanguage } from "@/contexts/language-context"
import type { PokemonListItem } from "@/lib/pokemon-types"

interface CacheControlsProps {
  pokemonList?: PokemonListItem[]
  onRefresh?: () => void
}

export function CacheControls({ pokemonList, onRefresh }: CacheControlsProps) {
  const { t } = useLanguage()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCache = () => {
    setIsClearing(true)
    clearCache()
    clearPokemonListStorage()
    clearPokemonDetailStorage()
    // Reload page to clear SWR cache
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  const handleExportJSON = () => {
    if (pokemonList && pokemonList.length > 0) {
      exportPokemonListAsJSON(pokemonList)
    }
  }

  const handleExportCSV = () => {
    if (pokemonList && pokemonList.length > 0) {
      exportPokemonListAsCSV(pokemonList)
    }
  }

  const hasStoredData = hasPokemonListInStorage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Database className="h-4 w-4" />
          {t.dataManagement || "数据管理"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleClearCache} disabled={isClearing} className="gap-2">
          <Trash2 className="h-4 w-4" />
          {t.clearCache || "清除缓存"}
        </DropdownMenuItem>
        {onRefresh && (
          <DropdownMenuItem onClick={onRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t.refreshData || "刷新数据"}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportJSON} disabled={!pokemonList || pokemonList.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          {t.exportJSON || "导出为 JSON"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={!pokemonList || pokemonList.length === 0} className="gap-2">
          <Download className="h-4 w-4" />
          {t.exportCSV || "导出为 CSV"}
        </DropdownMenuItem>
        {hasStoredData && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {t.storedDataAvailable || "本地数据可用"}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

