from models.protonet import ProtoNet
from models.resnet18_backbone import get_resnet18_embedding
from data.medmnist_loader import MedMNISTDataset
from data.episodes import create_episode
import torch

dataset = MedMNISTDataset("pneumoniamnist.npz")
encoder = get_resnet18_embedding()
model = ProtoNet(encoder)

optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

for episode in range(300):
    support, query = create_episode(dataset)
    loss = model.prototypical_loss(support, query, n_way=5, k_shot=1)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    print("Episode:", episode, "Loss:", loss.item())
