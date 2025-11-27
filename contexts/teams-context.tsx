"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

const TEAMS_KEY = "pokedex-teams"

export interface SavedTeamMember {
  pokemonId: number
  selectedForm: string | null
  moveIds: (number | null)[]
  ability: string | null
  evs: {
    hp: number
    attack: number
    defense: number
    specialAttack: number
    specialDefense: number
    speed: number
  }
}

export interface SavedTeam {
  id: string
  name: string
  members: SavedTeamMember[]
  createdAt: number
  updatedAt: number
}

interface TeamsContextType {
  teams: SavedTeam[]
  saveTeam: (name: string, members: SavedTeamMember[]) => string
  loadTeam: (teamId: string) => SavedTeam | null
  deleteTeam: (teamId: string) => void
  updateTeamName: (teamId: string, newName: string) => void
  getTeam: (teamId: string) => SavedTeam | undefined
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<SavedTeam[]>([])

  // Load teams from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TEAMS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setTeams(parsed)
        }
      }
    } catch (error) {
      console.error("Failed to load teams:", error)
    }
  }, [])

  // Save teams to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(teams))
    } catch (error) {
      console.error("Failed to save teams:", error)
    }
  }, [teams])

  const saveTeam = useCallback((name: string, members: SavedTeamMember[]): string => {
    const teamId = `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newTeam: SavedTeam = {
      id: teamId,
      name,
      members,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setTeams((prev) => [...prev, newTeam])
    return teamId
  }, [])

  const loadTeam = useCallback((teamId: string): SavedTeam | null => {
    const team = teams.find((t) => t.id === teamId)
    return team || null
  }, [teams])

  const deleteTeam = useCallback((teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
  }, [])

  const updateTeamName = useCallback((teamId: string, newName: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name: newName, updatedAt: Date.now() } : t))
    )
  }, [])

  const getTeam = useCallback(
    (teamId: string): SavedTeam | undefined => {
      return teams.find((t) => t.id === teamId)
    },
    [teams]
  )

  return (
    <TeamsContext.Provider
      value={{ teams, saveTeam, loadTeam, deleteTeam, updateTeamName, getTeam }}
    >
      {children}
    </TeamsContext.Provider>
  )
}

export function useTeams() {
  const context = useContext(TeamsContext)
  if (context === undefined) {
    throw new Error("useTeams must be used within a TeamsProvider")
  }
  return context
}

