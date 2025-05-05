# game_console.py
import curses, random, time, math

# --- Datos de los planetas ---
PLANETS = [
    {'name':'Gaia',       'oxygen':40, 'condition':'Respirable', 'required':5,
     'func':lambda x: math.sin(x),      'derivative':lambda x: math.cos(x)},
    {'name':'Titan',      'oxygen':30, 'condition':'Tóxica',     'required':7,
     'func':lambda x: math.sin(x)-0.5,  'derivative':lambda x: math.cos(x)},
    {'name':'Eden Prime', 'oxygen':20, 'condition':'Parcial',    'required':6,
     'func':lambda x: math.sin(x)+0.3,  'derivative':lambda x: math.cos(x)},
]

# --- Constantes ---
INITIAL_ENERGY = 60
MAP_WIDTH      = 40
OX_DEC_BASE    = 1.0    # segundos por 1% de O₂ en clima templado
TOL            = 1e-7

# --- Newton–Raphson ---
def newton_raphson(f, df, x0, tol, max_iter):
    x = x0
    for i in range(1, max_iter+1):
        fx  = f(x)
        dfx = df(x)
        if dfx == 0: return False, i
        x  = x - fx/dfx
        if abs(fx) < tol:
            return True, i
    return False, max_iter

def play(stdscr):
    curses.curs_set(0)
    stdscr.nodelay(True)
    stdscr.timeout(100)

    # Crear ventanas: mapa a la izq, monitor a la derecha
    h, w = stdscr.getmaxyx()
    map_h, map_w = h, MAP_WIDTH
    mon_w = 30
    map_win = curses.newwin(map_h, map_w, 0, 0)
    mon_win = curses.newwin(map_h, mon_w, 0, map_w+1)

    level = 0
    # Estas variables se irán llenando en cada planeta
    last_root = None   # (root, its)
    last_fx   = None

    while True:
        if level >= len(PLANETS):
            stdscr.clear()
            stdscr.addstr( h//2, w//2-10, "🎉 ¡GANASTE! 🎉")
            stdscr.refresh()
            stdscr.getch()
            return

        # --- Carga planeta y estado inicial ---
        p = PLANETS[level]
        oxygen    = p['oxygen']
        initial_o = oxygen
        energy    = INITIAL_ENERGY
        collected = 0
        resources = set(random.sample(range(1,MAP_WIDTH-1), p['required']))
        player_x  = MAP_WIDTH//2
        last_ox   = time.time()
        last_root = None
        last_fx   = None

        # Parámetros dibujo montaña
        H = 8
        scale = 5.0
        base_row = 4

        # Bucle del planeta
        while True:
            now = time.time()
            # --- Gestión oxígeno según clima ---
            height  = math.sin(player_x/scale)
            climate = 'Frío' if height>0 else 'Calor'
            rate    = OX_DEC_BASE * (1.5 if climate=='Frío' else 0.5)
            if now - last_ox >= rate:
                oxygen -= 1
                last_ox = now
                if oxygen<=0:
                    mon_win.clear()
                    mon_win.addstr(2,1,"💀 Sin oxígeno. MUERTO.")
                    mon_win.refresh()
                    time.sleep(2)
                    return

            # --- Dibujar mapa ---
            map_win.clear()
            # montaña ondulada
            heights = [int((math.sin(i/scale)+1)/2*(H-1)) for i in range(MAP_WIDTH)]
            for x in range(MAP_WIDTH):
                y = base_row + (H-1-heights[x])
                map_win.addch(y, x, '#')
            # recursos
            for x in resources:
                y = base_row + (H-1-heights[x])
                map_win.addch(y, x, 'R')
            # jugador
            py = base_row + (H-1-heights[player_x])
            map_win.addch(py, player_x, 'P')
            map_win.refresh()

            # --- Dibujar monitor ---
            mon_win.clear()
            mon_win.box()
            mon_win.addstr(1,1, f"Planeta: {p['name']}")
            mon_win.addstr(2,1, f"Cond: {p['condition'][:20]}")
            mon_win.addstr(4,1, f"Clima: {climate}")
            mon_win.addstr(5,1, f"O₂: {oxygen:3d}%")
            mon_win.addstr(6,1, f"En: {energy:3d}")
            mon_win.addstr(7,1, f"Rec: {collected}/{p['required']}")
            # indicador fx
            x0 = player_x/scale
            fx = p['func'](x0)
            last_fx = fx
            mon_win.addstr(9,1, f"f(x)= {fx: .3f}")
            # últimas raíces
            if last_root:
                r,i = last_root
                mon_win.addstr(11,1, f"root: {r: .3f}")
                mon_win.addstr(12,1, f"iter: {i:2d}")
            mon_win.addstr(14,1, "A/D=Mover")
            mon_win.addstr(15,1, "M=Minar  I=Indic")
            mon_win.addstr(16,1, "L=SalirPl  T=Terraform")
            mon_win.addstr(17,1, "Q=Quit")
            mon_win.refresh()

            # --- Leer tecla ---
            key = stdscr.getch()
            if key<0: continue
            c = chr(key).lower()
            if c=='q':
                return

            # Movimiento
            if c=='a' and player_x>0:
                player_x-=1; energy-=1
            elif c=='d' and player_x<MAP_WIDTH-1:
                player_x+=1; energy-=1

            # Minar
            if c=='m' and player_x in resources:
                resources.remove(player_x)
                collected +=1

            # Indicador (recalcula newton sin agotar nivel)
            if c=='i':
                ok,i = newton_raphson(p['func'], p['derivative'], x0, TOL, energy)
                last_root = (x0, i) if ok else (None, i)

            # Dejar planeta (terraformar)
            if c=='l':
                if collected < p['required']:
                    # no cumple
                    continue
                ok,i = newton_raphson(p['func'], p['derivative'], x0, TOL, energy)
                if ok:
                    level+=1
                    break
                else:
                    mon_win.clear()
                    mon_win.addstr(2,1,"💀 Falló terraform. MUERTO.")
                    mon_win.refresh()
                    time.sleep(2)
                    return

            # Verificar energía
            if energy<=0:
                mon_win.clear()
                mon_win.addstr(2,1,"💀 Sin energía. MUERTO.")
                mon_win.refresh()
                time.sleep(2)
                return

def main():
    curses.wrapper(play)

if __name__=='__main__':
    main()
