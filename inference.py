import torch
import cv2
from models.vae import BetaVAE
from models.protonet import ProtoNet
from models.resnet18_backbone import get_resnet18_embedding
from data.preprocessing import preprocess_image

encoder = get_resnet18_embedding()
protonet = ProtoNet(encoder)
protonet.load_state_dict(torch.load("protonet.pth"))

def predict(img_path):
    img = cv2.imread(img_path)
    img = preprocess_image(img)
    img = torch.tensor(img).unsqueeze(0)

    emb = protonet(img)
    return emb

print(predict("sample.jpg"))
