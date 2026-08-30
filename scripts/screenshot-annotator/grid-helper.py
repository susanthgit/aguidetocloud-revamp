from PIL import Image, ImageDraw, ImageFont
DL = r"C:\Users\ssutheesh\Downloads"
SESS = r"C:\Users\ssutheesh\.scout\copilot\session-state\7f5095dc-b4af-4e1c-9866-ffb9db3614cf\files"
F = r"C:\Windows\Fonts\arialbd.ttf"

def grid(name, out, step=100, target_w=1200):
    im = Image.open(f"{DL}\\{name}").convert("RGB")
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(F, 18)
    for x in range(0, im.width, step):
        col = (255,0,0) if x % 500 == 0 else (0,150,255)
        d.line([(x,0),(x,im.height)], fill=col, width=1)
        d.text((x+2,2), str(x), font=f, fill=(200,0,0), stroke_width=2, stroke_fill=(255,255,255))
    for y in range(0, im.height, step):
        col = (255,0,0) if y % 500 == 0 else (0,150,255)
        d.line([(0,y),(im.width,y)], fill=col, width=1)
        d.text((2,y+2), str(y), font=f, fill=(200,0,0), stroke_width=2, stroke_fill=(255,255,255))
    if im.width > target_w:
        s = target_w / im.width
        im = im.resize((int(im.width*s), int(im.height*s)))
    im.save(f"{SESS}\\{out}")
    print("grid", out, "orig->", Image.open(f'{DL}\\{name}').size)

grid("Screenshot 2026-08-11 195238.png", "grid-01.png", 100, 1400)
grid("Screenshot 2026-08-11 195343.png", "grid-02.png", 100, 1400)
grid("Screenshot 2026-08-11 195812.png", "grid-navL.png", 50, 700)
grid("Screenshot 2026-08-11 195833.png", "grid-navR.png", 50, 800)
