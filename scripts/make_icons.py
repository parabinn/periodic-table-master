"""앱 아이콘 생성: python3 scripts/make_icons.py  (Pillow 필요)"""
from PIL import Image, ImageDraw
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'public')

def gradient(size, c1=(79, 70, 229), c2=(124, 58, 237)):
    img = Image.new('RGB', (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def tile(size, scale):
    """size 크기 투명 레이어에 '원소 칸' 그림 (1 / H / 1.008)"""
    from PIL import ImageFont
    S = size * 4
    layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    w = S * scale; x0 = (S - w) / 2; y0 = (S - w) / 2
    d.rounded_rectangle([x0, y0, x0 + w, y0 + w], radius=int(w * 0.12), fill=(255, 255, 255, 255))
    ink = (49, 46, 129, 255)
    f_big = ImageFont.truetype(FONT, int(w * 0.52)); f_num = ImageFont.truetype(FONT, int(w * 0.17)); f_m = ImageFont.truetype(FONT, int(w * 0.13))
    d.text((x0 + w * 0.10, y0 + w * 0.07), '1', font=f_num, fill=(124, 58, 237, 255))
    d.text((S / 2, y0 + w * 0.56), 'H', font=f_big, fill=ink, anchor='mm')
    d.text((S / 2, y0 + w * 0.88), '1.008', font=f_m, fill=(100, 116, 139, 255), anchor='mm')
    return layer.resize((size, size), Image.LANCZOS)

def icon(size, maskable=False, rounded=True):
    bg = gradient(size).convert('RGBA')
    if rounded and not maskable:
        mask = Image.new('L', (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * 0.22), fill=255)
        out = Image.new('RGBA', (size, size), (0, 0, 0, 0)); out.paste(bg, (0, 0), mask); bg = out
    # 마스커블 아이콘은 가운데 80% 안전 영역 안에 그림
    return Image.alpha_composite(bg, tile(size, 0.50 if maskable else 0.64))

os.makedirs(OUT, exist_ok=True)
icon(192).save(os.path.join(OUT, 'icon-192.png'))
icon(512).save(os.path.join(OUT, 'icon-512.png'))
icon(512, maskable=True).save(os.path.join(OUT, 'maskable-512.png'))
icon(180, rounded=False).convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'))
print('icons written to', os.path.abspath(OUT))
