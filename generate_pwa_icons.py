from pathlib import Path
import sys

root = Path(__file__).resolve().parent
logo = root / 'images' / 'logo' / 'logo-mb.png'
if not logo.exists():
    print('ERROR: logo file not found:', logo)
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print('MISSING_PIL')
    sys.exit(2)

img = Image.open(logo).convert('RGBA')
print('ORIGINAL', img.size)

sizes = [64, 96, 128, 152, 192, 256, 512]
icons_dir = root / 'icons'
icons_dir.mkdir(exist_ok=True)

for size in sizes:
    out = img.resize((size, size), Image.LANCZOS)
    out_path = icons_dir / f'icon-{size}.png'
    out.save(out_path, optimize=True)
    print('WROTE', out_path.name)

print('DONE')
