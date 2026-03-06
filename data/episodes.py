import torch
import random

def create_episode(dataset, n_way=5, k_shot=1, q_query=15):
    classes = random.sample(set(dataset.labels), n_way)

    support = []
    query = []

    for c in classes:
        idx = [i for i, lbl in enumerate(dataset.labels) if lbl == c]
        selected = random.sample(idx, k_shot + q_query)

        support.extend(selected[:k_shot])
        query.extend(selected[k_shot:])

    support_imgs = torch.stack([dataset[i][0] for i in support])
    query_imgs = torch.stack([dataset[i][0] for i in query])

    return support_imgs, query_imgs
