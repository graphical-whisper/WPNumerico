import { BLACK, BROWN } from "./game"

export class Obstacle {
  public x: number
  public y: number
  public width: number
  public height: number
  public color: string

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = BROWN
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Dibujar rectángulo principal
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Dibujar borde
    ctx.strokeStyle = BLACK
    ctx.lineWidth = 2
    ctx.strokeRect(this.x, this.y, this.width, this.height)
  }
}
