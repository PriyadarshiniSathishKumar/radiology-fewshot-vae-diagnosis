from torchvision.models import resnet18
import torch.nn as nn

def get_resnet18_embedding():
    model = resnet18(weights=None)
    model.conv1 = nn.Conv2d(1, 64, 7, 2, 3)
    model.fc = nn.Identity()
    return model
