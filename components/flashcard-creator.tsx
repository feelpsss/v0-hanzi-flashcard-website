"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trash2, RotateCw } from "lucide-react"
import { PINYIN_TO_HANZI } from "@/lib/hanzi-data"

interface FlashcardCreatorProps {
  flashcards: any[]
  onSave: (cards: any[]) => void
  onBack: () => void
  darkMode: boolean
  onClearAll: () => void
  onStartStudy?: () => void // Added prop to trigger study mode
}

export function FlashcardCreator({ flashcards, onSave, onBack, onClearAll, onStartStudy }: FlashcardCreatorProps) {
  const [cards, setCards] = useState(flashcards)
  const [newCard, setNewCard] = useState({ hanzi: "", pinyin: "", meaning: "" })
  const [suggestions, setSuggestions] = useState<Array<{ hanzi: string; meaning: string; pinyin: string }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)

  const handleHanziInput = (value: string) => {
    setNewCard({ ...newCard, hanzi: value })

    // Check if input is romanized (pinyin)
    const isPinyin = /^[a-zA-Z]+$/.test(value)

    if (isPinyin && value.length > 0) {
      const normalizedPinyin = value.toLowerCase()
      const matches = PINYIN_TO_HANZI[normalizedPinyin] || []

      // Also check for partial matches
      const partialMatches = Object.entries(PINYIN_TO_HANZI)
        .filter(([key]) => key.startsWith(normalizedPinyin) && key !== normalizedPinyin)
        .flatMap(([_, values]) => values)
        .slice(0, 5)

      const allSuggestions = [...matches, ...partialMatches].slice(0, 8)

      if (allSuggestions.length > 0) {
        setSuggestions(allSuggestions)
        setShowSuggestions(true)
        setSelectedSuggestionIndex(0)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (hanzi: string, meaning: string, pinyin: string) => {
    setNewCard({ hanzi, pinyin, meaning })
    setShowSuggestions(false)
  }

  const handleAddCard = () => {
    if (newCard.hanzi.trim()) {
      const isDuplicate = cards.some((card) => card.hanzi === newCard.hanzi)

      if (isDuplicate) {
        alert(`O caractere "${newCard.hanzi}" já foi adicionado!`)
        return
      }

      const cardToAdd = {
        ...newCard,
        id: Date.now(),
      }
      const updatedCards = [...cards, cardToAdd]
      setCards(updatedCards)
      onSave(updatedCards)
      setNewCard({ hanzi: "", pinyin: "", meaning: "" })
      setShowSuggestions(false)
    }
  }

  const handleDeleteCard = (index: number) => {
    const updatedCards = cards.filter((_, i) => i !== index)
    setCards(updatedCards)
    onSave(updatedCards)
  }

  const handleClearAllWrapper = () => {
    if (window.confirm("Tem certeza que deseja remover todos os flashcards? Esta ação não pode ser desfeita.")) {
      setCards([])
      onClearAll()
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            {cards.length > 0 && onStartStudy && (
              <Button onClick={onStartStudy} className="gap-2">
                <RotateCw className="h-4 w-4" />
                Iniciar Estudo
              </Button>
            )}
            {cards.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearAllWrapper}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Criar Flashcards</h2>
            <p className="text-muted-foreground">
              Digite em pinyin para ver sugestões de hanzi. Pinyin e significado serão preenchidos automaticamente.
            </p>
          </div>

          <div className="border border-border rounded-lg p-6 bg-card space-y-4">
            <h3 className="text-xl font-semibold">Novo Flashcard</h3>
            <div className="space-y-3">
              <div className="relative">
                <label className="text-sm font-medium mb-1 block">Hanzi *</label>
                <Input
                  placeholder="Digite pinyin: ex. ni, hao"
                  value={newCard.hanzi}
                  onChange={(e) => handleHanziInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (showSuggestions && suggestions.length > 0) {
                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length)
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault()
                        setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
                      } else if (e.key === "Enter") {
                        e.preventDefault()
                        const selected = suggestions[selectedSuggestionIndex]
                        handleSelectSuggestion(selected.hanzi, selected.meaning, selected.pinyin)
                      } else if (e.key === "Escape") {
                        setShowSuggestions(false)
                      }
                    } else if (e.key === "Enter") {
                      handleAddCard()
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow click on suggestion
                    setTimeout(() => setShowSuggestions(false), 200)
                  }}
                  className="text-2xl"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion.hanzi, suggestion.meaning, suggestion.pinyin)}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 border-b border-border last:border-b-0 ${
                          index === selectedSuggestionIndex ? "bg-accent" : "hover:bg-accent"
                        }`}
                      >
                        <span className="text-3xl">{suggestion.hanzi}</span>
                        <div className="flex-1">
                          <div className="text-sm text-primary">{suggestion.pinyin}</div>
                          <div className="text-sm text-muted-foreground">{suggestion.meaning}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Pinyin</label>
                <Input
                  placeholder="Preenchido automaticamente"
                  value={newCard.pinyin}
                  onChange={(e) => setNewCard({ ...newCard, pinyin: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCard()
                  }}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Significado</label>
                <Input
                  placeholder="Preenchido automaticamente"
                  value={newCard.meaning}
                  onChange={(e) => setNewCard({ ...newCard, meaning: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCard()
                  }}
                />
              </div>
              <Button onClick={handleAddCard} className="w-full" disabled={!newCard.hanzi}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Flashcard
              </Button>
            </div>
          </div>

          {cards.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Seus Flashcards ({cards.length})</h3>
              <div className="grid gap-3">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 bg-card flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{card.hanzi}</div>
                      <div>
                        <div className="text-sm text-muted-foreground">{card.pinyin || "Sem pinyin"}</div>
                        <div className="text-sm">{card.meaning || "Sem significado"}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
