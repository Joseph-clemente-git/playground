"""4x anime super-resolution with Real-ESRGAN's RealESRGAN_x4plus_anime_6B (RRDBNet, 6 blocks)."""
import sys, numpy as np, cv2, torch
from torch import nn
import torch.nn.functional as F

class RDB(nn.Module):
    def __init__(self, f=64, g=32):
        super().__init__()
        self.conv1 = nn.Conv2d(f, g, 3, 1, 1); self.conv2 = nn.Conv2d(f + g, g, 3, 1, 1)
        self.conv3 = nn.Conv2d(f + 2 * g, g, 3, 1, 1); self.conv4 = nn.Conv2d(f + 3 * g, g, 3, 1, 1)
        self.conv5 = nn.Conv2d(f + 4 * g, f, 3, 1, 1); self.lrelu = nn.LeakyReLU(0.2, True)
    def forward(self, x):
        x1 = self.lrelu(self.conv1(x)); x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1))); x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        return self.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * 0.2 + x

class RRDB(nn.Module):
    def __init__(self, f=64, g=32):
        super().__init__(); self.rdb1 = RDB(f, g); self.rdb2 = RDB(f, g); self.rdb3 = RDB(f, g)
    def forward(self, x):
        return self.rdb3(self.rdb2(self.rdb1(x))) * 0.2 + x

class RRDBNet(nn.Module):
    def __init__(self, nb=6, f=64, g=32):
        super().__init__()
        self.conv_first = nn.Conv2d(3, f, 3, 1, 1); self.body = nn.Sequential(*[RRDB(f, g) for _ in range(nb)])
        self.conv_body = nn.Conv2d(f, f, 3, 1, 1); self.conv_up1 = nn.Conv2d(f, f, 3, 1, 1); self.conv_up2 = nn.Conv2d(f, f, 3, 1, 1)
        self.conv_hr = nn.Conv2d(f, f, 3, 1, 1); self.conv_last = nn.Conv2d(f, 3, 3, 1, 1); self.lrelu = nn.LeakyReLU(0.2, True)
    def forward(self, x):
        feat = self.conv_first(x); feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode='nearest')))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode='nearest')))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))

net = RRDBNet()
sd = torch.load('models/anime6B.pth', map_location='cpu', weights_only=True)
net.load_state_dict(sd.get('params_ema', sd.get('params', sd)), strict=True)
net.eval()
img = cv2.imread(sys.argv[1])[..., ::-1].astype(np.float32) / 255
x = torch.from_numpy(img.copy()).permute(2, 0, 1)[None]
with torch.no_grad():
    y = net(x)[0].clamp(0, 1).permute(1, 2, 0).numpy()
cv2.imwrite(sys.argv[2], (y[..., ::-1] * 255).round().astype(np.uint8))
print('wrote', sys.argv[2], y.shape)
