import os, os.path


newNameDataset = "DifferentColorData"
newPath = "./" + newNameDataset
os.mkdir(newPath)

datasetPath = ".\Dataset"
folders = os.listdir(datasetPath)
for folder in folders:
    os.mkdir(newPath + "/" + folder)