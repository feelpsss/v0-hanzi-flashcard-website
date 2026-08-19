"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Plus, Check, X, FolderPlus, Trash2, Star } from "lucide-react"
import { HANZI_CATALOG } from "@/lib/hanzi-data"

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
  const [activeTab, setActiveTab] = useState("aulas")
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
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("customHanziCategories")
    if (saved) {
      try {
        setCustomCategories(JSON.parse(saved))
      } catch {
        // ignore corrupted data
      }
    }
  }, [])

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
    setActiveTab(`custom-${newCategory.id}`)
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
            <div className="text-sm text-muted-foreground text-center">{card.pinyin}</div>
            <div className="text-xs text-muted-foreground text-center mt-1 text-balance">{card.meaning}</div>
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

      <header className="border-b border-border sticky top-0 bg-background z-10">
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters - Left side */}
            <div className="lg:w-64 order-1 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <h3 className="text-lg font-semibold mb-3 hidden lg:block">Categorias</h3> {/* Added hidden lg:block */}
                {/* Mobile carousel - Added from updates */}
                <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
                  <TabsList className="inline-flex h-auto w-auto gap-2 bg-transparent">
                    <TabsTrigger value="aulas" className="whitespace-nowrap">
                      Básico 1
                    </TabsTrigger>
                    <TabsTrigger value="licao3" className="whitespace-nowrap">
                      Lição 3
                    </TabsTrigger>
                    <TabsTrigger value="licao4" className="whitespace-nowrap">
                      Lição 4
                    </TabsTrigger>
                    <TabsTrigger value="licao5" className="whitespace-nowrap">
                      Lição 5
                    </TabsTrigger>
                    <TabsTrigger value="hsk1" className="whitespace-nowrap">
                      HSK 1
                    </TabsTrigger>
                    <TabsTrigger value="hsk2" className="whitespace-nowrap">
                      HSK 2
                    </TabsTrigger>
                    <TabsTrigger value="hsk3" className="whitespace-nowrap">
                      HSK 3
                    </TabsTrigger>
                    <TabsTrigger value="hsk4" className="whitespace-nowrap">
                      HSK 4
                    </TabsTrigger>
                    <TabsTrigger value="hsk5" className="whitespace-nowrap">
                      HSK 5
                    </TabsTrigger>
                    <TabsTrigger value="hsk6" className="whitespace-nowrap">
                      HSK 6
                    </TabsTrigger>
                    <TabsTrigger value="numbers" className="whitespace-nowrap">
                      Números
                    </TabsTrigger>
                    <TabsTrigger value="colors" className="whitespace-nowrap">
                      Cores
                    </TabsTrigger>
                    <TabsTrigger value="family" className="whitespace-nowrap">
                      Família
                    </TabsTrigger>
                    <TabsTrigger value="food" className="whitespace-nowrap">
                      Comida
                    </TabsTrigger>
                    <TabsTrigger value="animals" className="whitespace-nowrap">
                      Animais
                    </TabsTrigger>
                    <TabsTrigger value="verbs" className="whitespace-nowrap">
                      Verbos
                    </TabsTrigger>
                    <TabsTrigger value="adjectives" className="whitespace-nowrap">
                      Adjetivos
                    </TabsTrigger>
                    <TabsTrigger value="places" className="whitespace-nowrap">
                      Lugares
                    </TabsTrigger>
                    <TabsTrigger value="professions" className="whitespace-nowrap">
                      Profissões
                    </TabsTrigger>
                    <TabsTrigger value="time" className="whitespace-nowrap">
                      Tempo
                    </TabsTrigger>
                    <TabsTrigger value="weather" className="whitespace-nowrap">
                      Clima
                    </TabsTrigger>
                    {customCategories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={`custom-${category.id}`}
                        className="whitespace-nowrap gap-1.5"
                      >
                        <Star className="h-3.5 w-3.5" />
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {/* Create category button - mobile */}
                <div className="lg:hidden mb-2">
                  <Button variant="outline" size="sm" onClick={openCategoryModal} className="bg-transparent">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Criar Categoria
                  </Button>
                </div>
                {/* Custom categories - desktop */}
                <div className="hidden lg:block mb-6">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <Star className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Minhas Categorias
                    </h3>
                  </div>
                  {customCategories.length > 0 ? (
                    <TabsList className="flex flex-col h-auto w-full gap-1 bg-transparent p-0">
                      {customCategories.map((category) => (
                        <TabsTrigger
                          key={category.id}
                          value={`custom-${category.id}`}
                          className="w-full justify-start gap-2"
                        >
                          <Star className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{category.name}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  ) : (
                    <p className="text-xs text-muted-foreground px-1 mb-2">
                      Nenhuma categoria criada ainda.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCategoryModal}
                    className="w-full justify-start mt-2 bg-transparent"
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Criar Categoria
                  </Button>
                </div>

                {/* Desktop sidebar - modified from existing */}
                <TabsList className="hidden lg:flex flex-col h-auto w-full gap-1">
                  <TabsTrigger value="aulas" className="w-full justify-start">
                    Básico 1
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
            <div className="flex-1 order-2 lg:order-2">
              {Object.entries(HANZI_CATALOG).map(([category, cards]) => (
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
                      <div className="text-xs text-muted-foreground truncate">{card.pinyin}</div>
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
