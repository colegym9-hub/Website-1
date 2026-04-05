"use client"

import { useMemo, useState } from "react"
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
  disabled?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EmailSlashCommandMenu({ insertAtCursor, disabled, open: openProp, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [q, setQ] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)
  const [btnOpen, setBtnOpen] = useState(false)
  const [linkLabel, setLinkLabel] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [btnLabel, setBtnLabel] = useState("")
  const [btnUrl, setBtnUrl] = useState("")

  const merges = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return [...PLAIN_MERGE_FIELDS]
    return PLAIN_MERGE_FIELDS.filter(
      f => f.label.toLowerCase().includes(t) || f.key.toLowerCase().includes(t),
    )
  }, [q])

  function pickMerge(key: string) {
    insertAtCursor(`{{${key}}}`)
    setOpen(false)
    setQ("")
  }

  function confirmLink() {
    if (!linkLabel.trim() || !linkUrl.trim()) return
    insertAtCursor(`[[link:${linkLabel.trim()}|${linkUrl.trim()}]]`)
    setLinkOpen(false)
    setLinkLabel("")
    setLinkUrl("")
    setOpen(false)
    setQ("")
  }

  function confirmButton() {
    if (!btnLabel.trim() || !btnUrl.trim()) return
    insertAtCursor(`[[button:${btnLabel.trim()}|${btnUrl.trim()}]]`)
    setBtnOpen(false)
    setBtnLabel("")
    setBtnUrl("")
    setOpen(false)
    setQ("")
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        className="h-8 border-[var(--ac-divider)] text-xs text-[var(--ac-text-muted)]"
        onClick={() => setOpen(true)}
      >
        Slash (/) inserts…
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[min(80vh,480px)] overflow-hidden border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">Insert into body</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--ac-text-muted)]">
            Type to filter. Same tokens as the template editor — merge fields, tracked links, and buttons.
          </p>
          <Input
            placeholder="Search…"
            value={q}
            onChange={e => setQ(e.target.value)}
            className="border-[var(--ac-divider)] bg-[var(--ac-bg)] text-[var(--ac-text)]"
          />
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[var(--ac-divider)] bg-[var(--ac-bg)] p-2">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase text-[var(--ac-text-muted)]">Merge</p>
            {merges.map(f => (
              <button
                key={f.key}
                type="button"
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-[var(--ac-text)] hover:bg-white/[0.06]"
                onClick={() => pickMerge(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="border-[var(--ac-divider)]" onClick={() => setLinkOpen(true)}>
              Link…
            </Button>
            <Button type="button" size="sm" variant="outline" className="border-[var(--ac-divider)]" onClick={() => setBtnOpen(true)}>
              Button…
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">Insert link</DialogTitle>
          </DialogHeader>
          <Input placeholder="Label" value={linkLabel} onChange={e => setLinkLabel(e.target.value)} className="border-[var(--ac-divider)] bg-[var(--ac-bg)]" />
          <Input placeholder="https://…" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="border-[var(--ac-divider)] bg-[var(--ac-bg)]" />
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
        <DialogContent className="border-[var(--ac-divider)] bg-[var(--ac-surface)] text-[var(--ac-text)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--ac-text)]">Insert button</DialogTitle>
          </DialogHeader>
          <Input placeholder="Label" value={btnLabel} onChange={e => setBtnLabel(e.target.value)} className="border-[var(--ac-divider)] bg-[var(--ac-bg)]" />
          <Input placeholder="https://…" value={btnUrl} onChange={e => setBtnUrl(e.target.value)} className="border-[var(--ac-divider)] bg-[var(--ac-bg)]" />
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
    </>
  )
}
