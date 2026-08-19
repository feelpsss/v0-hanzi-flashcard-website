"use client"

import { useEffect, useRef, useState } from "react"
import type HanziWriterType from "hanzi-writer"

import { Button } from "@/components/ui/button"

interface HanziStrokeOrderProps {
  character: string
}

type LoadStatus = "loading" | "ready" | "unavailable"

const isSingleHanCharacter = (value: string) => /^\p{Script=Han}$/u.test(value)

export function HanziStrokeOrder({ character }: HanziStrokeOrderProps) {
  const targetRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<HanziWriterType | null>(null)
  const [status, setStatus] = useState<LoadStatus>("loading")

  useEffect(() => {
    if (!isSingleHanCharacter(character)) return

    let active = true
    let resizeObserver: ResizeObserver | undefined
    const target = targetRef.current
    setStatus("loading")

    const initialize = async () => {
      if (!target) return
      const { default: HanziWriter } = await import("hanzi-writer")
      if (!active) return

      const size = Math.min(Math.max(target.getBoundingClientRect().width, 1), 280)
      const writer = HanziWriter.create(target, character, {
        width: size,
        height: size,
        padding: 12,
        showCharacter: false,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 350,
        onLoadCharDataSuccess: () => {
          if (!active) return
          setStatus("ready")
          requestAnimationFrame(() => {
            if (active && writerRef.current === writer) void writer.animateCharacter()
          })
        },
        onLoadCharDataError: () => {
          if (active) setStatus("unavailable")
        },
      })
      writerRef.current = writer

      resizeObserver = new ResizeObserver(([entry]) => {
        if (!active) return
        const nextSize = Math.min(Math.max(entry.contentRect.width, 1), 280)
        writer.updateDimensions({ width: nextSize, height: nextSize })
      })
      resizeObserver.observe(target)
    }

    void initialize().catch(() => {
      if (active) setStatus("unavailable")
    })

    return () => {
      active = false
      resizeObserver?.disconnect()
      const writer = writerRef.current
      writerRef.current = null
      if (writer) {
        writer.cancelQuiz()
        void writer.pauseAnimation()
      }
      target?.replaceChildren()
    }
  }, [character])

  if (!isSingleHanCharacter(character)) return null

  const replay = () => {
    const writer = writerRef.current
    if (writer && status === "ready") void writer.animateCharacter()
  }

  return (
    <section className="space-y-3 pt-2">
      <h4 className="font-semibold">Ordem dos traços</h4>
      <div className="w-full max-w-[280px] mx-auto">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-background">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-full border-l border-dashed border-muted-foreground/25" />
            <div className="absolute left-0 top-1/2 w-full border-t border-dashed border-muted-foreground/25" />
            <div className="absolute left-1/2 top-1/2 h-[141%] border-l border-dashed border-muted-foreground/15 -translate-x-1/2 -translate-y-1/2 rotate-45" />
            <div className="absolute left-1/2 top-1/2 h-[141%] border-l border-dashed border-muted-foreground/15 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
          </div>
          <div ref={targetRef} className="relative z-10 h-full w-full" />
          {status === "loading" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-muted-foreground">
              Carregando ordem dos traços...
            </div>
          )}
          {status === "unavailable" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Ordem dos traços não disponível para este caractere.
            </div>
          )}
        </div>
      </div>
      {status === "ready" && (
        <Button type="button" variant="outline" onClick={replay} className="w-full sm:w-auto">
          Animar novamente
        </Button>
      )}
    </section>
  )
}
