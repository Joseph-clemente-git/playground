# Hero art

`src/games/word-warrior/art/hero.webp` is made from `reference.png` (a 200 px
Canva-generated image) in two steps:

1. **Upscale** 4× with Real-ESRGAN's anime model, which rebuilds clean ink
   lines and flat shading instead of blurring:

   ```sh
   python3 -m venv .venv && .venv/bin/pip install torch opencv-python-headless pillow
   mkdir -p models && curl -L -o models/anime6B.pth https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.2.4/RealESRGAN_x4plus_anime_6B.pth
   ```

   `upscale.py` loads the weights from `models/anime6B.pth`, relative to where you run it.

   ```sh
   .venv/bin/python scripts/hero-art/upscale.py scripts/hero-art/reference.png hero-800.png
   ```

2. **Cut out** the white background with a soft, halo-free edge:

   ```sh
   .venv/bin/python scripts/hero-art/cutout.py hero-800.png src/games/word-warrior/art/hero.webp 88
   ```
