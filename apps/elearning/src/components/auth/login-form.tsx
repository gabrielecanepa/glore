'use client'

import { redirect } from 'next/navigation'
import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { useDB } from '@/hooks/use-db'
import { Route } from '@/lib/navigation'

export const LoginForm = ({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) => {
  const db = useDB()
  const t = useTranslations('Auth')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const formSchema = z.object({
    user: z
      .string()
      .nonempty(t('userRequired'))
      .min(2, {
        message: t('userInvalid'),
      }),
    password: z
      .string()
      .nonempty(t('passwordRequired'))
      .min(8, {
        message: t('passwordInvalid'),
      }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user: '',
    },
  })

  const onSubmit = async (schema: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    const user = schema.user.trim()
    const password = schema.password.trim()

    const { data: profile } = await db.from('profiles').select().or(`email.eq.${user},username.eq.${user}`).single()

    if (!profile) {
      form.setError('user', { message: t('userNotFound') })
      setIsSubmitting(false)
      return
    }

    const { error } = await db.auth.signInWithPassword({
      email: profile.email,
      password,
    })

    if (error) {
      form.setError('password', { message: t('passwordInvalid') })
      setIsSubmitting(false)
      return
    }

    redirect(Route.Home)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('userLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder="me@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>{t('passwordLabel')}</FormLabel>
                  <a className="ml-auto text-sm underline-offset-4 hover:underline" href="#">
                    {t('forgotPassword')}
                  </a>
                </div>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" loading={isSubmitting} type="submit">
            {t('login')}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t.rich('signupMessage', {
            link: content => (
              <a className="underline underline-offset-4" href="#">
                {content}
              </a>
            ),
          })}
        </div>
      </form>
    </Form>
  )
}
