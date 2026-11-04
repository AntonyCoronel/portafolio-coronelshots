#!/usr/bin/env python3
"""Genera img/galeria/*.webp y galeria-datos.js a partir de tus fotos originales.
Para agregar una foto: añade una línea a FOTOS y corre  python3 tools/construir_galeria.py
Las copias no llevan EXIF (ni GPS); solo el ajuste (sin la cámara) se guarda como texto."""
import json, os, subprocess, tempfile
from PIL import Image, ImageOps, ExifTags
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = os.path.expanduser('~/Desktop/FotosPersonales')
F, T, M, B = f'{R}/fotos', f'{H}/TelcelMan/tecelManEditadas', f'{H}/MoshiMoshi/MoshiEditadas', f'{H}/BodaMontery'
E_ = f'{H}/Editadas'
CM = os.path.expanduser('~/Desktop/Fotos/maykaCumpleaños/Fotos/CumpleMaykaEditadas')
FOTOS = [
 # (archivo, categoría, texto alternativo)
 (f'{F}/social/2.jpg','social','Quinceañera con vestido rojo largo frente a una casona roja y sus chambelanes de azul'),
 (f'{B}/5R0A1721.CR3','social','Primer baile de los novios bajo una lluvia de confeti'),
 (f'{B}/5R0A1724.CR3','social','Los novios bailando su primer baile frente a sus invitados'),
 (f'{CM}/5R0A8164.jpg','social','Grupo musical tocando en una fiesta de cumpleaños'),
 (f'{B}/5R0A1845.CR3','social','La novia rodeada de sus amigas, en una foto de grupo'),
 (f'{CM}/5R0A8187.jpg','social','Mujer con traje típico blanco y rojo y un abanico, sonriendo en una fiesta'),
 (f'{B}/5R0A1718.CR3','social','Lluvia de confeti sobre la pista de una boda, vista desde lo alto'),
 (f'{CM}/5R0A8115.jpg','social','Pastel de cumpleaños adornado con rosas rojas de betún'),
 (f'{B}/5R0A1736.CR3','social','Manos de un DJ sobre su consola en una boda'),
 (f'{CM}/5R0A8211.jpg','social','Zapatos rojos bailando sobre una pista iluminada'),
 (f'{B}/5R0A1784.CR3','social','El novio cargando a un niño junto a la novia, que aplaude'),
 (f'{CM}/5R0A8248.jpg','social','Pareja bailando abrazada en una fiesta de cumpleaños'),
 (f'{B}/5R0A1868.CR3','social','La novia abrazando a una invitada en la pista'),
 (f'{CM}/5R0A8160.jpg','social','Manos tocando una conga'),
 (f'{B}/5R0A1942.CR3','social','La novia y sus amigos de traje divirtiéndose frente a la cámara'),
 (f'{CM}/5R0A8226.jpg','social','Invitados bailando en una pista de luces rosas y moradas'),
 (f'{F}/social/5.jpg','social','Banda de guerra uniformada de negro y dorado posando con sus banderas'),
 (f'{F}/social/1.jpg','social','Grupo de estudiantes en un marco de cempasúchil de Día de Muertos en La Salle'),
 (f'{F}/social/3.jpg','social','Cuatro cocineras con mandil sonriendo en una fiesta de pueblo'),
 (f'{B}/5R0A1741.CR3','social','Centro de mesa con flores y velas encendidas en una boda de noche'),
 (f'{F}/social/portada.jpg','social','Generación de graduados de traje con sus diplomas'),
 (f'{F}/social/4.jpg','social','Pareja con sombrero y globos bajo papel picado'),
 (f'{F}/social/6.jpg','social','Cuatro personas de gala saludando a la cámara en un evento'),
 (f'{F}/retrato/portada.jpg','retrato','Bebé de vestido blanco tomada de la mano en una iglesia'),
 (f'{F}/retrato/4.jpg','retrato','Mujer con lentes navideños saludando frente a una cortina azul brillante'),
 (f'{F}/retrato/2.jpg','retrato','Joven de lentes sonriendo bajo los árboles'),
 (f'{F}/retrato/3.jpg','retrato','Familia con su bebé de bautizo, en un patio de paredes amarillas'),
 (f'{F}/retrato/1.jpg','retrato','Señor vestido de Santa junto a un muñeco de nieve iluminado'),
 (f'{F}/retrato/6.jpg','retrato','Joven de lentes y blusa rosa sonriendo'),
 (f'{F}/retrato/5.jpg','retrato','Pareja sonriendo juntos en un jardín'),
 (f'{F}/producto/5.jpg','producto','Audífono blanco en la oreja de un joven de gorra roja, sobre fondo negro'),
 (f'{M}/IMG_7103.jpg','producto','Torre de sushi de tres niveles sobre una mesa de madera'),
 (f'{F}/producto/3.jpg','producto','Mujer tomándose una foto con un celular negro entre plantas'),
 (f'{T}/IMG_7440.jpg','producto','Audífonos blancos y su estuche sobre fondo negro'),
 (f'{M}/IMG_7076.jpg','producto','Rollos de sushi con salsas en primer plano'),
 (f'{F}/producto/4.jpg','producto','Manos sirviéndose cupcakes rosas en una mesa de postres'),
 (f'{F}/producto/1.jpg','producto','Tartaletas de mango y tarjeta de la pastelería Mica'),
 (f'{M}/IMG_7065.jpg','producto','Letrero de madera de sushi con un foco encendido'),
 (f'{T}/IMG_7487.jpg','producto','Mujer hablando con un celular de funda roja'),
 (f'{F}/producto/2.jpg','producto','Platillo de mariscos servido en un envase para llevar'),
 (f'{F}/producto/portada.jpg','producto','Estuche de audífonos junto a su caja, en fondo negro'),
 (f'{M}/IMG_7057.jpg','producto','Letrero ovalado del restaurante Moshi Moshi visto en contrapicado'),
 (f'{M}/IMG_7083.jpg','producto','Bebida con hielo y popote sobre una barra de madera'),
 (f'{F}/producto/6.jpg','producto','Audífonos y su estuche abierto, sobre fondo negro'),
 (f'{F}/especial/portada.jpg','especial','Persona en silla de ruedas bajo unas enredaderas, en blanco y negro'),
 (f'{R}/5R0A8096.jpg','especial','Patio colonial de arcos visto hacia el cielo, con plantas colgando'),
 (f'{F}/especial/5.jpg','especial','Avión comercial cruzando el cielo azul junto a una columna'),
 (f'{F}/especial/3.jpg','especial','Alberca abandonada de agua verde azulada en medio del bosque'),
 (f'{E_}/IMG_8251.jpg','especial','Cerca de órganos sobre una loma de pasto verde'),
 (f'{F}/especial/4.jpg','especial','Joven riéndose frente a un tablero de ajedrez'),
 (f'{E_}/IMG_8230.jpg','especial','Grecas de piedra en un muro prehispánico'),
 (f'{F}/especial/1.jpg','especial','Mano colocando una ficha sobre un tablero de lotería'),
 (f'{E_}/IMG_8266.jpg','especial','Arbusto de flores rojas'),
 (f'{F}/especial/6.jpg','especial','Colibrí en vuelo sobre un arbusto'),
 (f'{R}/5R0A8095.jpg','especial','Columna de piedra y lámpara en un corredor colonial'),
 (f'{T}/IMG_7410.jpg','especial','Yuntas de bueyes caminando por un camino de terracería'),
 (f'{F}/especial/2.jpg','especial','Mariposa amarilla posada sobre un muro claro'),
 (f'{E_}/IMG_8186.jpg','especial','Campana de una capilla contra el cielo nublado'),
 (f'{M}/IMG_7006.jpg','especial','Mano moviendo una pieza negra en un tablero de ajedrez'),
 (f'{E_}/IMG_8197.jpg','especial','Flores azules abiertas sobre hojas verdes'),
 (f'{T}/IMG_7300.jpg','especial','Sendero entre árboles en un bosque cerrado'),
]
TAGS = {v: k for k, v in ExifTags.TAGS.items()}
def num(v):
    try: return float(v)
    except Exception: return None
def exif_txt(im):
    ex = im.getexif(); i = ex.get_ifd(0x8769)
    f, s, iso, lens = num(i.get(TAGS['FNumber'])), num(i.get(TAGS['ExposureTime'])), i.get(TAGS['ISOSpeedRatings']), num(i.get(TAGS['FocalLength']))
    p = []
    if lens: p.append(f'{lens:.0f} mm')
    if f: p.append(f'f/{f:.1f}'.replace('.0', ''))
    if s: p.append(f'1/{round(1/s)} s' if s < 1 else f'{s:g} s')
    if iso: p.append(f'ISO {iso}')
    return ' · '.join(p)
def abrir(src, tmp):
    if src.upper().endswith('.CR3'):
        out = os.path.join(tmp, os.path.basename(src) + '.jpg')
        subprocess.run(['sips', '-s', 'format', 'jpeg', '-Z', '3000', src, '--out', out], capture_output=True, check=True)
        return Image.open(out)
    return Image.open(src)
def main():
    out = f'{R}/img/galeria'; os.makedirs(out, exist_ok=True); datos = []
    with tempfile.TemporaryDirectory() as tmp:
        for n, (src, cat, alt) in enumerate(FOTOS, 1):
            im = abrir(src, tmp); ex = exif_txt(im)
            im = ImageOps.exif_transpose(im).convert('RGB'); w, h = im.size
            nom = f'{cat}-{n:02d}'
            g = im.copy(); g.thumbnail((2000, 2000), Image.LANCZOS); g.save(f'{out}/{nom}.webp', quality=82, method=6)
            c = im.copy(); c.thumbnail((900, 900), Image.LANCZOS); c.save(f'{out}/{nom}-m.webp', quality=74, method=6)
            datos.append(dict(id=nom, cat=cat, alt=alt, w=c.width, h=c.height, exif=ex))
    with open(f'{R}/galeria-datos.js', 'w') as f:
        f.write('// Generado por tools/construir_galeria.py\nwindow.GALERIA = ' + json.dumps(datos, ensure_ascii=False, indent=0) + ';\n')
    print(len(datos), 'fotos')
main()
