import math, random
from js import document, window

# --- Planetas con sus funciones no lineales y derivadas ---
PLANETS = [
    {'name':'Gaia',       'oxygen':40, 'cond':'Respirable','req':5,
     'f':lambda x: math.sin(x),      'df':lambda x: math.cos(x)},
    {'name':'Titan',      'oxygen':30, 'cond':'Tóxica',   'req':7,
     'f':lambda x: math.sin(x)-0.5,  'df':lambda x: math.cos(x)},
    {'name':'Eden Prime', 'oxygen':20, 'cond':'Parcial',  'req':6,
     'f':lambda x: math.sin(x)+0.3,  'df':lambda x: math.cos(x)},
]

INITIAL_ENERGY = 60
WIDTH          = 40
OX_MS          = 1000   # milisegundos por 1% de O₂
TOL            = 1e-7

def newton(f, df, x0, tol, max_iter):
    x = x0
    for i in range(1, max_iter+1):
        fx  = f(x)
        dfx = df(x)
        if dfx == 0:
            return False, i
        x = x - fx/dfx
        if abs(fx) < tol:
            return True, i
    return False, max_iter

# Estado global
state = {
    'lvl': 0,
    'en': INITIAL_ENERGY,
    'ox': PLANETS[0]['oxygen'],
    'col': 0,
    'res': set(),
}

def init_level():
    p = PLANETS[state['lvl']]
    state['en']  = INITIAL_ENERGY
    state['ox']  = p['oxygen']
    state['col'] = 0
    state['res'] = set(random.sample(range(WIDTH), p['req']))
    render()

def render():
    p = PLANETS[state['lvl']]
    # Pintar estado en el panel superior
    document.getElementById('status').innerHTML = (
        f"{p['name']} — {p['cond']}<br>"
        f"O₂: {state['ox']}%  En: {state['en']}  Rec: {state['col']}/{p['req']}"
    )
    # Construir mapa ondulado
    arr = []
    scale, H = 5.0, 6
    for x in range(WIDTH):
        h = int((math.sin(x/scale) + 1) / 2 * (H - 1))
        ch = '^' if h > H//2 else '_'
        if x in state['res']:
            ch = 'R'
        arr.append(ch)
    center = WIDTH // 2
    arr[center] = 'P'
    document.getElementById('map').textContent = ''.join(arr)

def decay_oxygen():
    p = PLANETS[state['lvl']]
    c = WIDTH // 2
    height = math.sin(c / 5.0)
    rate = 1.5 if height > 0 else 0.5
    state['ox'] = max(0, state['ox'] - 1)
    render()
    if state['ox'] <= 0:
        window.alert("💀 Te quedaste sin oxígeno. Fin del juego.")
        return
    window.setTimeout(decay_oxygen, int(OX_MS * rate))

def on_key(evt):
    k = evt.key.lower()
    p = PLANETS[state['lvl']]
    c = WIDTH // 2

    if k == 'q':
        window.alert("Juego terminado.")
        return

    if k in ('a','d'):
        # Mover simula recolección
        if c in state['res']:
            state['res'].remove(c)
            state['col'] += 1
        state['en'] = max(0, state['en'] - 1)

    elif k == 'm':
        # Minar explícito
        if c in state['res']:
            state['res'].remove(c)
            state['col'] += 1

    elif k == 'i':
        # Indicador: un paso de Newton–Raphson
        ok, it = newton(p['f'], p['df'], c / 5.0, TOL, state['en'])
        window.alert(f"Indicador:\nConverge? {ok}\nIteraciones: {it}")

    elif k == 't':
        # Terraformar si se tienen todos los recursos
        if state['col'] < p['req']:
            window.alert("Te faltan recursos para terraformar.")
            return
        ok, it = newton(p['f'], p['df'], c / 5.0, TOL, state['en'])
        if not ok:
            window.alert("💀 Terraformación fallida. Fin del juego.")
            return
        state['lvl'] += 1
        if state['lvl'] >= len(PLANETS):
            window.alert("🎉 ¡Has terraformado todos los planetas! ¡Ganaste!")
            return
        init_level()
        return

    render()

# Punto de entrada
init_level()
document.getElementById('game-container').focus()
document.addEventListener('keydown', on_key)
decay_oxygen()
