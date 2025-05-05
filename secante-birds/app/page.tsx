"use client"

import { useEffect, useRef, useState } from "react"
import { Game } from "@/components/game"

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameInstance, setGameInstance] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const game = new Game(canvas)
      setGameInstance(game)
      setIsLoading(false)

      // Iniciar el juego
      game.start()

      // Limpiar al desmontar
      return () => {
        game.stop()
      }
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-sky-200">
      <h1 className="text-4xl font-bold mb-4 text-center">Secante Birds</h1>
      <p className="mb-6 text-center max-w-md">
        Un juego que utiliza el método de la secante para calcular trayectorias óptimas.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center h-[700px] w-full max-w-[1200px] bg-sky-300 rounded-lg">
          Cargando...
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            className="border border-gray-400 rounded-lg shadow-lg bg-sky-300 max-w-full h-auto"
          />
          <div className="mt-4 text-center text-sm">
            <p>Arrastra el mouse para apuntar y suelta para lanzar.</p>
            <p>Presiona M para cambiar entre apuntado manual y automático (método de la secante).</p>
            <p>Presiona R para reiniciar el nivel actual.</p>
          </div>
        </div>
      )}
    </main>
  )
}
