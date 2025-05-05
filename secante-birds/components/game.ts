import { Bird } from "./bird"
import { Level } from "./level"
import { GameState } from "./game-state"
import { calculateAngleFromDrag, calculateOptimalAngle } from "./aiming"

// Constantes globales
export const SCREEN_WIDTH = 1200
export const SCREEN_HEIGHT = 700
export const FPS = 60
export const MAX_POWER = 100

// Colores
export const WHITE = "#FFFFFF"
export const BLACK = "#000000"
export const RED = "#FF0000"
export const GREEN = "#00FF00"
export const BLUE = "#0000FF"
export const YELLOW = "#FFFF00"
export const BROWN = "#8B4513"
export const SKY_BLUE = "#87CEEB"
export const GRAY = "#808080"

// Ajustes físicos
export const VELOCITY_MULTIPLIER = 1.0
export const GRAVITY = 12.0

export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrameId: number | null = null
  private lastTimestamp = 0

  private state: GameState = GameState.MENU
  private currentLevel = 1
  private maxLevels = 4
  private level: Level | null = null
  private bird: Bird | null = null

  private power = 0
  private maxPower: number = MAX_POWER
  private aiming = false
  private startPos: { x: number; y: number } | null = null
  private angle = 45
  private useSecant = false

  private font = "24px Arial"
  private smallFont = "16px Arial"
  private largeFont = "48px Arial"

  private mousePos: { x: number; y: number } = { x: 0, y: 0 }
  private mouseDown = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not get canvas context")
    }
    this.ctx = context

    // Configurar eventos del mouse
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Eventos del mouse
    this.canvas.addEventListener("mousedown", this.handleMouseDown)
    this.canvas.addEventListener("mouseup", this.handleMouseUp)
    this.canvas.addEventListener("mousemove", this.handleMouseMove)

    // Eventos del teclado
    window.addEventListener("keydown", this.handleKeyDown)

    // Ajustar coordenadas del mouse para canvas responsivo
    window.addEventListener("resize", this.handleResize)
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown)
    this.canvas.removeEventListener("mouseup", this.handleMouseUp)
    this.canvas.removeEventListener("mousemove", this.handleMouseMove)
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("resize", this.handleResize)
  }

  private handleResize = (): void => {
    // Actualizar el factor de escala si el canvas cambia de tamaño
    const rect = this.canvas.getBoundingClientRect()
    this.scaleX = this.canvas.width / rect.width
    this.scaleY = this.canvas.height / rect.height
  }

  private scaleX = 1
  private scaleY = 1

  private getScaledMousePos(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * this.scaleX,
      y: (clientY - rect.top) * this.scaleY,
    }
  }

  private handleMouseDown = (e: MouseEvent): void => {
    const { x, y } = this.getScaledMousePos(e.clientX, e.clientY)
    this.mousePos = { x, y }
    this.mouseDown = true

    if (this.state === GameState.PLAYING && this.bird && !this.bird.isFlying) {
      this.aiming = true
      this.startPos = { x, y }
      this.state = GameState.AIMING
    }
  }

  private handleMouseUp = (e: MouseEvent): void => {
    this.mouseDown = false

    if (this.state === GameState.AIMING && this.startPos && this.bird) {
      const { x, y } = this.getScaledMousePos(e.clientX, e.clientY)

      // Calcular potencia basada en la distancia del arrastre
      const dx = this.startPos.x - x
      const dy = this.startPos.y - y
      this.power = Math.min(Math.sqrt(dx * dx + dy * dy), this.maxPower)

      // Decidir qué método de apuntado usar
      if (this.useSecant && this.level) {
        // Método de la secante (automático)
        const target = this.level.targets.find((t) => !t.hit)

        if (target) {
          const futureTime = this.power / 50
          const futureTargetX = target.x + target.speed * target.direction * futureTime

          const calculatedAngle = calculateOptimalAngle(
            this.bird.x,
            this.bird.y,
            futureTargetX,
            target.y,
            this.power,
            this.level.obstacles,
          )

          this.angle = calculatedAngle !== null ? calculatedAngle : 45
        }
      } else {
        // Método manual (basado en la dirección del arrastre)
        this.angle = calculateAngleFromDrag(this.bird.x, this.bird.y, x, y)
      }

      // Lanzar el pájaro
      this.bird.launch(this.power, this.angle)

      this.aiming = false
      this.state = GameState.PLAYING
    }
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const { x, y } = this.getScaledMousePos(e.clientX, e.clientY)
    this.mousePos = { x, y }
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Cambiar entre modo manual y secante con la tecla M
    if (e.key === "m" || e.key === "M") {
      this.useSecant = !this.useSecant
    }

    // Reiniciar nivel con la tecla R
    if ((e.key === "r" || e.key === "R") && this.bird && !this.bird.isFlying) {
      this.resetLevel()
    }

    // Avanzar con la tecla Espacio
    if (e.key === " ") {
      if (this.state === GameState.MENU) {
        this.startLevel(this.currentLevel)
      } else if (this.state === GameState.LEVEL_COMPLETE) {
        this.currentLevel++
        if (this.currentLevel <= this.maxLevels) {
          this.startLevel(this.currentLevel)
        } else {
          this.state = GameState.GAME_OVER
        }
      } else if (this.state === GameState.GAME_OVER) {
        this.currentLevel = 1
        this.state = GameState.MENU
      }
    }
  }

  private startLevel(levelNumber: number): void {
    this.level = new Level(levelNumber)
    this.bird = new Bird(100, 500)
    this.state = GameState.PLAYING
  }

  private resetLevel(): void {
    if (this.bird && this.level) {
      this.bird.reset()
      this.level.targets.forEach((target) => {
        target.hit = false
      })
    }
  }

  public start(): void {
    // Iniciar el bucle del juego
    this.lastTimestamp = performance.now()
    this.gameLoop(this.lastTimestamp)

    // Inicializar el factor de escala
    this.handleResize()
  }

  public stop(): void {
    // Detener el bucle del juego
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // Eliminar event listeners
    this.removeEventListeners()
  }

  private gameLoop = (timestamp: number): void => {
    // Calcular delta time
    const deltaTime = (timestamp - this.lastTimestamp) / 1000
    this.lastTimestamp = timestamp

    // Actualizar
    this.update(deltaTime)

    // Renderizar
    this.render()

    // Programar el siguiente frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  private update(dt: number): void {
    if (this.state === GameState.PLAYING || this.state === GameState.AIMING) {
      if (this.level) {
        this.level.update()
      }

      if (this.bird) {
        this.bird.update(dt)

        // Verificar colisión con objetivos
        if (this.level && this.bird.checkCollision(this.level.targets, this.level.obstacles)) {
          // Verificar si todos los objetivos han sido alcanzados
          const allTargetsHit = this.level.targets.every((target) => target.hit)
          if (allTargetsHit) {
            this.state = GameState.LEVEL_COMPLETE
          }
        }
      }
    }
  }

  private render(): void {
    // Limpiar el canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.state === GameState.MENU) {
      this.renderMenu()
    } else if (this.state === GameState.PLAYING || this.state === GameState.AIMING) {
      this.renderGame()
    } else if (this.state === GameState.LEVEL_COMPLETE) {
      this.renderLevelComplete()
    } else if (this.state === GameState.GAME_OVER) {
      this.renderGameOver()
    }
  }

  private renderMenu(): void {
    // Fondo
    this.ctx.fillStyle = SKY_BLUE
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Título
    this.ctx.font = this.largeFont
    this.ctx.fillStyle = BLACK
    this.ctx.textAlign = "center"
    this.ctx.fillText("SECANTE BIRDS", this.canvas.width / 2, 150)

    // Instrucciones
    const instructions = [
      "Un juego que utiliza el método de la secante para calcular trayectorias.",
      "Arrastra el mouse para ajustar la fuerza y dirección de lanzamiento.",
      "Presiona M para cambiar entre apuntado manual y automático.",
      "",
      "Presiona ESPACIO para comenzar",
    ]

    this.ctx.font = this.smallFont
    let yOffset = 300
    for (const instruction of instructions) {
      this.ctx.fillText(instruction, this.canvas.width / 2, yOffset)
      yOffset += 30
    }
  }

  private renderGame(): void {
    if (this.level) {
      this.level.render(this.ctx)
    }

    if (this.bird) {
      this.bird.render(this.ctx)
    }

    // Mostrar información
    this.ctx.font = this.font
    this.ctx.fillStyle = BLACK
    this.ctx.textAlign = "left"
    this.ctx.fillText(`Nivel: ${this.currentLevel}`, 20, 60)

    // Mostrar modo de apuntado
    this.ctx.font = this.smallFont
    this.ctx.fillText(`Modo: ${this.useSecant ? "Automático (Secante)" : "Manual"}`, 20, 100)

    // Mostrar ángulo calculado si el pájaro está volando
    if (this.bird && this.bird.isFlying) {
      this.ctx.fillText(`Ángulo: ${Math.round(this.angle)}°`, 20, 130)
    }

    // Mostrar información de potencia durante el apuntado
    if (this.aiming && this.startPos && this.bird) {
      // Dibujar línea de apuntado
      this.ctx.beginPath()
      this.ctx.moveTo(this.bird.x, this.bird.y)
      this.ctx.lineTo(this.mousePos.x, this.mousePos.y)
      this.ctx.strokeStyle = BLACK
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      // Calcular y mostrar potencia
      const dx = this.startPos.x - this.mousePos.x
      const dy = this.startPos.y - this.mousePos.y
      const currentPower = Math.min(Math.sqrt(dx * dx + dy * dy), this.maxPower)

      this.ctx.fillText(`Potencia: ${Math.round(currentPower)}`, 20, 130)

      // Mostrar ángulo durante el apuntado (solo en modo manual)
      if (!this.useSecant) {
        const currentAngle = calculateAngleFromDrag(this.bird.x, this.bird.y, this.mousePos.x, this.mousePos.y)
        this.ctx.fillText(`Ángulo: ${Math.round(currentAngle)}°`, 20, 160)
      }
    }

    // Mostrar instrucciones
    if (this.bird && !this.bird.isFlying && !this.aiming) {
      this.ctx.fillText(
        "Haz clic y arrastra para lanzar. Presiona R para reiniciar. Presiona M para cambiar modo.",
        20,
        this.canvas.height - 30,
      )
    }
  }

  private renderLevelComplete(): void {
    // Renderizar el nivel y el pájaro primero
    if (this.level) {
      this.level.render(this.ctx)
    }

    if (this.bird) {
      this.bird.render(this.ctx)
    }

    // Dibujar panel de nivel completado
    this.ctx.fillStyle = WHITE
    this.ctx.fillRect(this.canvas.width / 4, this.canvas.height / 3, this.canvas.width / 2, this.canvas.height / 3)

    this.ctx.strokeStyle = BLACK
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(this.canvas.width / 4, this.canvas.height / 3, this.canvas.width / 2, this.canvas.height / 3)

    // Texto de nivel completado
    this.ctx.font = this.font
    this.ctx.fillStyle = BLACK
    this.ctx.textAlign = "center"
    this.ctx.fillText(`¡Nivel ${this.currentLevel} Completado!`, this.canvas.width / 2, this.canvas.height / 2 - 50)

    // Texto para continuar
    this.ctx.font = this.smallFont
    if (this.currentLevel < this.maxLevels) {
      this.ctx.fillText("Presiona ESPACIO para continuar", this.canvas.width / 2, this.canvas.height / 2 + 20)
    } else {
      this.ctx.fillText(
        "¡Has completado todos los niveles! Presiona ESPACIO para volver al menú",
        this.canvas.width / 2,
        this.canvas.height / 2 + 20,
      )
    }
  }

  private renderGameOver(): void {
    // Fondo
    this.ctx.fillStyle = SKY_BLUE
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Mensaje de felicitación
    this.ctx.font = this.font
    this.ctx.fillStyle = BLACK
    this.ctx.textAlign = "center"
    this.ctx.fillText("¡Felicidades! Has completado Secante Birds", this.canvas.width / 2, this.canvas.height / 2 - 50)

    // Texto para reiniciar
    this.ctx.font = this.smallFont
    this.ctx.fillText(
      "Presiona ESPACIO para volver al menú principal",
      this.canvas.width / 2,
      this.canvas.height / 2 + 20,
    )
  }
}
