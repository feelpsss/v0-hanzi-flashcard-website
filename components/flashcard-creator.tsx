"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trash2, RotateCw } from "lucide-react"

const PINYIN_TO_HANZI: { [key: string]: Array<{ hanzi: string; meaning: string; pinyin: string }> } = {
  ni: [
    { hanzi: "你", meaning: "você", pinyin: "nǐ" },
    { hanzi: "泥", meaning: "lama", pinyin: "ní" },
    { hanzi: "尼", meaning: "freira", pinyin: "ní" },
  ],
  hao: [
    { hanzi: "好", meaning: "bom", pinyin: "hǎo" },
    { hanzi: "号", meaning: "número", pinyin: "hào" },
    { hanzi: "豪", meaning: "grandioso", pinyin: "háo" },
  ],
  wo: [
    { hanzi: "我", meaning: "eu", pinyin: "wǒ" },
    { hanzi: "握", meaning: "segurar", pinyin: "wò" },
  ],
  shi: [
    { hanzi: "是", meaning: "ser", pinyin: "shì" },
    { hanzi: "十", meaning: "dez", pinyin: "shí" },
    { hanzi: "时", meaning: "tempo", pinyin: "shí" },
    { hanzi: "事", meaning: "assunto", pinyin: "shì" },
  ],
  ren: [
    { hanzi: "人", meaning: "pessoa", pinyin: "rén" },
    { hanzi: "认", meaning: "reconhecer", pinyin: "rèn" },
  ],
  de: [
    { hanzi: "的", meaning: "partícula possessiva", pinyin: "de" },
    { hanzi: "得", meaning: "obter", pinyin: "dé" },
  ],
  ta: [
    { hanzi: "他", meaning: "ele", pinyin: "tā" },
    { hanzi: "她", meaning: "ela", pinyin: "tā" },
    { hanzi: "它", meaning: "isso", pinyin: "tā" },
  ],
  men: [
    { hanzi: "们", meaning: "plural", pinyin: "men" },
    { hanzi: "门", meaning: "porta", pinyin: "mén" },
  ],
  zhe: [
    { hanzi: "这", meaning: "este", pinyin: "zhè" },
    { hanzi: "着", meaning: "partícula aspectual", pinyin: "zhe" },
  ],
  ge: [
    { hanzi: "个", meaning: "classificador geral", pinyin: "gè" },
    { hanzi: "哥", meaning: "irmão mais velho", pinyin: "gē" },
  ],
  shang: [
    { hanzi: "上", meaning: "acima", pinyin: "shàng" },
    { hanzi: "商", meaning: "comércio", pinyin: "shāng" },
  ],
  xia: [
    { hanzi: "下", meaning: "abaixo", pinyin: "xià" },
    { hanzi: "夏", meaning: "verão", pinyin: "xià" },
  ],
  lai: [{ hanzi: "来", meaning: "vir", pinyin: "lái" }],
  qu: [
    { hanzi: "去", meaning: "ir", pinyin: "qù" },
    { hanzi: "区", meaning: "distrito", pinyin: "qū" },
  ],
  hui: [
    { hanzi: "会", meaning: "saber/poder", pinyin: "huì" },
    { hanzi: "回", meaning: "voltar", pinyin: "huí" },
  ],
  shuo: [{ hanzi: "说", meaning: "falar", pinyin: "shuō" }],
  xiang: [
    { hanzi: "想", meaning: "pensar", pinyin: "xiǎng" },
    { hanzi: "向", meaning: "direção", pinyin: "xiàng" },
  ],
  kan: [
    { hanzi: "看", meaning: "ver", pinyin: "kàn" },
    { hanzi: "刊", meaning: "publicação", pinyin: "kān" },
  ],
  dian: [
    { hanzi: "点", meaning: "ponto", pinyin: "diǎn" },
    { hanzi: "电", meaning: "eletricidade", pinyin: "diàn" },
  ],
  chi: [
    { hanzi: "吃", meaning: "comer", pinyin: "chī" },
    { hanzi: "尺", meaning: "régua", pinyin: "chǐ" },
  ],
  he: [
    { hanzi: "喝", meaning: "beber", pinyin: "hē" },
    { hanzi: "和", meaning: "e", pinyin: "hé" },
    { hanzi: "河", meaning: "rio", pinyin: "hé" },
  ],
  zuo: [
    { hanzi: "做", meaning: "fazer", pinyin: "zuò" },
    { hanzi: "坐", meaning: "sentar", pinyin: "zuò" },
    { hanzi: "左", meaning: "esquerda", pinyin: "zuǒ" },
  ],
  you: [
    { hanzi: "有", meaning: "ter", pinyin: "yǒu" },
    { hanzi: "右", meaning: "direita", pinyin: "yòu" },
    { hanzi: "友", meaning: "amigo", pinyin: "yǒu" },
  ],
  mei: [
    { hanzi: "没", meaning: "não ter", pinyin: "méi" },
    { hanzi: "每", meaning: "cada", pinyin: "měi" },
    { hanzi: "美", meaning: "bonito", pinyin: "měi" },
  ],
  shei: [{ hanzi: "谁", meaning: "quem", pinyin: "shéi" }],
  shenme: [{ hanzi: "什么", meaning: "o quê", pinyin: "shénme" }],
  nali: [{ hanzi: "哪里", meaning: "onde", pinyin: "nǎlǐ" }],
  duo: [
    { hanzi: "多", meaning: "muito", pinyin: "duō" },
    { hanzi: "朵", meaning: "classificador de flores", pinyin: "duǒ" },
  ],
  shao: [
    { hanzi: "少", meaning: "pouco", pinyin: "shǎo" },
    { hanzi: "绍", meaning: "introduzir", pinyin: "shào" },
  ],
  da: [
    { hanzi: "大", meaning: "grande", pinyin: "dà" },
    { hanzi: "打", meaning: "bater", pinyin: "dǎ" },
  ],
  xiao: [
    { hanzi: "小", meaning: "pequeno", pinyin: "xiǎo" },
    { hanzi: "笑", meaning: "rir", pinyin: "xiào" },
  ],
  xin: [
    { hanzi: "新", meaning: "novo", pinyin: "xīn" },
    { hanzi: "心", meaning: "coração", pinyin: "xīn" },
  ],
  jiu: [
    { hanzi: "旧", meaning: "velho", pinyin: "jiù" },
    { hanzi: "九", meaning: "nove", pinyin: "jiǔ" },
    { hanzi: "酒", meaning: "vinho", pinyin: "jiǔ" },
  ],
  gao: [
    { hanzi: "高", meaning: "alto", pinyin: "gāo" },
    { hanzi: "告", meaning: "dizer", pinyin: "gào" },
  ],
  chang: [
    { hanzi: "长", meaning: "longo", pinyin: "cháng" },
    { hanzi: "常", meaning: "frequente", pinyin: "cháng" },
    { hanzi: "唱", meaning: "cantar", pinyin: "chàng" },
  ],
  hei: [{ hanzi: "黑", meaning: "preto", pinyin: "hēi" }],
  bai: [
    { hanzi: "白", meaning: "branco", pinyin: "bái" },
    { hanzi: "百", meaning: "cem", pinyin: "bǎi" },
  ],
  hong: [
    { hanzi: "红", meaning: "vermelho", pinyin: "hóng" },
    { hanzi: "洪", meaning: "inundação", pinyin: "hóng" },
  ],
  lan: [
    { hanzi: "蓝", meaning: "azul", pinyin: "lán" },
    { hanzi: "懒", meaning: "preguiçoso", pinyin: "lǎn" },
  ],
  lv: [{ hanzi: "绿", meaning: "verde", pinyin: "lǜ" }],
  huang: [{ hanzi: "黄", meaning: "amarelo", pinyin: "huáng" }],
  yi: [
    { hanzi: "一", meaning: "um", pinyin: "yī" },
    { hanzi: "医", meaning: "médico", pinyin: "yī" },
    { hanzi: "衣", meaning: "roupa", pinyin: "yī" },
  ],
  er: [
    { hanzi: "二", meaning: "dois", pinyin: "èr" },
    { hanzi: "耳", meaning: "orelha", pinyin: "ěr" },
    { hanzi: "儿", meaning: "filho", pinyin: "ér" },
  ],
  san: [{ hanzi: "三", meaning: "três", pinyin: "sāan" }],
  si: [
    { hanzi: "四", meaning: "quatro", pinyin: "sì" },
    { hanzi: "死", meaning: "morte", pinyin: "sǐ" },
  ],
  wu: [
    { hanzi: "五", meaning: "cinco", pinyin: "wǔ" },
    { hanzi: "午", meaning: "meio-dia", pinyin: "wǔ" },
    { hanzi: "无", meaning: "nenhum", pinyin: "wú" },
  ],
  liu: [{ hanzi: "六", meaning: "seis", pinyin: "liù" }],
  qi: [
    { hanzi: "七", meaning: "sete", pinyin: "qī" },
    { hanzi: "起", meaning: "levantar", pinyin: "qǐ" },
    { hanzi: "期", meaning: "período", pinyin: "qī" },
  ],
  ba: [
    { hanzi: "八", meaning: "oito", pinyin: "bā" },
    { hanzi: "把", meaning: "classificador", pinyin: "bǎ" },
    { hanzi: "爸", meaning: "pai", pinyin: "bà" },
  ],
  ma: [
    { hanzi: "妈", meaning: "mãe", pinyin: "mā" },
    { hanzi: "马", meaning: "cavalo", pinyin: "mǎ" },
    { hanzi: "吗", meaning: "partícula interrogativa", pinyin: "ma" },
  ],
  tian: [
    { hanzi: "天", meaning: "céu/dia", pinyin: "tiān" },
    { hanzi: "甜", meaning: "doce", pinyin: "tián" },
  ],
  nian: [
    { hanzi: "年", meaning: "ano", pinyin: "nián" },
    { hanzi: "念", meaning: "ler em voz alta", pinyin: "niàn" },
  ],
  yue: [
    { hanzi: "月", meaning: "mês/lua", pinyin: "yuè" },
    { hanzi: "乐", meaning: "feliz", pinyin: "lè" },
  ],
  ri: [{ hanzi: "日", meaning: "sol/dia", pinyin: "rì" }],
  xing: [
    { hanzi: "星", meaning: "estrela", pinyin: "xīng" },
    { hanzi: "行", meaning: "ir/andar", pinyin: "xíng" },
  ],
  jia: [
    { hanzi: "家", meaning: "casa/família", pinyin: "jiā" },
    { hanzi: "加", meaning: "adicionar", pinyin: "jiā" },
  ],
  xue: [
    { hanzi: "学", meaning: "estudar", pinyin: "xué" },
    { hanzi: "雪", meaning: "neve", pinyin: "xuě" },
  ],
  sheng: [
    { hanzi: "生", meaning: "nascer/vida", pinyin: "shēng" },
    { hanzi: "声", meaning: "som", pinyin: "shēng" },
  ],
  lao: [
    { hanzi: "老", meaning: "velho", pinyin: "lǎo" },
    { hanzi: "牢", meaning: "prisão", pinyin: "láo" },
  ],
  peng: [{ hanzi: "朋", meaning: "amigo", pinyin: "péng" }],
  nan: [
    { hanzi: "男", meaning: "masculino", pinyin: "nán" },
    { hanzi: "南", meaning: "sul", pinyin: "nán" },
    { hanzi: "难", meaning: "difícil", pinyin: "nán" },
  ],
  nv: [{ hanzi: "女", meaning: "feminino", pinyin: "nǚ" }],
  zi: [
    { hanzi: "子", meaning: "filho", pinyin: "zǐ" },
    { hanzi: "字", meaning: "caractere", pinyin: "zì" },
  ],
  shu: [
    { hanzi: "书", meaning: "livro", pinyin: "shū" },
    { hanzi: "树", meaning: "árvore", pinyin: "shù" },
    { hanzi: "数", meaning: "número", pinyin: "shù" },
  ],
  zai: [
    { hanzi: "在", meaning: "estar em", pinyin: "zài" },
    { hanzi: "再", meaning: "de novo", pinyin: "zài" },
  ],
  gong: [
    { hanzi: "工", meaning: "trabalho", pinyin: "gōng" },
    { hanzi: "公", meaning: "público", pinyin: "gōng" },
  ],
  ming: [
    { hanzi: "名", meaning: "nome", pinyin: "míng" },
    { hanzi: "明", meaning: "brilhante", pinyin: "míng" },
  ],
  dou: [{ hanzi: "都", meaning: "todo/ambos", pinyin: "dōu" }],
  neng: [{ hanzi: "能", meaning: "poder/capaz", pinyin: "néng" }],
  yao: [
    { hanzi: "要", meaning: "querer", pinyin: "yào" },
    { hanzi: "药", meaning: "remédio", pinyin: "yào" },
  ],
  jin: [
    { hanzi: "今", meaning: "hoje", pinyin: "jīn" },
    { hanzi: "金", meaning: "ouro", pinyin: "jīn" },
  ],
  guo: [
    { hanzi: "国", meaning: "país", pinyin: "guó" },
    { hanzi: "过", meaning: "passar", pinyin: "guò" },
  ],
  wen: [
    { hanzi: "问", meaning: "perguntar", pinyin: "wèn" },
    { hanzi: "文", meaning: "texto/cultura", pinyin: "wén" },
  ],
  zhi: [
    { hanzi: "知", meaning: "saber", pinyin: "zhī" },
    { hanzi: "之", meaning: "partícula possessiva", pinyin: "zhī" },
  ],
  dao: [
    { hanzi: "道", meaning: "caminho", pinyin: "dào" },
    { hanzi: "到", meaning: "chegar", pinyin: "dào" },
  ],
}

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
