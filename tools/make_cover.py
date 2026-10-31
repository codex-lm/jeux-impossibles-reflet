# Génère cover.png (1500x950) : nuit indigo, deux lucioles en miroir, titre.
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

W, H = 1500, 950
img = Image.new("RGB", (W, H), (11, 14, 42))
d = ImageDraw.Draw(img)

# dégradé vertical
for y in range(H):
    t = y / H
    r = int(11 + (22 - 11) * t)
    g = int(14 + (29 - 14) * t)
    b = int(42 + (78 - 42) * t)
    d.line([(0, y), (W, y)], fill=(r, g, b))

# grille discrète
for x in range(0, W, 95):
    d.line([(x, 0), (x, H)], fill=(30, 36, 90), width=1)
for y in range(0, H, 95):
    d.line([(0, y), (W, y)], fill=(30, 36, 90), width=1)

# halo lumineux (couche floutée)
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)

def orb(draw, cx, cy, radius, color, core):
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    cr = radius * 0.34
    draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=core)

AX, BX, CY = 500, 1000, 470
orb(gd, AX, CY, 150, (120, 80, 10), (255, 214, 130))   # ambre
orb(gd, BX, CY, 150, (10, 80, 100), (140, 235, 255))   # turquoise
# reflets au sol (aplatis, plus faibles)
gd.ellipse([AX - 110, 760, AX + 110, 830], fill=(60, 45, 12))
gd.ellipse([BX - 110, 760, BX + 110, 830], fill=(8, 50, 60))
glow = glow.filter(ImageFilter.GaussianBlur(48))
img = Image.blend(img, Image.blend(img, glow, 0.0), 0.0)  # garde img de base
from PIL import ImageChops
img = ImageChops.screen(img, glow)
d = ImageDraw.Draw(img)

# cœurs nets par-dessus
orb(d, AX, CY, 52, (70, 50, 8), (255, 226, 150))
orb(d, BX, CY, 52, (6, 56, 70), (160, 240, 255))
# anneaux de portail autour des portails factices
d.ellipse([AX - 190, CY - 190, AX + 190, CY + 190], outline=(255, 206, 107), width=3)
d.ellipse([BX - 190, CY - 190, BX + 190, CY + 190], outline=(111, 227, 255), width=3)

# titre
def font(size):
    for name in ("segoeuil.ttf", "segoeui.ttf", "arial.ttf"):
        p = os.path.join("C:/Windows/Fonts", name)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

TITLE, SPACE = "REFLET", 46
f_title = font(168)
f_sub = font(44)

def text_width(s, f, spacing=0):
    w = 0
    for ch in s:
        bb = d.textbbox((0, 0), ch, font=f)
        w += (bb[2] - bb[0]) + spacing
    return w

tw = text_width(TITLE, f_title, SPACE)
x = (W - tw) / 2
title_layer = Image.new("RGB", (W, H), (0, 0, 0))
td = ImageDraw.Draw(title_layer)
for ch in TITLE:
    bb = td.textbbox((0, 0), ch, font=f_title)
    td.text((x - bb[0], 130), ch, font=f_title, fill=(233, 237, 255))
    x += (bb[2] - bb[0]) + SPACE
halo = title_layer.filter(ImageFilter.GaussianBlur(6))
from PIL import ImageChops as IC
img = IC.screen(img, IC.multiply(halo, Image.new("RGB", (W, H), (90, 90, 140))))
img = IC.screen(img, title_layer)
d = ImageDraw.Draw(img)

sub = "a puzzle of twin lights"
sw = d.textbbox((0, 0), sub, font=f_sub)
d.text(((W - (sw[2] - sw[0])) / 2, 330), sub, font=f_sub, fill=(154, 163, 209))

img.save(os.path.join(os.path.dirname(__file__), "..", "cover.png"))
print("cover.png OK", img.size)
