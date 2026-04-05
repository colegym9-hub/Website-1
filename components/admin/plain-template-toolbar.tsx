"use client"

import { useState } from "react"
import { PLAIN_MERGE_FIELDS } from "@/lib/plain-email-compile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type Props = {
  insertAtCursor: (text: string) => void
}

export function PlainTemplateToolbar({ insertAtCursor }: Props) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [btnOpen, setBtnOpen] = useState(false)
  const [linkLabel, setLinkLabel] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [btnLabel, setBtnLabel] = useState("")
  const [btnUrl, setBtnUrl] = useState("")

  function confirmLink() {
    if (!linkLabel.trim() || !linkUrl.trim()) return
    insertAtCursor(`[[link:${linkLabel.trim()}|${linkUrl.trim()}]]`)
    setLinkOpen(false)
    setLinkLabel("")
    setLinkUrl("")
  }

  function confirmButton() {
    if (!btnLabel.trim() || !btnUrl.trim()) return
    insertAtCursor(`[[button:${btnLabel.trim()}|${btnUrl.trim()}]]`)
    setBtnOpen(false)
    setBtnLabel("")
    setBtnUrl("")
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ac-text-muted)]">
        Insert
      </span>
      <select
        className="max-w-[200px] rounded-md border border-[var(--ac-divider)] bg-[var(--ac-bg)] px-2 py-1.5 text-xs text-[var(--ac-text)]"
        defaultValue=""
        onChange={e => {
          const v = e.target.value
          if (v) {
            insertAtCursor(`{{${v}}}`)
            e.target.value = ""
          }
        }}
      >
        <option value="">Merge field…</option>
        {PLAIN_MERGE_FIELDS.map(f => (
          <option key={f.key} value={f.key}>
            {f.label} ({`{{${f.key}}}`})
          </option>
        ))}
      </select>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 border-[var(--ac-divider)] text-xs text-[var(--ac-text-muted)]"
        onClick={() => setLinkOpen(true)}
      >
        Link
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 border-[var(--ac-divider)] text-xs text-[var(--ac-text-muted)]"
        onClick={() => setBtnOpen(true)}
      >
        Button
      </Button>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">Insert link</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--ac-text-muted)]">
            Visible text and full URL (https://…). You can use merge tokens in the URL, e.g. {"{{prepUrl}}"}.
          </p>
          <label className="block text-xs font-medium text-[var(--ac-text-muted)]">
            Text people see
            <Input
              value={linkLabel}
              onChange={e => setLinkLabel(e.target.value)}
              className="mt-1 border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
              placeholder="Read the prep guide →"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--ac-text-muted)]">
            URL
            <Input
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              className="mt-1 border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
              placeholder="https://… or {{prepUrl}}"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[var(--ac-accent)] text-[#0d2224]" onClick={() => confirmLink()}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={btnOpen} onOpenChange={setBtnOpen}>
        <DialogContent className="border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">Insert button</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--ac-text-muted)]">
            Renders as a prominent button in the email. Same URL rules as a link.
          </p>
          <label className="block text-xs font-medium text-[var(--ac-text-muted)]">
            Button label
            <Input
              value={btnLabel}
              onChange={e => setBtnLabel(e.target.value)}
              className="mt-1 border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--ac-text-muted)]">
            URL
            <Input
              value={btnUrl}
              onChange={e => setBtnUrl(e.target.value)}
              className="mt-1 border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBtnOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-[var(--ac-accent)] text-[#0d2224]" onClick={() => confirmButton()}>
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
