import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Link2Off, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { linkAPI } from '@/lib/api/links'
import { isError } from '@/lib/api/base'

// Short links live at the app root: /<slug>. Static routes (/auth, /dashboard, ...) win over this.
export const Route = createFileRoute('/$slug')({
  component: RouteComponent,
})

type State = 'redirecting' | 'not-found' | 'error'

// Only ever navigate to real web links. window.location with a javascript: URL would
// run script on our own origin.
function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

function RouteComponent() {
  const { slug } = Route.useParams()
  const [state, setState] = useState<State>('redirecting')
  // StrictMode runs effects twice in dev, which would count every click twice
  const requested = useRef<string | null>(null)

  useEffect(() => {
    if (requested.current === slug) return
    requested.current = slug

    // The effect only runs in the browser, so the backend sees the visitor's own IP and
    // user agent. document.referrer is sent along because the backend would otherwise
    // only see this page as the referrer.
    linkAPI
      .visitShortURL(slug, document.referrer)
      .then(({ request, data }) => {
        if (request.status === 404) return setState('not-found')

        if (!request.ok || isError(data) || !data.data) {
          return setState('error')
        }

        if (!isHttpUrl(data.data.originalUrl)) return setState('error')

        // replace, not assign, so the back button doesn't land on this page and loop
        window.location.replace(data.data.originalUrl)
      })
      .catch(() => setState('error'))
  }, [slug])

  if (state === 'redirecting') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <h1 className="mt-6 text-2xl font-semibold text-foreground">
            Redirecting you…
          </h1>
          <p className="mt-2 text-muted-foreground">
            You'll be on your way in a moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <Link2Off className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-bold text-foreground">
          {state === 'not-found' ? 'Link not found' : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {state === 'not-found'
            ? "Sorry, we couldn't find the link you're looking for."
            : "We couldn't redirect you right now. Please try again later."}
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Go back home</Link>
        </Button>
      </div>
    </div>
  )
}
