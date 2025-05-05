import { BLACK, SCREEN_WIDTH, YELLOW } from "./game"

export class Target {
  public x: number
  public y: number
  public radius: number
  public color: string
  public speed: number
  public direction: number
  public hit: boolean

  constructor(x: number, y: number, speed: number) {
    this.x = x
    this.y = y
    this.radius = 25
    this.color = YELLOW
    this.speed = speed
    this.direction = 1
    this.hit = false
  }

  public update(): void {
    if (this.speed !== 0) {
      this.x += this.speed * this.direction

      // Cambiar dirección si llega a los bordes
      if (this.x > SCREEN_WIDTH - 50 || this.x < 50) {
        this.direction *= -1
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.hit) {
      // Dibujar círculo principal
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()

      // Dibujar círculos concéntricos
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.strokeStyle = BLACK
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
}
