import torch
from models.vae import BetaVAE
from models.protonet import ProtoNet
from models.resnet18_backbone import get_resnet18_embedding
from data.medmnist_loader import MedMNISTDataset
from data.episodes import create_episode

vae = BetaVAE()
encoder = get_resnet18_embedding()
protonet = ProtoNet(encoder)

optimizer = torch.optim.Adam(list(protonet.parameters()) + list(vae.parameters()), lr=0.001)

dataset = MedMNISTDataset("pneumoniamnist.npz")

for ep in range(200):
    support, query = create_episode(dataset)

    # Generate synthetic samples
    synthetic, _, _ = vae(support)
    mixed = 0.5 * support + 0.5 * synthetic

    loss = protonet.prototypical_loss(mixed, query, 5, 1)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    print("EP:", ep, "Loss:", loss.item())
