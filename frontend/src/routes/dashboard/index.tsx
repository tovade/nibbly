import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { authMiddleware } from '@/middleware/auth'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { InfoIcon, SquareArrowOutUpRight } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
})

function RouteComponent() {
  const [url, setUrl] = useState('')
  const navigate = useNavigate()
  const user = authClient.useSession()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      to: '/links/create',
      search: {
        link: url,
      },
    })
  }

  return (
    <div className="min-h-screen bg-background p-8 ">
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertTitle className="text-3xl mb-2">
            <InfoIcon className="h-8 w-8 inline" /> Notice
          </AlertTitle>
          <AlertDescription className="inline">
            Link overview page has been moved to{' '}
            <Link
              to="/dashboard/links"
              preload="intent"
              className="underline inline-flex items-center gap-1"
            >
              a new page
              <SquareArrowOutUpRight className="inline h-3 w-3" />
            </Link>
          </AlertDescription>
        </Alert>
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 dark:text-white mt-5">
          Hello {user.data?.user.name || 'there'}
        </h1>

        {/* URL Shortener Form */}
        <Card>
          <CardHeader>
            <CardTitle>Shorten a URL</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <Button type="submit" className="px-6 py-3 dark:text-white">
                Shorten
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Total links</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                24
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                1,234
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>This month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                156
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
