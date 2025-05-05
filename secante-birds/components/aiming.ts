import { GRAVITY, VELOCITY_MULTIPLIER } from "./game"
import type { Obstacle } from "./obstacle"

export function calculateAngleFromDrag(startX: number, startY: number, endX: number, endY: number): number {
  const dx = endX - startX
  const dy = endY - startY

  if (dx === 0 && dy === 0) {
    return 45 // Valor por defecto si no hay movimiento
  }

  const angleRad = Math.atan2(-dy, -dx) // Invertido para que apunte hacia la dirección opuesta al arrastre
  let angleDeg = (angleRad * 180) / Math.PI

  if (angleDeg < 0) {
    angleDeg += 360
  }

  return angleDeg
}

class SecantSolver {
  private maxIterations: number
  private tolerance: number

  constructor(maxIterations = 20, tolerance = 1e-6) {
    this.maxIterations = maxIterations
    this.tolerance = tolerance
  }

  public solve(f: (x: number) => number, x0: number, x1: number): number | null {
    for (let i = 0; i < this.maxIterations; i++) {
      const fx0 = f(x0)
      const fx1 = f(x1)

      if (Math.abs(fx1) < this.tolerance) {
        return x1
      }

      if (fx0 === fx1) {
        // Evitar división por cero
        return null
      }

      // Fórmula del método de la secante
      const xNew = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0)

      x0 = x1
      x1 = xNew
    }

    return Math.abs(f(x1)) < this.tolerance ? x1 : null
  }
}

export function calculateOptimalAngle(
  birdX: number,
  birdY: number,
  targetX: number,
  targetY: number,
  power: number,
  obstacles: Obstacle[] = [],
): number | null {
  const solver = new SecantSolver()

  // Función que modela la diferencia entre la posición final del proyectil y el objetivo
  const trajectoryError = (angle: number): number => {
    // Convertir ángulo a radianes
    const angleRad = (angle * Math.PI) / 180

    // Velocidad inicial en componentes x, y
    const v0x = power * VELOCITY_MULTIPLIER * Math.cos(angleRad)
    const v0y = -power * VELOCITY_MULTIPLIER * Math.sin(angleRad) // Negativo para que vaya hacia arriba

    if (v0x === 0) {
      return Number.POSITIVE_INFINITY // Evitar división por cero
    }

    // Tiempo que tarda en alcanzar la posición horizontal del objetivo
    const t = (targetX - birdX) / v0x

    if (t < 0) {
      return Number.POSITIVE_INFINITY // El objetivo está detrás y no se puede alcanzar
    }

    // Posición vertical en ese tiempo
    const y = birdY + v0y * t + 0.5 * GRAVITY * t * t

    // Verificar si hay colisión con obstáculos
    if (obstacles.length > 0) {
      const dt = 0.1
      let currentT = 0

      while (currentT < t) {
        const currentX = birdX + v0x * currentT
        const currentY = birdY + v0y * currentT + 0.5 * GRAVITY * currentT * currentT

        for (const obstacle of obstacles) {
          if (
            currentX > obstacle.x &&
            currentX < obstacle.x + obstacle.width &&
            currentY > obstacle.y &&
            currentY < obstacle.y + obstacle.height
          ) {
            return Number.POSITIVE_INFINITY // Colisión con obstáculo
          }
        }

        currentT += dt
      }
    }

    // Devuelve la diferencia entre la posición vertical calculada y la del objetivo
    return y - targetY
  }

  // Intentar diferentes valores iniciales para mejorar convergencia
  const anglesToTry = [
    [20, 60],
    [10, 70],
    [5, 45],
    [30, 75],
    [15, 85],
  ]

  for (const [x0, x1] of anglesToTry) {
    const result = solver.solve(trajectoryError, x0, x1)
    if (result !== null && result >= 0 && result <= 90) {
      return result
    }
  }

  // Si no converge con los intentos anteriores, devolver un ángulo predeterminado
  return 45
}
