import torch
import torch.nn as nn
import torch.nn.functional as F

class BetaVAE(nn.Module):
    def __init__(self, latent_dim=128, beta=1.5):
        super(BetaVAE, self).__init__()
        self.latent_dim = latent_dim
        self.beta = beta

        # Encoder
        self.encoder = nn.Sequential(
            nn.Conv2d(1, 32, 4, 2, 1),  # (224 → 112)
            nn.ReLU(),
            nn.Conv2d(32, 64, 4, 2, 1), # 112 → 56
            nn.ReLU(),
            nn.Conv2d(64, 128, 4, 2, 1), # 56 → 28
            nn.ReLU(),
            nn.Flatten()
        )

        self.fc_mu = nn.Linear(128 * 28 * 28, latent_dim)
        self.fc_logvar = nn.Linear(128 * 28 * 28, latent_dim)

        # Decoder
        self.decoder_fc = nn.Linear(latent_dim, 128 * 28 * 28)

        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 4, 2, 1), # 28 → 56
            nn.ReLU(),
            nn.ConvTranspose2d(64, 32, 4, 2, 1),  # 56 → 112
            nn.ReLU(),
            nn.ConvTranspose2d(32, 1, 4, 2, 1),   # 112 → 224
            nn.Sigmoid()
        )

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def forward(self, x):
        h = self.encoder(x)
        mu = self.fc_mu(h)
        logvar = self.fc_logvar(h)
        z = self.reparameterize(mu, logvar)

        out = self.decoder_fc(z).view(-1, 128, 28, 28)
        out = self.decoder(out)
        return out, mu, logvar

    def loss_fn(self, recon_x, x, mu, logvar):
        recon_loss = F.mse_loss(recon_x, x, reduction='sum')
        kl_loss = -0.5 * torch.sum(1 + logvar - mu.pow(2) - logvar.exp())
        return recon_loss + self.beta * kl_loss
