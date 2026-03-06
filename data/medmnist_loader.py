import numpy as np
from torch.utils.data import Dataset
import kagglehub
import glob
import os


# ------------------------------------------------------------
# 1. Download the MedMNIST dataset from Kaggle
# ------------------------------------------------------------
print("Downloading MedMNIST...")
path = kagglehub.dataset_download("arashnic/standardized-biomedical-images-medmnist")
print("Downloaded to:", path)

# Find the NPZ file (MedMNIST contains multiple NPZs)
npz_files = glob.glob(os.path.join(path, "*.npz"))

if len(npz_files) == 0:
    raise FileNotFoundError("No NPZ files found in downloaded dataset.")

npz_path = npz_files[0]   # pick the first NPZ or choose manually
print("Using NPZ file:", npz_path)



# ------------------------------------------------------------
# 2. Define Dataset Loader for MedMNIST
# ------------------------------------------------------------
class MedMNISTDataset(Dataset):
    def __init__(self, npz_path):
        data = np.load(npz_path)

        # MedMNIST naming convention varies → auto-detect images + labels
        keys = data.files
        print("NPZ contents:", keys)

        # Find keys by pattern matching
        self.images = None
        self.labels = None

        for key in keys:
            if "train" in key and "image" in key:
                self.images = data[key]
            if "train" in key and "label" in key:
                self.labels = data[key]

        if self.images is None or self.labels is None:
            raise ValueError("Could not detect train_images/train_labels in NPZ file.")

        print("Loaded images:", self.images.shape, "labels:", self.labels.shape)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img = self.images[idx].astype('float32') / 255.0

        # Ensure channel dimension
        if img.ndim == 2:
            img = img.reshape(1, img.shape[0], img.shape[1])

        label = int(self.labels[idx])
        return img, label



# ------------------------------------------------------------
# 3. Create Dataset and Test
# ------------------------------------------------------------
dataset = MedMNISTDataset(npz_path)

print("Dataset size:", len(dataset))
sample_img, sample_label = dataset[0]

print("Sample image shape:", sample_img.shape)
print("Sample label:", sample_label)
