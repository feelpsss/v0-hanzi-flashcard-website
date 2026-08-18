"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, BookOpen, Plus, Play, Download, Upload, Library, Trash2, X, FileText } from "lucide-react"
import { FlashcardCreator } from "@/components/flashcard-creator"
import { StudyMode } from "@/components/study-mode"
import { ResultsScreen } from "@/components/results-screen"
import { HanziCatalog } from "@/components/hanzi-catalog"

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [view, setView] = useState<"home" | "create" | "study" | "results" | "catalog">("home")
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [studyingErrors, setStudyingErrors] = useState(false)
  const [studyResults, setStudyResults] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [showClearAllModal, setShowClearAllModal] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedDarkMode)
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    }

    const savedCards = localStorage.getItem("hanziFlashcards")
    if (savedCards) {
      setFlashcards(JSON.parse(savedCards))
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleSaveFlashcards = (cards: any[]) => {
    setFlashcards(cards)
    localStorage.setItem("hanziFlashcards", JSON.stringify(cards))
  }

  const handleStudyComplete = (results: any) => {
    setStudyResults(results)
    setView("results")
  }

  const handleExport = () => {
    const dataStr = JSON.stringify({ flashcards, darkMode }, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "hanzi-flashcards.json"
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (flashcards.length > 0) {
        setPendingImportFile(file)
        setShowImportModal(true)
      } else {
        processImport(file)
      }
    }
    event.target.value = ""
  }

  const processImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.flashcards) {
          setFlashcards(data.flashcards)
          localStorage.setItem("hanziFlashcards", JSON.stringify(data.flashcards))
        }
        if (data.darkMode !== undefined) {
          setDarkMode(data.darkMode)
          localStorage.setItem("darkMode", String(data.darkMode))
          if (data.darkMode) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
        }
      } catch (error) {
        alert("Erro ao importar arquivo")
      }
    }
    reader.readAsText(file)
  }

  const confirmImport = () => {
    if (pendingImportFile) {
      processImport(pendingImportFile)
      setPendingImportFile(null)
    }
    setShowImportModal(false)
  }

  const cancelImport = () => {
    setPendingImportFile(null)
    setShowImportModal(false)
  }

  const handleClearAll = () => {
    setShowClearAllModal(true)
  }

  const confirmClearAll = () => {
    setFlashcards([])
    localStorage.setItem("hanziFlashcards", JSON.stringify([]))
    setShowClearAllModal(false)
  }

  const cancelClearAll = () => {
    setShowClearAllModal(false)
  }

  const handleAddFromCatalog = (hanzis: any[]) => {
    const existingHanzis = new Set(flashcards.map((card) => card.hanzi))
    const uniqueNewCards = hanzis.filter((card) => !existingHanzis.has(card.hanzi))

    if (uniqueNewCards.length === 0) {
      alert("Todos os caracteres selecionados já foram adicionados!")
      return
    }

    if (uniqueNewCards.length < hanzis.length) {
      alert(`${hanzis.length - uniqueNewCards.length} caractere(s) duplicado(s) foram ignorados.`)
    }

    const newCards = [...flashcards, ...uniqueNewCards]
    handleSaveFlashcards(newCards)
    setView("home")
  }

  const handleRemoveCardByHanzi = (hanzi: string) => {
    const newCards = flashcards.filter((card) => card.hanzi !== hanzi)
    handleSaveFlashcards(newCards)
  }

  const handleDeleteCard = (index: number) => {
    const newCards = flashcards.filter((_, i) => i !== index)
    handleSaveFlashcards(newCards)
  }

  const handleCreateClick = () => {
    setShowCreateModal(true)
  }

  const handleManualCreate = () => {
    setShowCreateModal(false)
    setView("create")
  }

  const handleCatalogCreate = () => {
    setShowCreateModal(false)
    setView("catalog")
  }

  if (view === "create") {
    return (
      <FlashcardCreator
        flashcards={flashcards}
        onSave={handleSaveFlashcards}
        onBack={() => setView("home")}
        darkMode={darkMode}
        onClearAll={handleClearAll}
        onStartStudy={() => setView("study")}
      />
    )
  }

  if (view === "study") {
    const cardsToStudy = studyingErrors && studyResults?.incorrect?.length > 0 ? studyResults.incorrect : flashcards

    return (
      <StudyMode
        flashcards={cardsToStudy}
        onComplete={handleStudyComplete}
        onBack={() => {
          setView("home")
          setStudyingErrors(false)
        }}
        darkMode={darkMode}
      />
    )
  }

  if (view === "results") {
    return (
      <ResultsScreen
        results={studyResults}
        onRestart={() => {
          setStudyingErrors(false)
          setView("study")
        }}
        onRestartErrors={() => {
          setStudyingErrors(true)
          setView("study")
        }}
        onHome={() => {
          setView("home")
          setStudyingErrors(false)
        }}
        darkMode={darkMode}
      />
    )
  }

  if (view === "catalog") {
    return (
      <HanziCatalog
        onAddCards={handleAddFromCatalog}
        onClose={() => setView("home")}
        existingFlashcards={flashcards}
        onRemoveCard={handleRemoveCardByHanzi}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Hanzi Flashcards</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Alternar modo escuro">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-balance">Domine os Caracteres Chineses</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Aprenda Hanzi de forma eficiente com flashcards interativos. Escolha caracteres do catálogo ou crie seus
              próprios.
            </p>
          </div>

          <div className="border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Seus Flashcards</h3>
              {flashcards.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Tudo
                </Button>
              )}
            </div>

            {flashcards.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {flashcards.slice(0, 20).map((card, index) => (
                    <div
                      key={index}
                      className="group relative w-12 h-12 border border-border rounded flex items-center justify-center text-2xl bg-card hover:shadow-md transition-shadow"
                    >
                      {card.hanzi}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCard(index)
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
                        aria-label={`Remover ${card.hanzi}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {flashcards.length > 20 && (
                    <div className="w-12 h-12 border border-border rounded flex items-center justify-center text-sm text-muted-foreground bg-card">
                      +{flashcards.length - 20}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <FileText className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">Nenhum flashcard adicionado ainda</p>
                <p className="text-xs">Comece criando seus flashcards abaixo</p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button
                onClick={handleExport}
                disabled={flashcards.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Exportar flashcards
              </Button>
              <Button
                onClick={() => document.getElementById("import-input")?.click()}
                className="flex-1 flex items-center justify-center gap-2"
                variant="outline"
              >
                <Upload className="h-4 w-4" />
                Importar flashcards
              </Button>
              <input id="import-input" type="file" accept=".json" onChange={handleImport} className="hidden" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Button
              onClick={handleCreateClick}
              className="h-32 flex flex-col gap-2 text-lg bg-transparent"
              variant="outline"
            >
              <Plus className="h-8 w-8" />
              <span>Criar Flashcards</span>
              <span className="text-xs text-muted-foreground">Adicione caracteres</span>
            </Button>

            <Button
              onClick={() => setView("study")}
              disabled={flashcards.length === 0}
              className="h-32 flex flex-col gap-2 text-lg"
            >
              <Play className="h-8 w-8" />
              <span>Estudar</span>
              <span className="text-xs">
                {flashcards.length} {flashcards.length === 1 ? "card" : "cards"}
              </span>
            </Button>
          </div>
        </div>
      </main>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Confirmar Importação</h3>
            <p className="text-muted-foreground mb-2">
              Você já tem {flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""} selecionado
              {flashcards.length !== 1 ? "s" : ""}. Importar um arquivo irá sobrescrever todos os flashcards atuais.
            </p>
            <p className="text-sm text-destructive font-medium mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button onClick={cancelImport} variant="outline" className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button onClick={confirmImport} variant="destructive" className="flex-1">
                Confirmar Importação
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl p-8 max-w-2xl w-full shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 mb-6">
              <h3 className="text-2xl font-bold">Como deseja adicionar flashcards?</h3>
              <p className="text-muted-foreground">Escolha entre criar manualmente ou selecionar do catálogo</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={handleManualCreate}
                className="group border-2 border-border hover:border-primary rounded-lg p-6 space-y-4 transition-all hover:shadow-lg bg-card"
              >
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-semibold">Adicionar Manualmente</h4>
                  <p className="text-sm text-muted-foreground">
                    Digite o pinyin e selecione os caracteres com autocomplete
                  </p>
                </div>
              </button>

              <button
                onClick={handleCatalogCreate}
                className="group border-2 border-border hover:border-primary rounded-lg p-6 space-y-4 transition-all hover:shadow-lg bg-card"
              >
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Library className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-semibold">Selecionar do Catálogo</h4>
                  <p className="text-sm text-muted-foreground">
                    Escolha entre mais de 1000 caracteres organizados por categoria
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-semibold mb-4">Limpar Todos os Flashcards</h3>
            <p className="text-muted-foreground mb-2">
              Tem certeza que deseja remover todos os {flashcards.length} flashcard{flashcards.length !== 1 ? "s" : ""}?
            </p>
            <p className="text-sm text-destructive font-medium mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button onClick={cancelClearAll} variant="outline" className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button onClick={confirmClearAll} variant="destructive" className="flex-1">
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
