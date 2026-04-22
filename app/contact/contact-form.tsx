"use client"

import { useState } from "react"
import { SendIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

type Errors = Partial<Record<"name" | "email" | "message", string>>

export default function ContactForm({ defaultService = "" }: { defaultService?: string }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  function validate(): Errors {
    const e: Errors = {}
    if (!name.trim()) e.name = "Name is required"
    if (!email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email"
    if (!message.trim()) e.message = "Message is required"
    return e
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
          service: defaultService,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        toast.error(json.error ?? "Something went wrong. Please try again.")
        return
      }
      toast.success("Message sent. Cole will reach out soon.")
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
      setErrors({})
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={errors.name ? true : undefined}>
          <FieldLabel htmlFor="contact-name">Name</FieldLabel>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            disabled={submitting}
          />
          {errors.name ? <FieldDescription>{errors.name}</FieldDescription> : null}
        </Field>

        <Field data-invalid={errors.email ? true : undefined}>
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            disabled={submitting}
          />
          {errors.email ? <FieldDescription>{errors.email}</FieldDescription> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-phone">Phone (optional)</FieldLabel>
          <Input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={submitting}
          />
        </Field>

        <Field data-invalid={errors.message ? true : undefined}>
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <Textarea
            id="contact-message"
            name="message"
            rows={6}
            placeholder="Tell me about the shoot you have in mind."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            disabled={submitting}
          />
          {errors.message ? (
            <FieldDescription>{errors.message}</FieldDescription>
          ) : (
            <FieldDescription>
              Sport, timing, location, vibe — whatever gets us started.
            </FieldDescription>
          )}
        </Field>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Sending…" : "Send message"}
          <SendIcon data-icon="inline-end" />
        </Button>
      </FieldGroup>
    </form>
  )
}
