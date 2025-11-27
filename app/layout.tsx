import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
// 静态导出时不需要Analytics
// import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/contexts/language-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { TeamsProvider } from "@/contexts/teams-context"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// <CHANGE> Updated metadata for Pokédex app
export const metadata: Metadata = {
  title: "Pokédex 宝可梦图鉴",
  description: "全面的宝可梦图鉴，包含详细信息、属性克制、招式表和捕获率计算器",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LanguageProvider>
            <FavoritesProvider>
              <TeamsProvider>
                {children}
              </TeamsProvider>
            </FavoritesProvider>
          </LanguageProvider>
        </ThemeProvider>
        {/* 静态导出时不需要Analytics */}
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
