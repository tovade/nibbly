import { setThemeServerFn } from '@/lib/theme'
import { useRouter } from '@tanstack/react-router'
import { createContext, useContext } from 'react'

type Theme = 'dark' | 'light'

type ThemeProviderProps = {
  children: React.ReactNode
  theme: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  const router = useRouter()

  function setTheme(val: Theme) {
    setThemeServerFn({ data: val }).then(() => router.invalidate())
  }

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
