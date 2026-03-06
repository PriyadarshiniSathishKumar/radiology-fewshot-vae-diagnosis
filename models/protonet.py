import torch
import torch.nn.functional as F
from torch import nn

class ProtoNet(nn.Module):
    def __init__(self, encoder):
        super(ProtoNet, self).__init__()
        self.encoder = encoder

    def forward(self, x):
        return self.encoder(x)

    def prototypical_loss(self, support, query, n_way, k_shot):
        support_emb = self.encoder(support)
        query_emb = self.encoder(query)

        prototypes = support_emb.reshape(n_way, k_shot, -1).mean(dim=1)

        distances = torch.cdist(query_emb, prototypes)

        labels = torch.arange(n_way).repeat_interleave(k_shot).to(distances.device)
        loss = F.cross_entropy(-distances, labels)

        return loss
