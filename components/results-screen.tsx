"use client"

import { Button } from "@/components/ui/button"
import { Home, RefreshCw, Download } from "lucide-react"
import html2canvas from "html2canvas"
import { useRef, useState } from "react"

interface ResultsScreenProps {
  results: { correct: any[]; incorrect: any[]; unstudied?: any[] }
  onRestart: () => void
  onRestartErrors: () => void
  onHome: () => void
  darkMode: boolean
}

export function ResultsScreen({ results, onRestart, onRestartErrors, onHome }: ResultsScreenProps) {
  const resultsRef = useRef<HTMLDivElement>(null)
  const [showStudyOptions, setShowStudyOptions] = useState(false)

  const studiedTotal = results.correct.length + results.incorrect.length
  const percentage = studiedTotal > 0 ? Math.round((results.correct.length / studiedTotal) * 100) : 0
  const hasUnstudied = results.unstudied && results.unstudied.length > 0
  const hasErrors = results.incorrect.length > 0

  const handleStudyAgain = () => {
    if (hasErrors) {
      setShowStudyOptions(true)
    } else {
      onRestart()
    }
  }

  const handleSaveImage = async () => {
    if (resultsRef.current) {
      try {
        const isDark = document.documentElement.classList.contains("dark")

        const tempDiv = document.createElement("div")
        tempDiv.style.cssText = `
          width: ${resultsRef.current.offsetWidth}px;
          background-color: ${isDark ? "#262626" : "#ffffff"};
          color: ${isDark ? "#fafafa" : "#262626"};
          border: 1px solid ${isDark ? "#404040" : "#e5e5e5"};
          border-radius: 12px;
          padding: 32px;
          position: absolute;
          left: -9999px;
          top: 0;
          font-family: system-ui, -apple-system, sans-serif;
        `

        const header = `
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="font-size: 36px; font-weight: bold; margin-bottom: 16px; color: ${isDark ? "#fafafa" : "#262626"};">
              ${hasUnstudied ? "Estudo Encerrado" : "Estudo Concluído!"}
            </h2>
            <div style="font-size: 60px; font-weight: bold; color: ${isDark ? "#60a5fa" : "#3b82f6"}; margin-bottom: 16px;">${percentage}%</div>
            <p style="font-size: 20px; color: ${isDark ? "#a3a3a3" : "#737373"};">
              ${results.correct.length} de ${studiedTotal} corretos
              ${hasUnstudied ? `<br/>(${results.unstudied.length} não estudados)` : ""}
            </p>
          </div>
        `

        const generateCardHTML = (card: any) => `
          <div style="display: flex; align-items: center; gap: 12px; padding: 8px; background-color: ${isDark ? "#262626" : "#ffffff"}; border-radius: 4px; margin-bottom: 8px;">
            <div style="font-size: 24px;">${card.hanzi}</div>
            <div style="font-size: 14px;">
              ${card.pinyin ? `<div style="color: ${isDark ? "#a3a3a3" : "#737373"};">${card.pinyin}</div>` : ""}
              <div style="color: ${isDark ? "#fafafa" : "#262626"};">${card.meaning}</div>
            </div>
          </div>
        `

        const columnWidth = hasUnstudied ? "calc(33.33% - 16px)" : "calc(50% - 12px)"

        const correctSection = `
          <div style="float: left; width: ${columnWidth}; margin-right: 12px;">
            <h3 style="font-size: 20px; font-weight: 600; color: ${isDark ? "#4ade80" : "#16a34a"}; margin-bottom: 12px;">
              ✓ Acertos (${results.correct.length})
            </h3>
            <div style="border: 1px solid ${isDark ? "#404040" : "#e5e5e5"}; border-radius: 8px; padding: 16px; background-color: ${isDark ? "#1c1c1c" : "#f9f9f9"};">
              ${
                results.correct.length === 0
                  ? `<div style="text-align: center; color: ${isDark ? "#a3a3a3" : "#737373"}; padding: 32px 0;">Nenhum acerto ainda</div>`
                  : results.correct.map(generateCardHTML).join("")
              }
            </div>
          </div>
        `

        const incorrectSection = `
          <div style="float: left; width: ${columnWidth}; ${hasUnstudied ? "margin-right: 12px;" : "margin-left: 12px;"}">
            <h3 style="font-size: 20px; font-weight: 600; color: ${isDark ? "#f87171" : "#dc2626"}; margin-bottom: 12px;">
              ✗ Erros (${results.incorrect.length})
            </h3>
            <div style="border: 1px solid ${isDark ? "#404040" : "#e5e5e5"}; border-radius: 8px; padding: 16px; background-color: ${isDark ? "#1c1c1c" : "#f9f9f9"};">
              ${
                results.incorrect.length === 0
                  ? `<div style="text-align: center; color: ${isDark ? "#a3a3a3" : "#737373"}; padding: 32px 0;">Parabéns! Nenhum erro!</div>`
                  : results.incorrect.map(generateCardHTML).join("")
              }
            </div>
          </div>
        `

        const unstudiedSection = hasUnstudied
          ? `
          <div style="float: left; width: ${columnWidth}; margin-left: 12px;">
            <h3 style="font-size: 20px; font-weight: 600; color: ${isDark ? "#a3a3a3" : "#737373"}; margin-bottom: 12px;">
              – Não Estudados (${results.unstudied.length})
            </h3>
            <div style="border: 1px solid ${isDark ? "#404040" : "#e5e5e5"}; border-radius: 8px; padding: 16px; background-color: ${isDark ? "#1c1c1c" : "#f9f9f9"};">
              ${results.unstudied.map(generateCardHTML).join("")}
            </div>
          </div>
        `
          : ""

        tempDiv.innerHTML =
          header + correctSection + incorrectSection + unstudiedSection + '<div style="clear: both;"></div>'
        document.body.appendChild(tempDiv)

        const canvas = await html2canvas(tempDiv, {
          backgroundColor: isDark ? "#262626" : "#ffffff",
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        })

        document.body.removeChild(tempDiv)

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.download = `hanzi-study-results-${Date.now()}.png`
            link.href = url
            link.click()
            URL.revokeObjectURL(url)
          }
        }, "image/png")
      } catch (error) {
        console.error("Erro ao salvar imagem:", error)
        alert("Erro ao salvar a imagem. Tente novamente.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      {showStudyOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border-2 border-border rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-3">Escolha uma opção</h3>
            <p className="text-muted-foreground mb-6">
              Você teve {results.incorrect.length} erro{results.incorrect.length !== 1 ? "s" : ""} neste estudo.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setShowStudyOptions(false)
                  onRestart()
                }}
                className="w-full h-12"
              >
                Estudar Todos os Hanzis ({studiedTotal + (results.unstudied?.length || 0)})
              </Button>
              <Button
                onClick={() => {
                  setShowStudyOptions(false)
                  onRestartErrors()
                }}
                variant="destructive"
                className="w-full h-12"
              >
                Estudar Apenas os Erros ({results.incorrect.length})
              </Button>
              <Button onClick={() => setShowStudyOptions(false)} variant="outline" className="w-full h-12">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-8">
        <div ref={resultsRef} className="bg-card border border-border rounded-xl p-8 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">{hasUnstudied ? "Estudo Encerrado" : "Estudo Concluído!"}</h2>
            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <p className="text-xl text-muted-foreground">
              {results.correct.length} de {studiedTotal} corretos
              {hasUnstudied && (
                <>
                  <br />({results.unstudied.length} não estudados)
                </>
              )}
            </p>
          </div>

          <div className={`grid ${hasUnstudied ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
            {/* Correct answers */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
                ✓ Acertos ({results.correct.length})
              </h3>
              <div className="border border-border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                {results.correct.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Nenhum acerto ainda</div>
                ) : (
                  results.correct.map((card: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-background rounded">
                      <div className="text-2xl">{card.hanzi}</div>
                      <div className="text-sm">
                        {card.pinyin && <div className="text-muted-foreground">{card.pinyin}</div>}
                        <div>{card.meaning}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Incorrect answers */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">
                ✗ Erros ({results.incorrect.length})
              </h3>
              <div className="border border-border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                {results.incorrect.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Parabéns! Nenhum erro!</div>
                ) : (
                  results.incorrect.map((card: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-background rounded">
                      <div className="text-2xl">{card.hanzi}</div>
                      <div className="text-sm">
                        {card.pinyin && <div className="text-muted-foreground">{card.pinyin}</div>}
                        <div>{card.meaning}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {hasUnstudied && (
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-muted-foreground">
                  – Não Estudados ({results.unstudied.length})
                </h3>
                <div className="border border-border rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                  {results.unstudied.map((card: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-background rounded">
                      <div className="text-2xl">{card.hanzi}</div>
                      <div className="text-sm">
                        {card.pinyin && <div className="text-muted-foreground">{card.pinyin}</div>}
                        <div>{card.meaning}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
         <Button onClick={handleStudyAgain} className="h-16">
            <RefreshCw className="mr-2 h-5 w-5" />
            Estudar Novamente
          </Button>
          <Button onClick={handleSaveImage} variant="outline" className="h-16 bg-transparent">
            <Download className="mr-2 h-5 w-5" />
            Salvar Imagem
          </Button>
          <Button onClick={onHome} variant="outline" className="h-16 bg-transparent">
            <Home className="mr-2 h-5 w-5" />
            Início
          </Button>
          
        </div>
      </div>
    </div>
  )
}
