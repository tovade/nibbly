import { isError } from '@/lib/api/base'
import { linkAPI } from '@/lib/api/links'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/links/$linkId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { data, request } = await linkAPI.getShortURL(params.linkId)

    return {
      ok: request.ok,
      status: request.status,
      data,
    }
  },
})

function RouteComponent() {
  const { ok, data } = Route.useLoaderData()
  const navigate = useNavigate()
  if (isError(data) || !ok) {
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
