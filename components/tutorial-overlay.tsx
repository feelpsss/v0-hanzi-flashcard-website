"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, RotateCw, ArrowLeft } from "lucide-react"

interface TutorialOverlayProps {
  onClose: () => void
}

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(1)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleSkip} />

      {/* Tutorial Content */}
      <div className="relative bg-card border-2 border-primary rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 z-10">
        <Button variant="ghost" size="icon" onClick={handleSkip} className="absolute top-4 right-4 h-8 w-8">
          <X className="h-4 w-4" />
        </Button>

        <div className="space-y-6">
          {/* Step indicator */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-primary" : "w-2 bg-muted"}`}
              />
            ))}
          </div>

          {/* Step 1: Card functionality */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Bem-vindo ao estudo!</h2>
              <div className="flex justify-center">
                <div className="relative w-48 h-64 border-2 border-primary rounded-xl bg-card shadow-lg flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl" style={{ fontFamily: "serif" }}>
                      好
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <RotateCw className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">Como funciona o flashcard?</p>
                <p className="text-muted-foreground">
                  Clique no card ou pressione <kbd className="px-2 py-1 bg-muted rounded text-sm">Espaço</kbd> para
                  virar e revelar o pinyin e significado.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Correct/Incorrect buttons */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Avaliar seu conhecimento</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 bg-destructive/10 border-2 border-destructive rounded-lg p-4 flex items-center gap-3">
                    <ArrowLeft className="h-6 w-6 text-destructive flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-destructive">Errei</p>
                      <p className="text-muted-foreground">Não sabia a resposta</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-primary/10 border-2 border-primary rounded-lg p-4 flex items-center gap-3">
                    <div className="text-sm">
                      <p className="font-semibold text-primary">Acertei</p>
                      <p className="text-muted-foreground">Sabia a resposta</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary flex-shrink-0" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">Responda honestamente!</p>
                <p className="text-muted-foreground">
                  Após virar o card, indique se você acertou ou errou. Use as setas ← → no teclado ou deslize no mobile.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Quit study */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Encerrar o estudo</h2>
              <div className="flex justify-center">
                <div className="bg-muted/50 border-2 border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <kbd className="px-3 py-2 bg-card border border-border rounded text-lg font-mono shadow-sm">
                      ESC
                    </kbd>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pressione ESC a qualquer momento</p>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg">Precisa parar?</p>
                <p className="text-muted-foreground">
                  Pressione <kbd className="px-2 py-1 bg-muted rounded text-sm">ESC</kbd> ou clique em "Encerrar estudo"
                  para ver seus resultados até o momento.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button onClick={handlePrevious} variant="outline" className="flex-1 bg-transparent">
                Anterior
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step === 3 ? "Começar!" : "Próximo"}
            </Button>
          </div>

          <div className="text-center">
            <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground">
              Pular tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
