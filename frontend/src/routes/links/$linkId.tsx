import { linkOptions } from '@/lib/api/links'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/links/$linkId')({
  component: RouteComponent,
  loader: async ({ params: { linkId }, context }) => {
    const data = await context.queryClient.ensureQueryData(linkOptions(linkId))

    return data
  },
})

function RouteComponent() {
  const { linkId } = Route.useParams()
  const { data, isError } = useSuspenseQuery(linkOptions(linkId))
  const navigate = useNavigate()
  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-500">Error</h1>
          <p className="mt-4 text-xl text-gray-600">
            Sorry, we couldn't find the link you're looking for.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >
            Go back home
          </a>
        </div>
      </div>
    )
  }
  navigate({ href: data.data?.originalUrl })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-blue-500">Loading</h1>
        <p className="mt-4 text-xl text-gray-600">
          Please wait, it may take a few seconds to redirect you!
        </p>
      </div>
    </div>
  )
}
