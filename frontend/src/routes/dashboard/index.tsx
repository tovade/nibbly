import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { InfoIcon, SquareArrowOutUpRight } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'
import { authMiddleware } from '@/middleware/auth'

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
    <div className="min-h-[calc(100svh-4rem)] bg-background px-4 py-10 md:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">
          Hello, {user.data?.user.name || 'there'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Paste a long URL to turn it into a short link.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Shorten a URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="dashboard-url" className="sr-only">
                Long URL
              </label>
              <Input
                id="dashboard-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here"
                className="flex-1"
                required
              />
              <Button type="submit">Shorten</Button>
            </form>
          </CardContent>
        </Card>

        <Alert className="mt-6 border-border bg-secondary/50">
          <InfoIcon />
          <AlertTitle>Looking for your links?</AlertTitle>
          <AlertDescription>
            <span>
              The link overview now lives on its own page.{' '}
              <Link
                to="/dashboard/links"
                preload="intent"
                className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4"
              >
                Go to your links
                <SquareArrowOutUpRight className="size-3" />
              </Link>
            </span>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
