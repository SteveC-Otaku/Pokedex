"use client"

import { Gamepad2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GENERATIONS } from "@/lib/pokemon-types"
import { useLanguage } from "@/contexts/language-context"

interface GenerationSelectorProps {
  value: number
  onChange: (generation: number) => void
}

export function GenerationSelector({ value, onChange }: GenerationSelectorProps) {
  const { t, language } = useLanguage()
  
  return (
    <div className="flex items-center gap-2">
      <Gamepad2 className="h-4 w-4 text-muted-foreground" />
      <Select value={value.toString()} onValueChange={(v) => onChange(Number.parseInt(v))}>
        <SelectTrigger className="w-40 bg-secondary/50">
          <SelectValue placeholder={t.selectGeneration} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">{t.allGenerations}</SelectItem>
          {GENERATIONS.map((gen) => (
            <SelectItem key={gen.id} value={gen.id.toString()}>
              {gen.names[language] || gen.names.zh || gen.names.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
