"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, RotateCw, HelpCircle, Loader2 } from "lucide-react"
import { useSwipeable } from "react-swipeable"
import { TutorialOverlay } from "./tutorial-overlay"

interface StudyModeProps {
  flashcards: any[]
  onComplete: (results: any) => void
  onBack: () => void
  darkMode: boolean
  studyMode: "reading" | "writing"
}

export function StudyMode({ flashcards, onComplete, onBack, studyMode }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correct, setCorrect] = useState<any[]>([])
  const [incorrect, setIncorrect] = useState<any[]>([])
  const [shuffledCards, setShuffledCards] = useState<any[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)

  useEffect(() => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)

    const hasSeenTutorial = localStorage.getItem("hanzi-tutorial-seen")
    if (!hasSeenTutorial) {
      setShowTutorial(true)
    }
  }, [flashcards])

  useEffect(() => {
    setIsTransitioning(true)
    setIsFlipped(false)

    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 50)

    return () => clearTimeout(timer)
  }, [currentIndex])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault()
        handleQuitStudy()
      } else if (e.code === "Space" && !isFlipped) {
        e.preventDefault()
        setIsFlipped(true)
      } else if (e.code === "ArrowRight" && isFlipped) {
        handleCorrect()
      } else if (e.code === "ArrowLeft" && isFlipped) {
        handleIncorrect()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isFlipped, currentIndex])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isFlipped) handleIncorrect()
    },
    onSwipedRight: () => {
      if (isFlipped) handleCorrect()
    },
    onTap: () => {
      if (!isFlipped) {
        setIsFlipped(true)
      }
    },
    trackMouse: true,
  })

  const handleCorrect = () => {
    setExitDirection("right")
    setTimeout(() => {
      const updatedCorrect = [...correct, shuffledCards[currentIndex]]
      setCorrect(updatedCorrect)
      moveToNext(updatedCorrect, incorrect)
      setExitDirection(null)
    }, 300)
  }

  const handleIncorrect = () => {
    setExitDirection("left")
    setTimeout(() => {
      const updatedIncorrect = [...incorrect, shuffledCards[currentIndex]]
      setIncorrect(updatedIncorrect)
      moveToNext(correct, updatedIncorrect)
      setExitDirection(null)
    }, 300)
  }

  const moveToNext = (currentCorrect: any[], currentIncorrect: any[]) => {
    if (currentIndex + 1 >= shuffledCards.length) {
      onComplete({ correct: currentCorrect, incorrect: currentIncorrect, unstudied: [] })
    } else {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 100)
    }
  }

  const handleQuitStudy = () => {
    setShowQuitModal(true)
  }

  const handleConfirmQuit = () => {
    setIsProcessing(true)
    setShowQuitModal(false)

    setTimeout(() => {
      const unstudied = shuffledCards.slice(currentIndex)
      onComplete({ correct, incorrect, unstudied })
      setIsProcessing(false)
    }, 100)
  }

  const handleCloseTutorial = () => {
    setShowTutorial(false)
    localStorage.setItem("hanzi-tutorial-seen", "true")
  }

  const handleShowTutorial = () => {
    setShowTutorial(true)
  }

  if (shuffledCards.length === 0) {
    return <div>Carregando...</div>
  }

  const currentCard = shuffledCards[currentIndex]
  const remaining = shuffledCards.length - currentIndex - 1

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showTutorial && <TutorialOverlay onClose={handleCloseTutorial} />}

      {showQuitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Encerrar Estudo</h3>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja encerrar o estudo? Seu progresso até aqui será salvo.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowQuitModal(false)} className="flex-1">
                Continuar Estudando
              </Button>
              <Button variant="destructive" onClick={handleConfirmQuit} className="flex-1">
                Encerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border-2 border-border rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Processando resultados...</p>
          </div>
        </div>
      )}

      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleShowTutorial} className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Como utilizar?
          </Button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {shuffledCards.length}
          </div>
          <div className="w-[120px]" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative" style={{ perspective: "1200px", minHeight: "450px" }}>
            {shuffledCards.slice(currentIndex).map((card, stackIndex) => {
              const isActive = stackIndex === 0
              const maxVisibleCards = 8

              if (stackIndex >= maxVisibleCards) return null

              return (
                <div
                  key={`stack-${currentIndex + stackIndex}`}
                  className={`absolute inset-0 border-2 rounded-xl ${
                    isActive ? "border-border bg-card shadow-2xl" : "border-border/50 bg-card/80"
                  }`}
                  style={{
                    transform: `
                      translateY(${stackIndex * 6}px) 
                      translateX(${stackIndex * 3}px) 
                      scale(${1 - stackIndex * 0.02})
                      rotateX(${stackIndex * 1}deg)
                      ${isActive && exitDirection === "left" ? "translateX(-150%) rotate(-20deg)" : ""}
                      ${isActive && exitDirection === "right" ? "translateX(150%) rotate(20deg)" : ""}
                    `,
                    zIndex: maxVisibleCards - stackIndex,
                    opacity: Math.max(0.3, 1 - stackIndex * 0.1),
                    transition:
                      isActive && exitDirection
                        ? "transform 0.3s ease-out, opacity 0.3s ease-out"
                        : isActive
                          ? "none"
                          : "transform 0.3s ease, opacity 0.3s ease",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  {isActive && !isTransitioning && (
                    <div
                      {...swipeHandlers}
                      className="w-full h-full cursor-pointer"
                      style={{
                        aspectRatio: "3/4",
                        minHeight: "400px",
                        transformStyle: "preserve-3d",
                        transition: "transform 0.6s",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-card border-2 border-border rounded-xl shadow-xl flex items-center justify-center p-8"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(0deg)",
                        }}
                      >
                        <div className="text-center">
                          {studyMode === "reading" ? (
                            <div className="text-8xl mb-8" style={{ fontFamily: "serif" }}>
                              {currentCard.hanzi}
                            </div>
                          ) : (
                            <div className="text-center space-y-4 mb-8">
                              <div className="text-3xl font-semibold text-foreground">{currentCard.meaning}</div>
                              {currentCard.pinyin && <div className="text-xl text-primary">{currentCard.pinyin}</div>}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <RotateCw className="h-4 w-4" />
                            Pressione <kbd className="px-2 py-1 bg-muted rounded">Espaço</kbd> ou toque para virar
                          </div>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 bg-card border-2 border-primary rounded-xl shadow-2xl flex items-center justify-center p-8"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                        }}
                      >
                        <div className="text-center space-y-4">
                          {studyMode === "writing" ? (
                            <>
                              <div className="text-7xl mb-4" style={{ fontFamily: "serif" }}>
                                {currentCard.hanzi}
                              </div>
                              {currentCard.pinyin && (
                                <div className="text-2xl text-primary font-semibold">{currentCard.pinyin}</div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="text-6xl mb-4" style={{ fontFamily: "serif" }}>
                                {currentCard.hanzi}
                              </div>
                              {currentCard.pinyin && (
                                <div className="text-2xl text-primary font-semibold">{currentCard.pinyin}</div>
                              )}
                              <div className="text-xl text-muted-foreground">{currentCard.meaning}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!isActive && (
                    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: "400px" }}>
                      <div className="text-6xl opacity-50" style={{ fontFamily: "serif" }}>
                        {card.hanzi}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex gap-4">
            <Button
              onClick={handleIncorrect}
              variant="destructive"
              className="flex-1 h-16 text-lg"
              disabled={!isFlipped}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Errei
            </Button>
            <Button onClick={handleCorrect} className="flex-1 h-16 text-lg" disabled={!isFlipped}>
              Acertei
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mt-4">
            <Button variant="outline" onClick={handleQuitStudy} className="w-full h-12 text-base bg-transparent">
              Encerrar Estudo (ESC)
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Web:</strong> Espaço para virar, ← para errado, → para certo
            </p>
            <p>
              <strong>Mobile:</strong> Toque para virar, deslize para responder
            </p>
          </div>

          {remaining > 0 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {remaining} {remaining === 1 ? "card restante" : "cards restantes"}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
