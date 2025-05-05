// Constantes globales
const SCREEN_WIDTH = 1200
const SCREEN_HEIGHT = 700
const FPS = 60
const MAX_POWER = 100

// Colores
const WHITE = "#FFFFFF"
const BLACK = "#000000"
const RED = "#FF0000"
const GREEN = "#00FF00"
const BLUE = "#0000FF"
const YELLOW = "#FFFF00"
const BROWN = "#8B4513"
const SKY_BLUE = "#87CEEB"
const GRAY = "#808080"

// Ajustes físicos
const VELOCITY_MULTIPLIER = 2.5 // Aumentado para que la bola se mueva más rápido
const GRAVITY = 12.0

// Estados del juego
const GameState = {
  MENU: 0,
  PLAYING: 1,
  GAME_OVER: 2,
  LEVEL_COMPLETE: 3,
  AIMING: 4,
}

// Clase Bird (Pájaro)
class Bird {
  constructor(x, y) {
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

  launch(power, angle) {
    const angleRad = (angle * Math.PI) / 180
    this.velocityX = power * VELOCITY_MULTIPLIER * Math.cos(angleRad)
    this.velocityY = power * VELOCITY_MULTIPLIER * Math.sin(angleRad)
    this.isFlying = true
    this.trajectoryPoints = []
  }

  reset() {
    this.x = this.startX
    this.y = this.startY
    this.velocityX = 0
    this.velocityY = 0
    this.isFlying = false
    this.trajectoryPoints = []
  }

  update(dt) {
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
      if (this.x > SCREEN_WIDTH + 100 || this.x < -100) {
        this.isFlying = false
      }
    }
  }

  checkCollision(targets, obstacles) {
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

  render(ctx) {
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

// Clase Target (Objetivo)
class Target {
  constructor(x, y, speed) {
    this.x = x
    this.y = y
    this.radius = 25
    this.color = YELLOW
    this.speed = speed
    this.direction = 1
    this.hit = false
  }

  update() {
    if (this.speed !== 0) {
      this.x += this.speed * this.direction

      // Cambiar dirección si llega a los bordes
      if (this.x > SCREEN_WIDTH - 50 || this.x < 50) {
        this.direction *= -1
      }
    }
  }

  render(ctx) {
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

// Clase Obstacle (Obstáculo)
class Obstacle {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = BROWN
  }

  render(ctx) {
    // Dibujar rectángulo principal
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Dibujar borde
    ctx.strokeStyle = BLACK
    ctx.lineWidth = 2
    ctx.strokeRect(this.x, this.y, this.width, this.height)
  }
}

// Clase Level (Nivel)
class Level {
  constructor(levelNumber) {
    this.levelNumber = levelNumber
    this.targets = []
    this.obstacles = []
    this.description = ""
    this.setupLevel()
  }

  setupLevel() {
    if (this.levelNumber === 1) {
      this.description = "Nivel 1: Objetivos estáticos - Ajusta la fuerza para alcanzar el objetivo"
      this.targets = [new Target(900, 500, 0)]
      this.obstacles = []
    } else if (this.levelNumber === 2) {
      this.description = "Nivel 2: Objetivos móviles - El objetivo se mueve horizontalmente"
      this.targets = [new Target(900, 500, 3)]
      this.obstacles = []
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

  update() {
    for (const target of this.targets) {
      target.update()
    }
  }

  render(ctx) {
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

// Clase SecantSolver (Solucionador por método de la secante)
class SecantSolver {
  constructor(maxIterations = 20, tolerance = 1e-6) {
    this.maxIterations = maxIterations
    this.tolerance = tolerance
  }

  solve(f, x0, x1) {
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

// Función para calcular ángulo óptimo usando el método de la secante
function calculateOptimalAngle(birdX, birdY, targetX, targetY, power, obstacles = []) {
  const solver = new SecantSolver()

  // Función que modela la diferencia entre la posición final del proyectil y el objetivo
  const trajectoryError = (angle) => {
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

// Función para calcular ángulo basado en la dirección del arrastre del mouse
function calculateAngleFromDrag(startX, startY, endX, endY) {
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

// Clase principal del juego
class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")
    this.animationFrameId = null
    this.lastTimestamp = 0

    this.state = GameState.MENU
    this.currentLevel = 1
    this.maxLevels = 4
    this.level = null
    this.bird = null

    this.power = 0
    this.maxPower = MAX_POWER
    this.aiming = false
    this.startPos = null
    this.angle = 45
    this.useSecant = false

    this.font = "24px Arial"
    this.smallFont = "16px Arial"
    this.largeFont = "48px Arial"

    this.mousePos = { x: 0, y: 0 }
    this.mouseDown = false

    // Configurar eventos del mouse y teclado
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Eventos del mouse
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this))
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this))
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this))

    // Eventos del teclado
    window.addEventListener("keydown", this.handleKeyDown.bind(this))

    // Ajustar coordenadas del mouse para canvas responsivo
    window.addEventListener("resize", this.handleResize.bind(this))
    this.handleResize()
  }

  handleResize() {
    // Actualizar el factor de escala si el canvas cambia de tamaño
    const rect = this.canvas.getBoundingClientRect()
    this.scaleX = this.canvas.width / rect.width
    this.scaleY = this.canvas.height / rect.height
  }

  getScaledMousePos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * this.scaleX,
      y: (clientY - rect.top) * this.scaleY,
    }
  }

  handleMouseDown(e) {
    const { x, y } = this.getScaledMousePos(e.clientX, e.clientY)
    this.mousePos = { x, y }
    this.mouseDown = true

    if (this.state === GameState.PLAYING && this.bird && !this.bird.isFlying) {
      this.aiming = true
      this.startPos = { x, y }
      this.state = GameState.AIMING
    }
  }

  handleMouseUp(e) {
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

  handleMouseMove(e) {
    const { x, y } = this.getScaledMousePos(e.clientX, e.clientY)
    this.mousePos = { x, y }
  }

  handleKeyDown(e) {
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

  startLevel(levelNumber) {
    this.level = new Level(levelNumber)
    this.bird = new Bird(100, 500)
    this.state = GameState.PLAYING
  }

  resetLevel() {
    if (this.bird && this.level) {
      this.bird.reset()
      this.level.targets.forEach((target) => {
        target.hit = false
      })
    }
  }

  start() {
    // Iniciar el bucle del juego
    this.lastTimestamp = performance.now()
    this.gameLoop(this.lastTimestamp)
  }

  stop() {
    // Detener el bucle del juego
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  gameLoop(timestamp) {
    // Calcular delta time
    const deltaTime = (timestamp - this.lastTimestamp) / 1000
    this.lastTimestamp = timestamp

    // Actualizar
    this.update(deltaTime)

    // Renderizar
    this.render()

    // Programar el siguiente frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this))
  }

  update(dt) {
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

  render() {
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

  renderMenu() {
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

  renderGame() {
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

  renderLevelComplete() {
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

  renderGameOver() {
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

// Inicializar el juego cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas")
  const game = new Game(canvas)
  game.start()
})
