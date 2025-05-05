import { BLACK, GREEN, SCREEN_WIDTH, SKY_BLUE } from "./game"
import { Obstacle } from "./obstacle"
import { Target } from "./target"

const SCREEN_HEIGHT = 600

export class Level {
  public levelNumber: number
  public targets: Target[]
  public obstacles: Obstacle[]
  public description: string

  constructor(levelNumber: number) {
    this.levelNumber = levelNumber
    this.targets = []
    this.obstacles = []
    this.description = ""
    this.setupLevel()
  }

  private setupLevel(): void {
    if (this.levelNumber === 1) {
      this.description = "Nivel 1: Objetivos estáticos - Ajusta la fuerza para alcanzar el objetivo"
      this.targets = [new Target(900, 500, 0)]
    } else if (this.levelNumber === 2) {
      this.description = "Nivel 2: Objetivos móviles - El objetivo se mueve horizontalmente"
      this.targets = [new Target(900, 500, 3)]
    } else if (this.levelNumber === 3) {
      this.description = "Nivel 3: Obstáculos - Evita los obstáculos para alcanzar el objetivo"
      this.targets = [new Target(900, 500, 2)]
      this.obstacles = [new Obstacle(500, 400, 30, 300), new Obstacle(700, 200, 30, 250)]
    } else if (this.levelNumber === 4) {
      this.description = "Nivel 4: Desafío completo - Múltiples objetivos móviles y obstáculos"
      this.targets = [new Target(800, 500, 4), new Target(900, 300, -3), new Target(1000, 400, 2)]
      this.obstacles = [
        new Obstacle(450, 350, 30, 350),
        new Obstacle(650, 150, 30, 200),
        new Obstacle(850, 250, 30, 150),
      ]
    }
  }

  public update(): void {
    for (const target of this.targets) {
      target.update()
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Dibujar fondo
    ctx.fillStyle = SKY_BLUE
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
    ctx.fillStyle = GREEN
    ctx.fillRect(0, 550, SCREEN_WIDTH, 150)

    // Dibujar descripción del nivel
    ctx.font = "24px Arial"
    ctx.fillStyle = BLACK
    ctx.textAlign = "left"
    ctx.fillText(this.description, 20, 20)

    // Dibujar objetivos y obstáculos
    for (const target of this.targets) {
      target.render(ctx)
    }

    for (const obstacle of this.obstacles) {
      obstacle.render(ctx)
    }
  }
}
