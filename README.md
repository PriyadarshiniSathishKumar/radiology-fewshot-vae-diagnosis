# Radiology Few-Shot VAE Diagnosis

Hybrid AI framework combining **Few-Shot Learning** and **Generative AI (Variational Autoencoders)** for radiology disease diagnosis under low-data scenarios.

This project focuses on improving medical image classification performance when **very limited labeled training data is available**, which is a common challenge in healthcare AI systems.

---

## Project Overview

Deep learning models in medical imaging usually require **large annotated datasets**, which are expensive and difficult to obtain. This project addresses that limitation by integrating:

- **Few-Shot Learning (FSL)** – enables learning from a very small number of labeled samples  
- **Variational Autoencoders (VAE)** – generate synthetic medical images to augment training data  

The hybrid approach improves model performance in **low-data medical environments**.

---

## Key Features

- Hybrid **VAE + Few-Shot Learning pipeline**
- **Prototypical Networks with ResNet-18 backbone**
- Synthetic medical image generation using **β-VAE**
- Radiology image preprocessing and normalization
- **Grad-CAM explainability** for disease localization
- Performance analytics and evaluation metrics
- Support for multiple radiology datasets

---

## System Architecture
Radiology Image
│
▼
Image Preprocessing
(resize, normalize, denoise)
│
▼
Variational Autoencoder
(generate synthetic samples)
│
▼
Hybrid Dataset
(real + synthetic samples)
│
▼
Few-Shot Learning Classifier
(Prototypical Network)
│
▼
Disease Prediction

Grad-CAM Visualization

---

## Datasets Used

This project uses publicly available radiology datasets.

### MedMNIST
Lightweight benchmark dataset of medical images used for rapid experimentation.

### NIH Chest X-ray14
Large-scale dataset containing chest X-ray images with 14 thoracic disease labels.

### COVID-19 Radiography Dataset
Dataset containing COVID-19, viral pneumonia, and normal chest X-ray images.

All images are standardized to **224×224 resolution** for training.

---

## Model Architecture

### Variational Autoencoder (VAE)

Used for **synthetic data generation** and feature extraction.

**Encoder**
- Convolutional layers
- Feature compression

**Latent Space**
- Dimension: **128**

**Decoder**
- Transposed convolution layers
- Image reconstruction

Loss Function
Loss = Reconstruction Loss + KL Divergence

---

### Few-Shot Learning Classifier

Classification is performed using **Prototypical Networks**.

**Backbone Network**
- ResNet-18 feature extractor

**Training Strategy**
- Episodic training with few-shot tasks

Examples:
5-way 1-shot
5-way 5-shot

Distance metric used:
Euclidean distance in embedding space

---

## Hybrid Training Strategy

The training pipeline integrates both real and synthetic samples.
Real Data: 70%
Synthetic Data: 30%

Training steps:

1. Train VAE on medical images  
2. Generate synthetic samples  
3. Combine synthetic and real dataset  
4. Train Prototypical Network using episodic training  

---

## Experimental Results

| Model | Accuracy | F1 Score | AUC |
|------|------|------|------|
| Baseline Few-Shot | 62% | 0.58 | 0.61 |
| Hybrid VAE + Few-Shot | 71% | 0.66 | 0.72 |

**Improvement**
+9% accuracy improvement

---

## Few-Shot Performance

| Scenario | Baseline | Hybrid Model |
|------|------|------|
| 1-Shot | 58% | 67% |
| 5-Shot | 66% | 75% |

The hybrid model performs significantly better in **low-data learning scenarios**.

---

## Synthetic Image Quality

| Metric | Score |
|------|------|
| SSIM | 0.76 |
| FID | 23.4 |
| PSNR | 28.2 |

More than **90% of generated samples passed quality filtering**.

---

## Explainable AI

The system integrates **Grad-CAM visualization** to improve model interpretability.

Grad-CAM highlights the **regions of the radiology image responsible for predictions**, enabling better understanding of the model’s diagnostic reasoning.

Output includes:

- Disease prediction
- Confidence score
- Attention heatmap

---

## Project Structure
radiology-fewshot-vae-diagnosis
│
├── data
├── models
│ ├── vae.py
│ ├── prototypical_network.py
│
├── training
│ ├── train_vae.py
│ ├── train_fewshot.py
│
├── evaluation
│ ├── evaluate_model.py
│
├── utils
│ ├── preprocessing.py
│ ├── metrics.py
│
├── notebooks
├── app
│ ├── api.py
│ ├── inference.py
│
├── requirements.txt
└── README.md

---

## Installation

Clone the repository:
git clone https://github.com/PriyadarshiniSathishKumar/radiology-fewshot-vae-diagnosis

cd radiology-fewshot-vae-diagnosis

Install dependencies:
pip install -r requirements.txt

---

## Training

Train the VAE model:
python train_vae.py

Train the Few-Shot model:
python train_fewshot.py

---

## Evaluation

Evaluate the trained hybrid model:
python evaluate_model.py

---

## Applications

This project can be used for:

- AI-assisted radiology diagnosis
- Rare disease detection
- Medical image dataset augmentation
- Research in **Few-Shot Learning and Generative AI**
- Explainable AI for healthcare systems

---

## Future Work

- Diffusion models for higher quality synthetic images  
- Multi-modal radiology datasets (CT, MRI, X-ray)  
- Large-scale clinical dataset training  
- Deployment as clinical decision support system  

---

## Authors

**Priyadarshini S**  
**Rishikumaran T**  
**Vijay K**
