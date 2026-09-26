#!/usr/bin/env python3
"""Build original trip-sharing images.

Requires Pillow and ReportLab. The generated PNGs are checked in so the
GitHub Pages build does not need Python or these packages.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.graphics.barcode.qr import QrCodeWidget


ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
URL = "https://brandon030722.github.io/changsha-party-quest/"

INK = "#171b25"
DARK = "#1c2230"
PAPER = "#fffdf4"
BLUE = "#3994ff"
LIGHT_BLUE = "#e7f2ff"
YELLOW = "#ffcc1a"
ORANGE = "#ff9e42"
MUTED = "#475465"
WHITE = "#ffffff"

CJK = "/System/Library/Fonts/Hiragino Sans GB.ttc"
LATIN = "/System/Library/Fonts/Avenir Next Condensed.ttc"
SCALE = 2


def font(size: int, *, bold: bool = True, latin: bool = False):
    if latin:
        return ImageFont.truetype(LATIN, size * SCALE, index=8 if bold else 7)
    return ImageFont.truetype(CJK, size * SCALE, index=2 if bold else 0)


def box(coords):
    return tuple(int(round(value * SCALE)) for value in coords)


def text(draw, xy, value, size, fill=INK, *, bold=True, latin=False,
         stroke=0, stroke_fill=INK, anchor=None):
    kwargs = dict(font=font(size, bold=bold, latin=latin), fill=fill,
                  stroke_width=stroke * SCALE, stroke_fill=stroke_fill)
    if anchor:
        kwargs["anchor"] = anchor
    draw.text(box(xy), value, **kwargs)


def rect(draw, coords, fill, *, outline=None, width=0, radius=0):
    draw.rounded_rectangle(box(coords), radius=radius * SCALE, fill=fill,
                           outline=outline, width=width * SCALE)


def ellipse(draw, coords, fill, *, outline=None, width=0):
    draw.ellipse(box(coords), fill=fill, outline=outline, width=width * SCALE)


def line(draw, coords, fill, width):
    draw.line(box(coords), fill=fill, width=width * SCALE, joint="curve")


def circle_mark(draw, cx, cy, r, fill, *, number=None):
    ellipse(draw, (cx-r+6, cy-r+7, cx+r+6, cy+r+7), INK)
    ellipse(draw, (cx-r, cy-r, cx+r, cy+r), fill, outline=INK, width=4)
    if number is not None:
        text(draw, (cx, cy+2), number, 28, anchor="mm")


def brand_bubbles(draw, x, y, size):
    ellipse(draw, (x, y, x+size, y+size), BLUE, outline=INK, width=4)
    ellipse(draw, (x+size*.47, y-4, x+size*1.47, y+size-4), YELLOW,
            outline=INK, width=4)
    ellipse(draw, (x+size*.25, y+size*.38, x+size*1.25, y+size*1.38),
            ORANGE, outline=INK, width=4)


def draw_landscape():
    img = Image.new("RGB", (1200*SCALE, 630*SCALE), PAPER)
    d = ImageDraw.Draw(img)

    rect(d, (0, 0, 1200, 74), DARK)
    brand_bubbles(d, 37, 18, 25)
    text(d, (99, 29), "CHANGSHA PARTY QUEST", 23, PAPER, latin=True)
    rect(d, (917, 16, 1159, 58), YELLOW, outline=INK, width=3, radius=21)
    text(d, (1038, 37), "2026.09.30—10.03", 22, INK,
         latin=True, anchor="mm")

    rect(d, (0, 74, 773, 630), BLUE)
    # Light route geometry stays behind the main title.
    ellipse(d, (587, 103, 852, 368), "#61aaff", outline=INK, width=5)
    ellipse(d, (667, 177, 756, 266), YELLOW, outline=INK, width=4)
    ellipse(d, (-82, 402, 97, 581), "#72b3ff", outline=INK, width=5)
    ellipse(d, (91, 94, 143, 146), ORANGE, outline=INK, width=4)
    for cx, cy in [(574, 471), (696, 399), (713, 127)]:
        ellipse(d, (cx-8, cy-8, cx+8, cy+8), PAPER, outline=INK, width=3)
    line(d, (576, 470, 696, 399, 713, 127), "#f6fbff", 4)

    rect(d, (68, 131, 267, 170), YELLOW, outline=INK, width=3, radius=19)
    text(d, (167, 151), "地图 × 行程 × 导航", 19, INK, anchor="mm")
    text(d, (65, 185), "长沙组队", 95, INK)
    text(d, (72, 306), "出发！", 118, PAPER, stroke=3, stroke_fill=INK)
    text(d, (73, 477), "漫展 · 株洲方特 · 四日同行", 31, INK)
    rect(d, (0, 556, 773, 630), DARK)
    text(d, (72, 580), "4 DAYS", 26, PAPER, latin=True)
    ellipse(d, (231, 587, 245, 601), YELLOW)
    text(d, (267, 580), "5 PEOPLE", 26, PAPER, latin=True)
    ellipse(d, (446, 587, 460, 601), ORANGE)
    text(d, (484, 580), "7 PLACES", 26, PAPER, latin=True)

    # Right-hand route ticket: readable at chat preview size.
    rect(d, (802, 112, 1172, 568), INK, radius=27)
    rect(d, (794, 104, 1164, 560), PAPER, outline=INK, width=4, radius=27)
    text(d, (823, 136), "路线速览", 27)
    text(d, (1130, 141), "ROUTE", 18, "#176fd3", latin=True,
         anchor="ra")
    line(d, (824, 188, 1135, 188), INK, 2)
    line(d, (858, 234, 858, 456), "#a7c7e8", 6)
    nodes = [
        (230, "01", "长沙南站", "抵达与返程", YELLOW),
        (330, "02", "长沙国际会展中心", "10 月 1 日 · 漫展", BLUE),
        (430, "03", "株洲方特欢乐世界", "10 月 2 日 · 一日游", ORANGE),
    ]
    for cy, num, name, sub, color in nodes:
        circle_mark(d, 858, cy, 23, color, number=num)
        text(d, (903, cy-29), name, 23)
        text(d, (905, cy+6), sub, 17, MUTED, bold=False)
    line(d, (824, 486, 1134, 486), INK, 2)
    rect(d, (823, 504, 1136, 545), LIGHT_BLUE, radius=18)
    text(d, (978, 524), "点开地图 · 一键定位", 19, INK, anchor="mm")

    # A strong frame makes the card legible against both light and dark chats.
    d.rectangle(box((0, 0, 1199, 629)), outline=INK, width=5*SCALE)
    return img.resize((1200, 630), Image.Resampling.LANCZOS)


def make_qr(size=440):
    qr = QrCodeWidget(URL, barLevel="Q")
    qr.qr.make()
    modules = qr.qr.modules
    count = len(modules)
    border = 4
    cell = size // (count + border*2)
    drawn = cell * (count + border*2)
    im = Image.new("RGB", (drawn, drawn), WHITE)
    d = ImageDraw.Draw(im)
    for row, bits in enumerate(modules):
        for col, on in enumerate(bits):
            if on:
                x = (col + border)*cell
                y = (row + border)*cell
                d.rectangle((x, y, x+cell-1, y+cell-1), fill=INK)
    return im


def draw_poster():
    img = Image.new("RGB", (1080*SCALE, 1600*SCALE), BLUE)
    d = ImageDraw.Draw(img)
    rect(d, (0, 0, 1080, 84), DARK)
    brand_bubbles(d, 49, 25, 28)
    text(d, (122, 33), "CHANGSHA PARTY QUEST", 27, PAPER, latin=True)
    text(d, (989, 41), "2026", 26, YELLOW, latin=True, anchor="rm")

    ellipse(d, (834, 107, 1175, 448), "#60aaff", outline=INK, width=7)
    ellipse(d, (889, 149, 1033, 293), YELLOW, outline=INK, width=5)
    ellipse(d, (-77, 495, 189, 761), "#70b2ff", outline=INK, width=6)
    ellipse(d, (53, 205, 121, 273), ORANGE, outline=INK, width=4)
    rect(d, (61, 132, 345, 185), YELLOW, outline=INK, width=4, radius=26)
    text(d, (203, 157), "五人同行 · 四天旅程", 28, anchor="mm")
    text(d, (60, 227), "长沙组队", 116)
    text(d, (68, 372), "出发！", 141, PAPER, stroke=4, stroke_fill=INK)
    text(d, (66, 576), "漫展 · 株洲方特 · 城市寻路", 41)
    rect(d, (62, 646, 560, 708), DARK, radius=30)
    text(d, (310, 678), "09.30 — 10.03  /  2026", 33, PAPER,
         latin=True, anchor="mm")

    # Four playable-looking day chips show the trip in one glance.
    day_specs = [
        (61, 775, "D1", "抵达 · 入住", YELLOW),
        (555, 775, "D2", "长沙漫展", PAPER),
        (61, 884, "D3", "株洲方特", ORANGE),
        (555, 884, "D4", "休息 · 返程", LIGHT_BLUE),
    ]
    for x, y, code, label, fill in day_specs:
        rect(d, (x+6, y+7, x+469, y+96), INK, radius=22)
        rect(d, (x, y, x+463, y+89), fill, outline=INK, width=4, radius=22)
        ellipse(d, (x+19, y+18, x+72, y+71), WHITE, outline=INK, width=3)
        text(d, (x+45, y+46), code, 24, anchor="mm", latin=True)
        text(d, (x+89, y+26), label, 29)

    # Cream QR panel has enough quiet space to be scan friendly.
    rect(d, (0, 1034, 1080, 1600), PAPER)
    d.arc(box((-60, 990, 1150, 1790)), 190, 338, fill="#d7ebff", width=8*SCALE)
    text(d, (70, 1080), "扫码打开行程地图", 52)
    text(d, (72, 1138), "点开地点定位 · 随时查看四日行程", 26,
         MUTED, bold=False)
    rect(d, (72, 1228, 593, 1538), INK, radius=26)
    rect(d, (64, 1220, 585, 1530), WHITE, outline=INK, width=5, radius=26)
    text(d, (95, 1258), "把地图带上路", 36)
    text(d, (97, 1326), "长按保存这张海报，", 26, MUTED, bold=False)
    text(d, (97, 1368), "发给队友，扫码打开地图。", 26, MUTED, bold=False)
    text(d, (97, 1475), "CHANGSHA  /  ZHUZHOU", 24, "#176fd3",
         latin=True)

    img = img.resize((1080, 1600), Image.Resampling.LANCZOS)
    qr = make_qr(360)
    qx = 620 + (400-qr.width)//2
    qy = 1190 + (400-qr.height)//2
    img.paste(qr, (qx, qy))
    # Crisp QR frame and a non-interfering scan label beneath it.
    dd = ImageDraw.Draw(img)
    dd.rounded_rectangle((600, 1167, 1033, 1578), radius=22,
                         outline=INK, width=4)
    return img


def main():
    PUBLIC.mkdir(parents=True, exist_ok=True)
    landscape = PUBLIC / "share-card.png"
    poster = PUBLIC / "share-poster.png"
    draw_landscape().save(landscape, optimize=True)
    draw_poster().save(poster, optimize=True)
    for path in (landscape, poster):
        with Image.open(path) as im:
            print(f"{path}: {im.width}×{im.height}, {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
