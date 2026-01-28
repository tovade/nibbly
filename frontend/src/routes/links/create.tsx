import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useLinkCreation } from '@/lib/api/links'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/links/create')({
  component: RouteComponent,
  validateSearch: z.object({
    link: z.string().optional(),
  }),
})

const linkSchema = z.object({
  slug: z.string().optional(),
  link: z.url('Please enter a valid url'),
})
function RouteComponent() {
  const { data } = authClient.useSession()
  const { link } = Route.useSearch()
  const { mutateAsync } = useLinkCreation()

  const { handleSubmit, control, setValue } = useForm<
    z.infer<typeof linkSchema>
  >({
    resolver: zodResolver(linkSchema),
  })

  useEffect(() => {
    if (link) {
      setValue('link', link)
    }
  }, [link, setValue])

  const onSubmit = async (dataForm: z.infer<typeof linkSchema>) => {
    try {
      const resp = await mutateAsync(dataForm)

      toast.success(`Created a shorturl with the code: ${resp.data?.shortCode}`)
    } catch (err: any) {
      return toast.error(err)
    }
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
