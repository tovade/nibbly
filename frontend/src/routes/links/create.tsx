import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { isError } from '@/lib/api/base'
import { linkAPI } from '@/lib/api/links'
import { authClient } from '@/lib/auth-client'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

export const Route = createFileRoute('/links/create')({
  component: RouteComponent,
})

const linkSchema = z.object({
  slug: z.string().optional(),
  link: z.url('Please enter a valid url'),
})
function RouteComponent() {
  const { data } = authClient.useSession()

  const { handleSubmit, control } = useForm<z.infer<typeof linkSchema>>({
    resolver: zodResolver(linkSchema),
  })

  const onSubmit = async (data: z.infer<typeof linkSchema>) => {
    const { data: resp, request } = await linkAPI.createShortURL(
      data.link,
      data.slug,
    )

    if (isError(resp) || !request.ok) {
      return toast.error(
        isError(resp) ? resp.error.message : 'An error occurred',
      )
    }

    toast.success(`Created a shorturl with the code: ${resp.data?.shortCode}`)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            <h1 className="text-3xl font-bold">Create shorturl</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <FieldGroup>
                <Controller
                  name="link"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-link">Link</FieldLabel>
                      <Input
                        {...field}
                        type="url"
                        id="form-link"
                        placeholder="https://example.com"
                        required
                      />{' '}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {data?.user && (
                  <Controller
                    name="slug"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-slug">
                          Slug (the part of the url eg: /my_account)
                        </FieldLabel>
                        <Input {...field} id="form-slug" placeholder="google" />{' '}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}
              </FieldGroup>
            </FieldGroup>

            <Button type="submit" className="w-full" variant={'default'}>
              Create url
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
