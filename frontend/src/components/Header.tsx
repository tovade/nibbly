import { Link } from '@tanstack/react-router'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { authClient } from '@/lib/auth-client'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const { data } = authClient.useSession()

  const logOut = async () => {
    await authClient.signOut()
    window.location.reload()
  }
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-sidebar backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-0.5">
              <img
                src="/logo_rounded.svg"
                alt="Nibbly Logo"
                className="h-16 w-16 align-middle inline"
              />

              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Nibbly
              </span>
            </Link>
          </div>
          {data?.user ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleTheme}
                variant={'ghost'}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 w-full">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                    {data.user.name.charAt(0)}
                  </div>
                  {data.user.name && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {data.user.name}
                    </span>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Link to="/dashboard">
                    <DropdownMenuItem className="cursor-pointer">
                      View dashboard
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logOut}
                    className="text-destructive cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Link
                to="/auth/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth/register"
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
