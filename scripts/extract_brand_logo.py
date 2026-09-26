"""Extract transparent light and dark logo variants from the supplied PNG."""

from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
source = np.asarray(Image.open(ROOT / "public/trionyx-logo-orange.png").convert("RGB"), dtype=np.float32)
red, green, blue = source[..., 0], source[..., 1], source[..., 2]

# The source's warm paper is near (244, 243, 238). Separate the saturated
# orange artwork from the neutral, dark lettering without changing its outline.
orange_strength = np.clip((red - green - 9) / 35, 0, 1)
orange_strength *= np.clip((red - blue - 14) / 35, 0, 1)
orange_strength *= np.clip((red - 110) / 40, 0, 1)

dark_strength = np.clip((230 - np.minimum.reduce([red, green, blue])) / 28, 0, 1)
dark_strength *= 1 - orange_strength
alpha = np.maximum(orange_strength, dark_strength)

# Preserve the original orange pixels. Edge pixels are partly mixed with the
# old background, so remove that background before applying the new alpha.
paper = np.array([244, 243, 238], dtype=np.float32)
orange_rgb = np.clip(
    (source - paper * (1 - orange_strength[..., None]))
    / np.maximum(orange_strength[..., None], 0.01),
    0,
    255,
)

out_dir = ROOT / "public/brand"
out_dir.mkdir(parents=True, exist_ok=True)
for name, text_color in (
    ("trionyx-logo-light.png", np.array([250, 249, 246], dtype=np.float32)),
    ("trionyx-logo-dark.png", np.array([24, 24, 20], dtype=np.float32)),
):
    rgb = np.where(orange_strength[..., None] >= dark_strength[..., None], orange_rgb, text_color)
    rgba = np.dstack((rgb, alpha * 255)).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(out_dir / name, optimize=True)
