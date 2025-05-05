import { GRAVITY, RED, VELOCITY_MULTIPLIER } from "./game"
import type { Obstacle } from "./obstacle"
import type { Target } from "./target"

export class Bird {
  public x: number
  public y: number
  public radius: number
  public color: string
  public velocityX: number
  public velocityY: number
  public isFlying: boolean
  private startX: number
  private startY: number
  public trajectoryPoints: Array<{ x: number; y: number }>

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.radius = 15
    this.color = RED
    this.velocityX = 0
    this.velocityY = 0
    this.isFlying = false
    this.startX = x
    this.startY = y
    this.trajectoryPoints = []
  }

  public launch(power: number, angle: number): void {
    const angleRad = (angle * Math.PI) / 180
    this.velocityX = power * VELOCITY_MULTIPLIER * Math.cos(angleRad)
    this.velocityY = power * VELOCITY_MULTIPLIER * Math.sin(angleRad)
    this.isFlying = true
    this.trajectoryPoints = []
  }

  public reset(): void {
    this.x = this.startX
    this.y = this.startY
    this.velocityX = 0
    this.velocityY = 0
    this.isFlying = false
    this.trajectoryPoints = []
  }

  public update(dt: number): void {
    if (this.isFlying) {
      // Física simple de movimiento parabólico
      this.x += this.velocityX * dt
      this.y += this.velocityY * dt
      this.velocityY += GRAVITY * dt

      // Guardar puntos para la trayectoria
      if (this.trajectoryPoints.length < 100) {
        this.trajectoryPoints.push({ x: Math.round(this.x), y: Math.round(this.y) })
      }

      // Colisión con el suelo
      if (this.y + this.radius > 550) {
        this.y = 550 - this.radius
        this.isFlying = false
      }

      // Fuera de la pantalla
      if (this.x > 1200 + 100 || this.x < -100) {
        this.isFlying = false
      }
    }
  }

  public checkCollision(targets: Target[], obstacles: Obstacle[]): boolean {
    if (!this.isFlying) {
      return false
    }

    // Colisión con objetivos
    for (const target of targets) {
      if (!target.hit) {
        const dx = this.x - target.x
        const dy = this.y - target.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.radius + target.radius) {
          target.hit = true
          return true
        }
      }
    }

    // Colisión con obstáculos
    for (const obstacle of obstacles) {
      if (
        this.x + this.radius > obstacle.x &&
        this.x - this.radius < obstacle.x + obstacle.width &&
        this.y + this.radius > obstacle.y &&
        this.y - this.radius < obstacle.y + obstacle.height
      ) {
        this.isFlying = false
        return false
      }
    }

    return false
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Dibujar el pájaro
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()

    // Dibujar trayectoria
    if (this.trajectoryPoints.length > 1) {
      ctx.beginPath()
      ctx.moveTo(this.trajectoryPoints[0].x, this.trajectoryPoints[0].y)

      for (let i = 1; i < this.trajectoryPoints.length; i++) {
        ctx.lineTo(this.trajectoryPoints[i].x, this.trajectoryPoints[i].y)
      }

      ctx.strokeStyle = "rgba(100, 100, 100, 0.7)"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}
