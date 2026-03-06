import os
import pandas as pd
import cv2
from torch.utils.data import Dataset

class NIHLoader(Dataset):
    def __init__(self, img_dir, csv_path, transform=None):
        self.img_dir = img_dir
        self.df = pd.read_csv(csv_path)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img = cv2.imread(os.path.join(self.img_dir, row['Image']))
        label = int(row['Label'])

        if self.transform:
            img = self.transform(img)

        return img, label
