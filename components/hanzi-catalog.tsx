"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import type { DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { HanziStrokeOrder } from "@/components/hanzi-stroke-order"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Plus, Check, X, FolderPlus, Trash2, Star } from "lucide-react"
import { HANZI_CATALOG } from "@/lib/hanzi-data"
import { cn } from "@/lib/utils"
import type { HanziCharacterSearchResult } from "@/lib/hanzi-character"

interface HanziCatalogProps {
  flashcards?: any[]
  onAddCards: (cards: any[]) => void
  onClose: () => void
  existingFlashcards: any[]
  onRemoveCard?: (hanzi: string) => void
  onRemoveFlashcard?: (hanzi: string) => void
}

export function HanziCatalog({
  flashcards = [],
  onAddCards,
  onClose,
  existingFlashcards,
  onRemoveCard,
  onRemoveFlashcard,
}: HanziCatalogProps) {
  const [selectedCards, setSelectedCards] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [snackbar, setSnackbar] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  })
  const [showSnackbar, setShowSnackbar] = useState(false) // From updates

  const [customCategories, setCustomCategories] = useState<
    { id: string; name: string; cards: any[] }[]
  >([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categorySelection, setCategorySelection] = useState<any[]>([])
  const [categoryModalSearch, setCategoryModalSearch] = useState("")
  const [customCategorySearch, setCustomCategorySearch] = useState<Record<string, string>>({})
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)
  const [broadResults, setBroadResults] = useState<HanziCharacterSearchResult[]>([])
  const [broadSearchLoading, setBroadSearchLoading] = useState(false)
  const [broadSearchError, setBroadSearchError] = useState(false)
  const [broadSearchHasMore, setBroadSearchHasMore] = useState(false)
  const broadSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const broadSearchControllerRef = useRef<AbortController | null>(null)
  const broadSearchRequestRef = useRef(0)
  const activeTabBeforeSearchRef = useRef<string | null>(null)
  const [selectedBroadHanzi, setSelectedBroadHanzi] = useState<HanziCharacterSearchResult | null>(null)
  const [customCategorySearchResults, setCustomCategorySearchResults] = useState<Record<string, HanziCharacterSearchResult[]>>({})
  const [customCategorySearchLoading, setCustomCategorySearchLoading] = useState<Record<string, boolean>>({})
  const [customCategorySearchError, setCustomCategorySearchError] = useState<Record<string, boolean>>({})
  const [customCategorySearchHasMore, setCustomCategorySearchHasMore] = useState<Record<string, boolean>>({})
  const customSearchTimersRef = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const customSearchControllersRef = useRef(new Map<string, AbortController>())
  const customSearchRequestsRef = useRef(new Map<string, number>())
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null)

  useEffect(() => {
    let savedCategories: { id: string; name: string; cards: any[] }[] = []
    const saved = localStorage.getItem("customHanziCategories")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) savedCategories = parsed
      } catch {
        // ignore corrupted data
      }
    }

    if (localStorage.getItem("basic-one-category-migrated") !== "true") {
      const legacyCards = HANZI_CATALOG.aulas ?? []
      if (legacyCards.length > 0 && !savedCategories.some((category) => category.name === "Básico 1")) {
        savedCategories = [...savedCategories, { id: "cat-basic-one", name: "Básico 1", cards: legacyCards }]
        localStorage.setItem("customHanziCategories", JSON.stringify(savedCategories))
      }
      localStorage.setItem("basic-one-category-migrated", "true")
    }

    setCustomCategories(savedCategories)
    void runBroadSearch("")
  }, [])

  useEffect(() => () => {
    if (broadSearchTimerRef.current) clearTimeout(broadSearchTimerRef.current)
    broadSearchControllerRef.current?.abort()
    customSearchTimersRef.current.forEach((timer) => clearTimeout(timer))
    customSearchControllersRef.current.forEach((controller) => controller.abort())
  }, [])

  const runBroadSearch = async (query: string, offset = 0, append = false) => {
    const requestId = ++broadSearchRequestRef.current
    broadSearchControllerRef.current?.abort()
    const controller = new AbortController()
    broadSearchControllerRef.current = controller
    setBroadSearchLoading(true)
    setBroadSearchError(false)

    try {
      const response = await fetch(
        `/api/hanzi/search?q=${encodeURIComponent(query)}&limit=50&offset=${offset}`,
        { signal: controller.signal },
      )
      if (!response.ok) throw new Error("Search request failed")
      const payload = (await response.json()) as { results: HanziCharacterSearchResult[]; hasMore: boolean }
      if (requestId !== broadSearchRequestRef.current) return
      setBroadResults((current) => append ? [...current, ...payload.results] : payload.results)
      setBroadSearchHasMore(payload.hasMore)
    } catch {
      if (!controller.signal.aborted && requestId === broadSearchRequestRef.current) {
        if (!append) {
          setBroadResults([])
          setBroadSearchHasMore(false)
        }
        setBroadSearchError(true)
      }
    } finally {
      if (requestId === broadSearchRequestRef.current) setBroadSearchLoading(false)
    }
  }

  const handleLibrarySearchChange = (value: string) => {
    if (!searchTerm.trim() && value.trim()) activeTabBeforeSearchRef.current = activeTab
    setSearchTerm(value)
    if (broadSearchTimerRef.current) clearTimeout(broadSearchTimerRef.current)
    broadSearchControllerRef.current?.abort()
    broadSearchRequestRef.current += 1
    setBroadResults([])
    setBroadSearchHasMore(false)
    setBroadSearchError(false)

    const query = value.trim()
    if (!query) {
      const previousTab = activeTabBeforeSearchRef.current
      if (previousTab) setActiveTab(previousTab)
      activeTabBeforeSearchRef.current = null
      if (!previousTab || previousTab === "all") void runBroadSearch("")
      else setBroadSearchLoading(false)
      return
    }

    setActiveTab("all")
    setBroadSearchLoading(true)
    broadSearchTimerRef.current = setTimeout(() => void runBroadSearch(query), 140)
  }

  const loadMoreBroadResults = () => {
    if (!broadSearchLoading && broadSearchHasMore) {
      void runBroadSearch(searchTerm.trim(), broadResults.length, true)
    }
  }

  const runCustomCategorySearch = async (categoryId: string, query: string, offset = 0, append = false) => {
    const requestId = (customSearchRequestsRef.current.get(categoryId) ?? 0) + 1
    customSearchRequestsRef.current.set(categoryId, requestId)
    customSearchControllersRef.current.get(categoryId)?.abort()
    const controller = new AbortController()
    customSearchControllersRef.current.set(categoryId, controller)
    setCustomCategorySearchLoading((current) => ({ ...current, [categoryId]: true }))
    setCustomCategorySearchError((current) => ({ ...current, [categoryId]: false }))

    try {
      const response = await fetch(
        `/api/hanzi/search?q=${encodeURIComponent(query)}&limit=50&offset=${offset}`,
        { signal: controller.signal },
      )
      if (!response.ok) throw new Error("Search request failed")
      const payload = (await response.json()) as { results: HanziCharacterSearchResult[]; hasMore: boolean }
      if (requestId !== customSearchRequestsRef.current.get(categoryId)) return
      setCustomCategorySearchResults((current) => ({
        ...current,
        [categoryId]: append ? [...(current[categoryId] ?? []), ...payload.results] : payload.results,
      }))
      setCustomCategorySearchHasMore((current) => ({ ...current, [categoryId]: payload.hasMore }))
    } catch {
      if (!controller.signal.aborted && requestId === customSearchRequestsRef.current.get(categoryId)) {
        if (!append) {
          setCustomCategorySearchResults((current) => ({ ...current, [categoryId]: [] }))
          setCustomCategorySearchHasMore((current) => ({ ...current, [categoryId]: false }))
        }
        setCustomCategorySearchError((current) => ({ ...current, [categoryId]: true }))
      }
    } finally {
      if (requestId === customSearchRequestsRef.current.get(categoryId)) {
        setCustomCategorySearchLoading((current) => ({ ...current, [categoryId]: false }))
      }
    }
  }

  const handleCustomCategorySearchChange = (categoryId: string, value: string) => {
    setCustomCategorySearch((current) => ({ ...current, [categoryId]: value }))
    const timer = customSearchTimersRef.current.get(categoryId)
    if (timer) clearTimeout(timer)
    customSearchControllersRef.current.get(categoryId)?.abort()
    customSearchRequestsRef.current.set(categoryId, (customSearchRequestsRef.current.get(categoryId) ?? 0) + 1)
    setCustomCategorySearchResults((current) => ({ ...current, [categoryId]: [] }))
    setCustomCategorySearchHasMore((current) => ({ ...current, [categoryId]: false }))
    setCustomCategorySearchError((current) => ({ ...current, [categoryId]: false }))

    const query = value.trim()
    if (!query) {
      setCustomCategorySearchLoading((current) => ({ ...current, [categoryId]: false }))
      return
    }

    setCustomCategorySearchLoading((current) => ({ ...current, [categoryId]: true }))
    customSearchTimersRef.current.set(categoryId, setTimeout(() => {
      void runCustomCategorySearch(categoryId, query)
    }, 140))
  }

  const loadMoreCustomCategoryResults = (categoryId: string) => {
    const results = customCategorySearchResults[categoryId] ?? []
    if (!customCategorySearchLoading[categoryId] && customCategorySearchHasMore[categoryId]) {
      void runCustomCategorySearch(categoryId, (customCategorySearch[categoryId] ?? "").trim(), results.length, true)
    }
  }

  const handleCardDragStart = (event: DragEvent<HTMLElement>, card: any) => {
    const draggedCard = "character" in card
      ? { hanzi: card.character, pinyin: card.pinyin?.join(", ") ?? "", meaning: card.meanings?.join("; ") ?? "" }
      : { hanzi: card.hanzi, pinyin: card.pinyin ?? "", meaning: card.meaning ?? "" }
    event.dataTransfer.setData("text/plain", JSON.stringify(draggedCard))
    event.dataTransfer.effectAllowed = "copy"
  }

  const handleCategoryDragOver = (event: DragEvent<HTMLElement>, categoryId: string) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setDragOverCategoryId((current) => current === categoryId ? current : categoryId)
  }

  const handleCategoryDrop = (event: DragEvent<HTMLElement>, categoryId: string) => {
    event.preventDefault()
    setDragOverCategoryId(null)
    try {
      const droppedCard = JSON.parse(event.dataTransfer.getData("text/plain")) as { hanzi?: string; pinyin?: string; meaning?: string }
      if (typeof droppedCard.hanzi !== "string" || !droppedCard.hanzi) return
      addCardToCustomCategory(categoryId, {
        hanzi: droppedCard.hanzi,
        pinyin: typeof droppedCard.pinyin === "string" ? droppedCard.pinyin : "",
        meaning: typeof droppedCard.meaning === "string" ? droppedCard.meaning : "",
      })
    } catch {
      setDragOverCategoryId(null)
    }
  }

  const persistCustomCategories = (categories: { id: string; name: string; cards: any[] }[]) => {
    setCustomCategories(categories)
    localStorage.setItem("customHanziCategories", JSON.stringify(categories))
  }

  // Unique list of every character in the built-in catalog, used to pick cards for a custom category
  const allCatalogCards = useMemo(() => {
    const map = new Map<string, any>()
    Object.values(HANZI_CATALOG)
      .flat()
      .forEach((card) => {
        if (!map.has(card.hanzi)) map.set(card.hanzi, card)
      })
    return Array.from(map.values())
  }, [])

  const openCategoryModal = () => {
    setNewCategoryName("")
    setCategorySelection([])
    setCategoryModalSearch("")
    setShowCategoryModal(true)
  }

  const toggleCategorySelection = (card: any) => {
    setCategorySelection((prev) =>
      prev.some((c) => c.hanzi === card.hanzi)
        ? prev.filter((c) => c.hanzi !== card.hanzi)
        : [...prev, card],
    )
  }

  const handleCreateCategory = () => {
    const name = newCategoryName.trim()
    if (!name || categorySelection.length === 0) return
    const newCategory = {
      id: `cat-${Date.now()}`,
      name,
      cards: categorySelection,
    }
    persistCustomCategories([...customCategories, newCategory])
    setShowCategoryModal(false)
    const newCategoryTab = `custom-${newCategory.id}`
    if (searchTerm.trim()) {
      activeTabBeforeSearchRef.current = newCategoryTab
      setActiveTab("all")
    } else {
      setActiveTab(newCategoryTab)
    }
  }

  const addCardToCustomCategory = (categoryId: string, card: any) => {
    const updatedCategories = customCategories.map((category) =>
      category.id === categoryId && !category.cards.some((existingCard) => existingCard.hanzi === card.hanzi)
        ? { ...category, cards: [...category.cards, card] }
        : category,
    )
    persistCustomCategories(updatedCategories)
  }

  const handleDeleteCategory = (id: string) => {
    const remaining = customCategories.filter((c) => c.id !== id)
    persistCustomCategories(remaining)
    setCategoryToDelete(null)
    if (activeTab === `custom-${id}`) {
      setActiveTab("aulas")
    }
  }

  const filteredCategoryModalCards = useMemo(() => {
    if (!categoryModalSearch) return allCatalogCards
    const term = categoryModalSearch.toLowerCase()
    return allCatalogCards.filter(
      (card) =>
        card.hanzi.includes(categoryModalSearch) ||
        card.pinyin.toLowerCase().includes(term) ||
        card.meaning.toLowerCase().includes(term),
    )
  }, [allCatalogCards, categoryModalSearch])

  const isAlreadyAdded = (hanzi: string) => {
    // Use existingFlashcards if onRemoveCard is provided, otherwise check against flashcards (from updates)
    const cardsToCheck = onRemoveCard ? existingFlashcards : flashcards
    return cardsToCheck.some((card) => card.hanzi === hanzi)
  }

  const toggleCard = (card: any) => {
    if (isAlreadyAdded(card.hanzi)) {
      // Prioritize onRemoveFlashcard from updates if it exists, otherwise use onRemoveCard
      if (onRemoveFlashcard) {
        onRemoveFlashcard(card.hanzi)
      } else if (onRemoveCard) {
        onRemoveCard(card.hanzi)
      }
      return
    }

    const isSelected = selectedCards.some((c) => c.hanzi === card.hanzi)
    if (isSelected) {
      setSelectedCards(selectedCards.filter((c) => c.hanzi !== card.hanzi))
    } else {
      setSelectedCards([...selectedCards, card])
    }
  }

  const addAllCards = (categoryCards: any[]) => {
    const newCards = categoryCards.filter(
      (card) => !selectedCards.some((c) => c.hanzi === card.hanzi) && !isAlreadyAdded(card.hanzi),
    )
    setSelectedCards([...selectedCards, ...newCards])
  }

  const addAllFromCategory = (category: string) => {
    addAllCards(HANZI_CATALOG[category as keyof typeof HANZI_CATALOG])
  }

  // Renamed from handleAddCards to handleAddToFlashcards based on updates
  const handleAddToFlashcards = () => {
    if (selectedCards.length > 0) {
      onAddCards(selectedCards)
      setSnackbar({
        message: `${selectedCards.length} flashcard${selectedCards.length > 1 ? "s" : ""} adicionado${selectedCards.length > 1 ? "s" : ""} com sucesso!`,
        visible: true,
      })
      setShowSnackbar(true) // From updates
      setSelectedCards([])
      // Hide snackbar after 3 seconds
      setTimeout(() => {
        setSnackbar({ message: "", visible: false })
        setShowSnackbar(false) // From updates
      }, 3000)
    }
  }

  const filterCards = (cards: any[]) => {
    if (!searchTerm) return cards
    return cards.filter(
      (card) =>
        card.hanzi.includes(searchTerm) ||
        card.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.meaning.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const renderCardGrid = (cards: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {filterCards(cards).map((card) => {
        const isSelected = selectedCards.some((c) => c.hanzi === card.hanzi)
        const alreadyAdded = isAlreadyAdded(card.hanzi)
        return (
          <button
            key={card.hanzi}
            draggable
            onDragStart={(event) => handleCardDragStart(event, card)}
            onDragEnd={() => setDragOverCategoryId(null)}
            onClick={() => toggleCard(card)}
            className={`
              group relative p-4 border-2 rounded-lg transition-all hover:shadow-lg
              ${
                alreadyAdded
                  ? "border-green-500 bg-green-500/20 shadow-md hover:border-red-500 hover:bg-red-500/20"
                  : isSelected
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
              }
            `}
          >
            <div
              className={`absolute top-1 right-1 rounded-full p-1 transition-colors ${
                alreadyAdded ? "bg-green-500 text-white group-hover:bg-red-500" : "opacity-0"
              }`}
            >
              <Check className="h-3 w-3 group-hover:hidden" />
              <X className="h-3 w-3 hidden group-hover:block" />
            </div>
            <div className="text-4xl mb-2 text-center">{card.hanzi}</div>
            <div className="text-sm text-muted-foreground text-center">
              {card.pinyin.trim() || "Leitura não cadastrada"}
            </div>
            <div className="text-xs text-muted-foreground text-center mt-1 text-balance">
              {card.meaning.trim() || "Significado não cadastrado"}
            </div>
            {alreadyAdded && (
              <div className="text-xs text-green-600 dark:text-green-400 group-hover:text-red-600 dark:group-hover:text-red-400 font-semibold text-center mt-2 transition-colors">
                <span className="group-hover:hidden">Adicionado</span>
                <span className="hidden group-hover:inline">Clique para remover</span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )

  const renderBroadSearchResults = () => {
    if (broadSearchError && broadResults.length === 0) return <p className="text-muted-foreground">Não foi possível concluir a busca.</p>
    if (broadResults.length === 0 && broadSearchLoading) return <p className="text-muted-foreground">Buscando no catálogo completo...</p>
    if (broadResults.length === 0) return <p className="text-muted-foreground">Nenhum hanzi encontrado.</p>

    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {broadResults.map((entry) => (
            <button
              key={entry.character}
              draggable
              onDragStart={(event) => handleCardDragStart(event, entry)}
              onDragEnd={() => setDragOverCategoryId(null)}
              onClick={() => setSelectedBroadHanzi(entry)}
              className="group relative p-4 border-2 rounded-lg transition-all hover:shadow-lg border-border bg-card hover:border-primary/50 cursor-grab active:cursor-grabbing"
              aria-label={`Arraste ou abra ${entry.character}; leitura: ${entry.pinyin[0] ?? "não cadastrada"}; significado: ${entry.meanings[0] ?? "não cadastrado"}`}
            >
              <div className="text-4xl mb-2 text-center">{entry.character}</div>
              <div className="text-sm text-muted-foreground text-center">
                {entry.pinyin[0] ?? "Leitura não cadastrada"}
              </div>
              <div className="text-xs text-muted-foreground text-center mt-1 text-balance">
                {entry.meanings[0] ?? "Significado não cadastrado"}
              </div>
              {(entry.strokeCount !== undefined || entry.radical) && (
                <div className="text-xs text-muted-foreground text-center mt-2">
                  {entry.strokeCount !== undefined && `${entry.strokeCount} traços`}
                  {entry.strokeCount !== undefined && entry.radical && " · "}
                  {entry.radical && `Radical ${entry.radical}`}
                </div>
              )}
            </button>
          ))}
        </div>
        {broadSearchLoading && <p className="text-sm text-muted-foreground">Carregando mais resultados...</p>}
        {broadSearchError && <p className="text-sm text-destructive">Não foi possível carregar mais resultados.</p>}
        {broadSearchHasMore && (
          <Button type="button" variant="outline" onClick={loadMoreBroadResults} disabled={broadSearchLoading}>
            Carregar mais resultados
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Snackbar - merged from both existing and updates */}
      {snackbar.visible && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span>{snackbar.message}</span>
          </div>
        </div>
      )}
      {showSnackbar && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          {selectedCards.length} hanzi{selectedCards.length !== 1 ? "s" : ""} adicionado
          {selectedCards.length !== 1 ? "s" : ""} aos flashcards!
        </div>
      )}

      <header className="sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onClose}>
              {" "}
              {/* Changed from onBack to onClose based on updates */}
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {selectedCards.length} selecionados
            </Badge>
            <Button onClick={handleAddToFlashcards} disabled={selectedCards.length === 0}>
              <Plus className="h-5 w-5 mr-2" />
              Adicionar
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por hanzi, pinyin ou significado..."
              value={searchTerm}
              onChange={(event) => handleLibrarySearchChange(event.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (searchTerm.trim()) {
              activeTabBeforeSearchRef.current = value
              setActiveTab("all")
            } else {
              setActiveTab(value)
            }
          }}
        >
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold">Todos os Hanzis</h2>
            <div className="w-full">
              <div>
                <div className="pb-2">
                  {customCategories.length > 0 && (
                    <p className="mb-2 text-xs text-muted-foreground">Arraste um hanzi até uma categoria para adicioná-lo.</p>
                  )}
                  <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                    <TabsTrigger value="all" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Todos os Hanzis
                    </TabsTrigger>
                    <TabsTrigger value="licao3" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Lição 3
                    </TabsTrigger>
                    <TabsTrigger value="licao4" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Lição 4
                    </TabsTrigger>
                    <TabsTrigger value="licao5" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Lição 5
                    </TabsTrigger>
                    <TabsTrigger value="hsk1" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      HSK 1
                    </TabsTrigger>
                    <TabsTrigger value="hsk2" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      HSK 2
                    </TabsTrigger>
                    <TabsTrigger value="hsk3" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      HSK 3
                    </TabsTrigger>
                    <TabsTrigger value="hsk4" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      HSK 4
                    </TabsTrigger>
                    <TabsTrigger value="hsk5" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      HSK 5
                    </TabsTrigger>
                    <TabsTrigger value="hsk6" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      HSK 6
                    </TabsTrigger>
                    <TabsTrigger value="numbers" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Números
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Cores
                    </TabsTrigger>
                    <TabsTrigger value="family" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Família
                    </TabsTrigger>
                    <TabsTrigger value="food" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Comida
                    </TabsTrigger>
                    <TabsTrigger value="animals" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Animais
                    </TabsTrigger>
                    <TabsTrigger value="verbs" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Verbos
                    </TabsTrigger>
                    <TabsTrigger value="adjectives" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Adjetivos
                    </TabsTrigger>
                    <TabsTrigger value="places" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Lugares
                    </TabsTrigger>
                    <TabsTrigger value="professions" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Profissões
                    </TabsTrigger>
                    <TabsTrigger value="time" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Tempo
                    </TabsTrigger>
                    <TabsTrigger value="weather" className="w-auto flex-none whitespace-nowrap rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Clima
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Minhas Categorias
                    </h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={openCategoryModal} className="shrink-0 px-2">
                    <FolderPlus className="mr-1 h-4 w-4" />
                    Criar
                  </Button>
                </div>
                {customCategories.length > 0 ? (
                  <TabsList className="mt-2 flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                    {customCategories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={`custom-${category.id}`}
                        onDragOver={(event) => handleCategoryDragOver(event, category.id)}
                        onDrop={(event) => handleCategoryDrop(event, category.id)}
                        className={cn(
                          "w-auto flex-none gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                          dragOverCategoryId === category.id && "bg-primary/15 ring-2 ring-primary",
                        )}
                        aria-label={`${category.name}, soltar hanzi para adicionar`}
                      >
                        <Star className="h-3.5 w-3.5" />
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="px-1.5 py-0 text-xs">{category.cards.length}</Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                ) : (
                  <p className="px-1 pt-1 text-xs text-muted-foreground">Nenhuma categoria criada ainda.</p>
                )}
                {/* Custom categories - desktop */}
                <div className="hidden">
                  <div className="mb-2 flex items-center justify-between gap-2 px-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <Star className="h-4 w-4 shrink-0 text-primary" />
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Minhas Categorias
                      </h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={openCategoryModal} className="shrink-0 px-2">
                      <FolderPlus className="mr-1 h-4 w-4" />
                      Criar
                    </Button>
                  </div>
                  {customCategories.length > 0 ? (
                    <p className="px-1 pb-2 text-xs text-muted-foreground">Arraste um hanzi até uma categoria para adicioná-lo.</p>
                  ) : null}
                  {customCategories.length > 0 ? (
                    <TabsList className="flex flex-col h-auto w-full gap-1 bg-transparent p-0">
                      {customCategories.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={`custom-${category.id}`}
                          onDragOver={(event) => handleCategoryDragOver(event, category.id)}
                          onDrop={(event) => handleCategoryDrop(event, category.id)}
                          className={cn("w-full justify-start gap-2", dragOverCategoryId === category.id && "bg-primary/15 ring-2 ring-primary")}
                          aria-label={`${category.name}, soltar hanzi para adicionar`}
                        >
                          <Star className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{category.name}</span>
                          <Badge variant="secondary" className="ml-auto shrink-0 px-1.5 py-0 text-xs">{category.cards.length}</Badge>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  ) : (
                    <p className="text-xs text-muted-foreground px-1 mb-2">
                      Nenhuma categoria criada ainda.
                    </p>
                  )}
                </div>

                {/* Desktop sidebar - modified from existing */}
                <TabsList className="hidden">
                  <TabsTrigger value="all" className="w-full justify-start">
                    Todos os Hanzis
                  </TabsTrigger>
                  <TabsTrigger value="licao3" className="w-full justify-start">
                    Lição 3
                  </TabsTrigger>
                  <TabsTrigger value="licao4" className="w-full justify-start">
                    Lição 4
                  </TabsTrigger>
                  <TabsTrigger value="licao5" className="w-full justify-start">
                    Lição 5
                  </TabsTrigger>
                  <TabsTrigger value="hsk1" className="w-full justify-start">
                    HSK 1
                  </TabsTrigger>
                  <TabsTrigger value="hsk2" className="w-full justify-start">
                    HSK 2
                  </TabsTrigger>
                  <TabsTrigger value="hsk3" className="w-full justify-start">
                    HSK 3
                  </TabsTrigger>
                  <TabsTrigger value="hsk4" className="w-full justify-start">
                    HSK 4
                  </TabsTrigger>
                  <TabsTrigger value="hsk5" className="w-full justify-start">
                    HSK 5
                  </TabsTrigger>
                  <TabsTrigger value="hsk6" className="w-full justify-start">
                    HSK 6
                  </TabsTrigger>
                  <TabsTrigger value="numbers" className="w-full justify-start">
                    Números
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="w-full justify-start">
                    Cores
                  </TabsTrigger>
                  <TabsTrigger value="family" className="w-full justify-start">
                    Família
                  </TabsTrigger>
                  <TabsTrigger value="food" className="w-full justify-start">
                    Comida
                  </TabsTrigger>
                  <TabsTrigger value="animals" className="w-full justify-start">
                    Animais
                  </TabsTrigger>
                  <TabsTrigger value="verbs" className="w-full justify-start">
                    Verbos
                  </TabsTrigger>
                  <TabsTrigger value="adjectives" className="w-full justify-start">
                    Adjetivos
                  </TabsTrigger>
                  <TabsTrigger value="places" className="w-full justify-start">
                    Lugares
                  </TabsTrigger>
                  <TabsTrigger value="professions" className="w-full justify-start">
                    Profissões
                  </TabsTrigger>
                  <TabsTrigger value="time" className="w-full justify-start">
                    Tempo
                  </TabsTrigger>
                  <TabsTrigger value="weather" className="w-full justify-start">
                    Clima
                  </TabsTrigger>
                </TabsList>

              </div>
            </div>

            {/* Hanzis Grid - Right side */}
            <div className="w-full">
              <TabsContent value="all" className="space-y-4 mt-0">
                {renderBroadSearchResults()}
              </TabsContent>

              {Object.entries(HANZI_CATALOG).filter(([category]) => category !== "aulas").map(([category, cards]) => (
                <TabsContent key={category} value={category} className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold capitalize">
                      {category === "aulas" && "Básico 1"}
                      {category === "licao3" && "Lição 3 — 第三课"}
                      {category === "licao4" && "Lição 4 — 第四课"}
                      {category === "licao5" && "Lição 5 — 第五课"}
                      {category === "hsk1" && "HSK Nível 1"}
                      {category === "hsk2" && "HSK Nível 2"}
                      {category === "hsk3" && "HSK Nível 3"}
                      {category === "hsk4" && "HSK Nível 4"}
                      {category === "hsk5" && "HSK Nível 5"}
                      {category === "hsk6" && "HSK Nível 6"}
                      {category === "numbers" && "Números"}
                      {category === "colors" && "Cores"}
                      {category === "family" && "Família"}
                      {category === "food" && "Comida"}
                      {category === "animals" && "Animais"}
                      {category === "verbs" && "Verbos Comuns"}
                      {category === "adjectives" && "Adjetivos"}
                      {category === "places" && "Lugares"}
                      {category === "professions" && "Profissões"}
                      {category === "time" && "Tempo"}
                      {category === "weather" && "Clima"}
                    </h2>
                    <Button variant="outline" onClick={() => addAllFromCategory(category)}>
                      Adicionar Todos
                    </Button>
                  </div>

                  {renderCardGrid(cards)}
                </TabsContent>
              ))}

              {/* Custom categories content */}
              {customCategories.map((category) => (
                <TabsContent key={category.id} value={`custom-${category.id}`} className="space-y-4 mt-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Star className="h-5 w-5 text-primary shrink-0" />
                      <h2 className="text-2xl font-bold truncate">{category.name}</h2>
                      <Badge variant="secondary" className="shrink-0">
                        {category.cards.length}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" onClick={() => addAllCards(category.cards)}>
                        Adicionar Todos
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCategoryToDelete({ id: category.id, name: category.name })}
                        aria-label={`Excluir categoria ${category.name}`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <section className="flex flex-col gap-3 rounded-lg border border-border p-4" aria-label={`Adicionar hanzi à categoria ${category.name}`}>
                    <div>
                      <h3 className="font-semibold">Adicionar da biblioteca</h3>
                      <p className="text-sm text-muted-foreground">Pesquise por hanzi, pinyin ou significado.</p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        aria-label={`Buscar hanzi para adicionar à categoria ${category.name}`}
                        placeholder="Buscar na biblioteca..."
                        value={customCategorySearch[category.id] ?? ""}
                        onChange={(event) => handleCustomCategorySearchChange(category.id, event.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {(() => {
                      const query = (customCategorySearch[category.id] ?? "").trim()
                      const matches = customCategorySearchResults[category.id] ?? []
                      if (!query) return null
                      if (customCategorySearchLoading[category.id] && matches.length === 0) {
                        return <p className="text-sm text-muted-foreground">Buscando no catálogo completo...</p>
                      }
                      if (customCategorySearchError[category.id] && matches.length === 0) {
                        return <p className="text-sm text-destructive">Não foi possível concluir a busca.</p>
                      }
                      if (matches.length === 0) {
                        return <p className="text-sm text-muted-foreground">Nenhum hanzi encontrado na biblioteca.</p>
                      }

                      return (
                        <div className="flex flex-col gap-3">
                          <div className="max-h-80 overflow-y-auto rounded-md border border-border divide-y divide-border">
                            {matches.map((entry) => {
                              const alreadyInCategory = category.cards.some((item) => item.hanzi === entry.character)
                              const card = {
                                hanzi: entry.character,
                                pinyin: entry.pinyin.join(", "),
                                meaning: entry.meanings.join("; "),
                              }
                              return (
                                <div
                                  key={entry.character}
                                  draggable
                                  onDragStart={(event) => handleCardDragStart(event, entry)}
                                  onDragEnd={() => setDragOverCategoryId(null)}
                                  className="flex items-center justify-between gap-3 p-3 cursor-grab active:cursor-grabbing"
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <span className="text-2xl" lang="zh">{entry.character}</span>
                                    <span className="min-w-0">
                                      <span className="block text-sm font-medium">
                                        {entry.pinyin[0] ?? "Leitura não cadastrada"}
                                      </span>
                                      <span className="block truncate text-xs text-muted-foreground">
                                        {entry.meanings[0] ?? "Significado não cadastrado"}
                                      </span>
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={alreadyInCategory ? "secondary" : "outline"}
                                    disabled={alreadyInCategory}
                                    onClick={() => addCardToCustomCategory(category.id, card)}
                                  >
                                    {alreadyInCategory ? <Check className="mr-1 h-4 w-4" /> : <Plus className="mr-1 h-4 w-4" />}
                                    {alreadyInCategory ? "Adicionado" : "Adicionar"}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                          {customCategorySearchLoading[category.id] && <p className="text-sm text-muted-foreground">Carregando mais resultados...</p>}
                          {customCategorySearchError[category.id] && <p className="text-sm text-destructive">Não foi possível carregar mais resultados.</p>}
                          {customCategorySearchHasMore[category.id] && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={customCategorySearchLoading[category.id]}
                              onClick={() => loadMoreCustomCategoryResults(category.id)}
                            >
                              Carregar mais resultados
                            </Button>
                          )}
                        </div>
                      )
                    })()}
                  </section>

                  {renderCardGrid(category.cards)}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </main>

      {/* Floating action button for mobile - Added from updates */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={handleAddToFlashcards}
          disabled={selectedCards.length === 0}
          className="h-14 px-6 rounded-full shadow-lg disabled:opacity-50"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar ({selectedCards.length})
        </Button>
      </div>

      {/* Create custom category modal */}
      {selectedBroadHanzi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-6xl mb-2">{selectedBroadHanzi.character}</div>
                <div className="text-sm text-muted-foreground">{selectedBroadHanzi.unicode}</div>
              </div>
              <button
                onClick={() => setSelectedBroadHanzi(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar detalhes"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              {selectedBroadHanzi.pinyin.length > 0 && (
                <div><span className="font-semibold">Pinyin:</span> {selectedBroadHanzi.pinyin.join(", ")}</div>
              )}
              {selectedBroadHanzi.meanings.length > 0 && (
                <div><span className="font-semibold">Significados:</span> {selectedBroadHanzi.meanings.join("; ")}</div>
              )}
              {selectedBroadHanzi.radical && (
                <div>
                  <span className="font-semibold">Radical:</span> {selectedBroadHanzi.radical}
                  {selectedBroadHanzi.radicalNumber !== undefined && ` (nº ${selectedBroadHanzi.radicalNumber})`}
                </div>
              )}
              {selectedBroadHanzi.strokeCounts && selectedBroadHanzi.strokeCounts.length > 0 && (
                <div><span className="font-semibold">Traços:</span> {selectedBroadHanzi.strokeCounts.join(", ")}</div>
              )}
              {selectedBroadHanzi.simplified && selectedBroadHanzi.simplified.length > 0 && (
                <div><span className="font-semibold">Simplificado:</span> {selectedBroadHanzi.simplified.join(", ")}</div>
              )}
              {selectedBroadHanzi.traditional && selectedBroadHanzi.traditional.length > 0 && (
                <div><span className="font-semibold">Tradicional:</span> {selectedBroadHanzi.traditional.join(", ")}</div>
              )}
              <HanziStrokeOrder character={selectedBroadHanzi.character} />
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Nova Categoria</h3>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <label className="text-sm font-medium mb-1.5 block" htmlFor="category-name">
                Nome da categoria
              </label>
              <Input
                id="category-name"
                placeholder="Ex.: Meu vocabulário, Revisão da prova..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="mb-4"
              />
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" htmlFor="category-search">
                  Selecione os caracteres
                </label>
                <Badge variant="secondary">{categorySelection.length} selecionados</Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="category-search"
                  placeholder="Buscar por hanzi, pinyin ou significado..."
                  value={categoryModalSearch}
                  onChange={(e) => setCategoryModalSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {filteredCategoryModalCards.map((card) => {
                  const isSelected = categorySelection.some((c) => c.hanzi === card.hanzi)
                  return (
                    <button
                      key={card.hanzi}
                      onClick={() => toggleCategorySelection(card)}
                      className={`relative p-2 border-2 rounded-lg transition-all text-center ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 rounded-full bg-primary text-primary-foreground p-0.5">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="text-2xl">{card.hanzi}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {card.pinyin || "Leitura não cadastrada"}
                      </div>
                    </button>
                  )
                })}
              </div>
              {filteredCategoryModalCards.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhum caractere encontrado para a busca.
                </p>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setShowCategoryModal(false)} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || categorySelection.length === 0}
                className="flex-1"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Criar Categoria
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete custom category confirmation */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border-2 border-border rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-semibold mb-4">Excluir Categoria</h3>
            <p className="text-muted-foreground mb-2">
              Tem certeza que deseja excluir a categoria &quot;{categoryToDelete.name}&quot;?
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Os flashcards já adicionados aos seus estudos não serão removidos.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCategoryToDelete(null)} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteCategory(categoryToDelete.id)} className="flex-1">
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
