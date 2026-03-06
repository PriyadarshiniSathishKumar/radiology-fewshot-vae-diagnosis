from models.vae import BetaVAE
from torch.utils.data import DataLoader
import torch

dataset = MedMNISTDataset("pneumoniamnist.npz")
loader = DataLoader(dataset, batch_size=32, shuffle=True)

vae = BetaVAE()
optimizer = torch.optim.Adam(vae.parameters(), lr=0.001)

for epoch in range(50):
    for imgs, _ in loader:
        imgs = imgs.float()
        recon, mu, logvar = vae(imgs)
        loss = vae.loss_fn(recon, imgs, mu, logvar)

        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    print(f"Epoch {epoch}, Loss: {loss.item()}")
