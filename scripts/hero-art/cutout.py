"""Cuts the figure out of its white background with a soft, halo-free edge and saves a transparent WebP."""
import sys, cv2, numpy as np
from PIL import Image
im = cv2.imread(sys.argv[1]).astype(np.float32)
h, w = im.shape[:2]
gray = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_BGR2GRAY)
sat = cv2.cvtColor(im.astype(np.uint8), cv2.COLOR_BGR2HSV)[..., 1]
# Paper: near-white pixels connected to the border (so whites inside the figure, like eyes and pages, stay).
paper = ((gray > 228) & (sat < 30)).astype(np.uint8)
ff = np.zeros((h + 2, w + 2), np.uint8)
for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
    if paper[seed[1], seed[0]]:
        cv2.floodFill(paper, ff, seed, 2)
bg = (paper == 2).astype(np.uint8)
# Opacity: solid inside; in a thin band at the edge, how far the pixel is from white.
fg = 1 - bg
band = cv2.dilate(bg, np.ones((5, 5), np.uint8)) & fg | bg
whiteness = (255 - im.min(axis=2)) / 255.0
alpha = np.where(band > 0, np.clip(whiteness * 1.6, 0, 1), 1.0)
alpha = np.where(bg > 0, np.clip(whiteness * 1.6 - 0.15, 0, 1), alpha)
alpha = cv2.GaussianBlur(alpha.astype(np.float32), (3, 3), 0)
# Un-mix the white out of semi-transparent edge pixels so no pale halo shows on dark scenes.
a3 = np.maximum(alpha[..., None], 1e-3)
color = np.clip((im - 255 * (1 - a3)) / a3, 0, 255)
rgba = np.dstack([color[..., ::-1], alpha * 255]).astype(np.uint8)
ys, xs = np.where(alpha > 0.05)
print('figure bbox', xs.min(), ys.min(), xs.max(), ys.max())
Image.fromarray(rgba, 'RGBA').save(sys.argv[2], 'WEBP', quality=int(sys.argv[3]) if len(sys.argv) > 3 else 88, method=6)
