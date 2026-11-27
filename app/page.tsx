"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Moon, Sun, BookOpen, Plus, Play, Download, Upload, Library, Trash2, FileText, Search, LoaderCircle } from "lucide-react"
import type { HanziCharacterSearchResult } from "@/lib/hanzi-character"
import { StudyMode } from "@/components/study-mode"
import { ResultsScreen } from "@/components/results-screen"
import { HanziCatalog } from "@/components/hanzi-catalog"

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [studyMode, setStudyMode] = useState<"reading" | "writing">("reading")
  const [view, setView] = useState<"home" | "study" | "results" | "catalog">("home")
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [hanziSearchQuery, setHanziSearchQuery] = useState("")
  const [hanziSearchResults, setHanziSearchResults] = useState<HanziCharacterSearchResult[]>([])
  const [isSearchingHanzi, setIsSearchingHanzi] = useState(false)
  const [hasSearchedHanzi, setHasSearchedHanzi] = useState(false)
  const [hanziSearchError, setHanziSearchError] = useState("")
  const [customCategories, setCustomCategories] = useState<{ id: string; name: string; cards: any[] }[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [studyingErrors, setStudyingErrors] = useState(false)
  const [studyResults, setStudyResults] = useState<any>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const [showClearAllModal, setShowClearAllModal] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true"
    const savedStudyMode = localStorage.getItem("studyMode")
    setDarkMode(savedDarkMode)
    if (savedStudyMode === "writing" || savedStudyMode === "reading") {
      setStudyMode(savedStudyMode)
    }
    if (savedDarkMode) {
      document.documentElement.classList.add("dark")
    }

    const savedCards = localStorage.getItem("hanziFlashcards")
    if (savedCards) {
      setFlashcards(JSON.parse(savedCards))
    }

    const savedCategoryIds = localStorage.getItem("selectedCustomCategoryIds")
    if (savedCategoryIds) {
      try {
        const parsedIds = JSON.parse(savedCategoryIds)
        if (Array.isArray(parsedIds)) setSelectedCategoryIds(parsedIds.filter((id) => typeof id === "string"))
      } catch {
        setSelectedCategoryIds([])
      }
    }

    const savedCategories = localStorage.getItem("customHanziCategories")
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories)
        if (Array.isArray(parsedCategories)) {
          setCustomCategories(parsedCategories.filter((category) =>
            category && typeof category.id === "string" && typeof category.name === "string" && Array.isArray(category.cards),
          ))
        }
      } catch {
        setCustomCategories([])
      }
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

  const toggleStudyCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) => {
      const next = current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
      localStorage.setItem("selectedCustomCategoryIds", JSON.stringify(next))
      return next
    })
  }

  const refreshCustomCategories = () => {
    try {
      const saved = localStorage.getItem("customHanziCategories")
      const parsed = saved ? JSON.parse(saved) : []
      setCustomCategories(Array.isArray(parsed) ? parsed : [])
    } catch {
      setCustomCategories([])
    }
  }

  const selectedCategoryCards = Array.from(
    new Map(
      customCategories
        .filter((category) => selectedCategoryIds.includes(category.id))
        .flatMap((category) => category.cards)
        .map((card) => [card.hanzi, card]),
    ).values(),
  )

  const sessionFlashcards = Array.from(
    new Map([...selectedCategoryCards, ...flashcards].map((card) => [card.hanzi, card])).values(),
  )

  const handleExport = () => {
    const dataStr = JSON.stringify({ flashcards, darkMode, studyMode }, null, 2)
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
        if (data.studyMode === "writing" || data.studyMode === "reading") {
          setStudyMode(data.studyMode)
          localStorage.setItem("studyMode", data.studyMode)
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

  const handleHanziSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = hanziSearchQuery.trim()
    if (!query) return

    setIsSearchingHanzi(true)
    setHanziSearchError("")
    setHanziSearchResults([])
    setHasSearchedHanzi(false)

    try {
      const response = await fetch(`/api/hanzi/search?q=${encodeURIComponent(query)}&limit=12`)
      if (!response.ok) throw new Error("Não foi possível pesquisar agora.")
      const data = await response.json()
      setHanziSearchResults(Array.isArray(data.results) ? data.results : [])
      setHasSearchedHanzi(true)
    } catch {
      setHanziSearchError("Não foi possível pesquisar agora. Tente novamente.")
      setHanziSearchResults([])
    } finally {
      setIsSearchingHanzi(false)
    }
  }

  const handleAddSearchResult = (result: HanziCharacterSearchResult) => {
    if (flashcards.some((card) => card.hanzi === result.character)) return

    handleSaveFlashcards([
      ...flashcards,
      {
        hanzi: result.character,
        pinyin: result.pinyin?.join(", ") ?? "",
        meaning: result.meanings?.join("; ") ?? "",
      },
    ])
  }

  if (view === "study") {
    const cardsToStudy = studyingErrors && studyResults?.incorrect?.length > 0 ? studyResults.incorrect : sessionFlashcards

    return (
        <StudyMode
          flashcards={cardsToStudy}
          studyMode={studyMode}
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
        onClose={() => {
          refreshCustomCategories()
          setView("home")
        }}
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
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-border bg-muted p-1" role="group" aria-label="Modo de estudo">
              <button
                type="button"
                onClick={() => {
                  setStudyMode("reading")
                  localStorage.setItem("studyMode", "reading")
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${studyMode === "reading" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                aria-pressed={studyMode === "reading"}
              >
                Leitura
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudyMode("writing")
                  localStorage.setItem("studyMode", "writing")
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${studyMode === "writing" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                aria-pressed={studyMode === "writing"}
              >
                Escrita
              </button>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Alternar modo escuro">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.38fr)] lg:items-start">
          <div className="min-w-0 space-y-8">
            <div className="text-center space-y-4 lg:text-left">
            <h2 className="text-4xl font-bold text-balance">Domine os Caracteres Chineses</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Aprenda Hanzi de forma eficiente com flashcards interativos. Pesquise e adicione caracteres direto à sua coleção.
            </p>
            </div>

            <section className="rounded-lg border border-border bg-card p-5 sm:p-6" aria-labelledby="hanzi-search-title">
              <div className="mb-4">
                <h3 id="hanzi-search-title" className="text-lg font-semibold">Adicionar Hanzi rapidamente</h3>
                <p className="mt-1 text-sm text-muted-foreground">Pesquise por caractere, pinyin ou significado e adicione direto aos seus flashcards.</p>
              </div>
              <form onSubmit={handleHanziSearch} className="flex flex-col gap-2 sm:flex-row">
                <label htmlFor="home-hanzi-search" className="sr-only">Pesquisar Hanzi, pinyin ou significado</label>
                <div className="relative min-w-0 flex-1">
                  <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="home-hanzi-search"
                    value={hanziSearchQuery}
                    onChange={(event) => setHanziSearchQuery(event.target.value)}
                    placeholder="Ex.: 水, shuǐ ou água"
                    className="pl-9"
                  />
                </div>
                <Button type="submit" disabled={!hanziSearchQuery.trim() || isSearchingHanzi}>
                  {isSearchingHanzi ? <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" /> : <Search aria-hidden="true" className="mr-2 h-4 w-4" />}
                  Pesquisar
                </Button>
              </form>

              <div className="mt-4" aria-live="polite">
                {hanziSearchError && <p className="text-sm text-destructive">{hanziSearchError}</p>}
                {hasSearchedHanzi && hanziSearchResults.length === 0 && !hanziSearchError && (
                  <p className="text-sm text-muted-foreground">Nenhum Hanzi encontrado para essa busca.</p>
                )}
                {hanziSearchResults.length > 0 && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {hanziSearchResults.map((result) => {
                      const alreadyAdded = flashcards.some((card) => card.hanzi === result.character)
                      return (
                        <li key={result.character} className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border p-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span lang="zh" className="text-3xl leading-none">{result.character}</span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{result.pinyin?.join(", ") || "Pinyin indisponível"}</span>
                              <span className="block truncate text-xs text-muted-foreground">{result.meanings?.join("; ") || "Significado indisponível"}</span>
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant={alreadyAdded ? "secondary" : "outline"}
                            size="sm"
                            disabled={alreadyAdded}
                            onClick={() => handleAddSearchResult(result)}
                            aria-label={alreadyAdded ? `${result.character} já está nos flashcards` : `Adicionar ${result.character} aos flashcards`}
                          >
                            {alreadyAdded ? "Adicionado" : <><Plus aria-hidden="true" className="mr-1 h-4 w-4" />Adicionar</>}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </section>

          <div className="border border-border rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Seus Flashcards</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setView("catalog")}>
                  <Library aria-hidden="true" className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Adicionar da biblioteca</span>
                  <span className="sm:hidden">Biblioteca</span>
                </Button>
                {flashcards.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleClearAll}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Tudo
                  </Button>
                )}
              </div>
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
                  <p className="text-xs">Pesquise um caractere acima para começar</p>
              </div>
            )}

            <section className="space-y-4 border-t border-border pt-5" aria-labelledby="study-categories-title">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 id="study-categories-title" className="text-lg font-semibold">Categorias para estudar</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selecione categorias personalizadas para incluir na sessão.
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedCategoryCards.length} {selectedCategoryCards.length === 1 ? "caractere" : "caracteres"} selecionados
                </span>
              </div>

              {customCategories.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {customCategories.map((category) => {
                    const checked = selectedCategoryIds.includes(category.id)
                    return (
                      <label
                        key={category.id}
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${
                          checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStudyCategory(category.id)}
                            className="h-4 w-4 shrink-0 accent-primary"
                          />
                          <span className="truncate font-medium">{category.name}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {category.cards.length} {category.cards.length === 1 ? "card" : "cards"}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border p-4">
                  <p className="text-sm text-muted-foreground">Você ainda não criou categorias personalizadas.</p>
                  <Button variant="outline" size="sm" onClick={() => setView("catalog")}>
                    <Library className="mr-2 h-4 w-4" />
                    Criar categoria
                  </Button>
                </div>
              )}
            </section>

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
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Button
              onClick={() => setView("catalog")}
              className="h-32 flex flex-col gap-2 text-lg bg-transparent"
              variant="outline"
            >
              <Library className="h-8 w-8" />
              <span>Biblioteca</span>
              <span className="text-xs text-muted-foreground">Explore todos os Hanzis</span>
            </Button>

            <Button
              onClick={() => setView("study")}
              disabled={sessionFlashcards.length === 0}
              className="h-32 flex flex-col gap-2 text-lg"
            >
              <Play className="h-8 w-8" />
              <span>Estudar</span>
              <span className="text-xs">
                {sessionFlashcards.length} {sessionFlashcards.length === 1 ? "card" : "cards"}
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
