import matplotlib.pyplot as plot 
import os, os.path
from PIL import Image
import numpy as np

datasetPath = "./Dataset"
folders = os.listdir(datasetPath)
resolution = []
data = {}
absoluteResolution = []
countOfAllImg = 0

for folder in folders:
    resolutions = {}
    for file in os.listdir(os.path.join(datasetPath, folder)):
        if os.path.isfile(os.path.join(datasetPath, folder, file)):
            countOfAllImg += 1
            with Image.open(os.path.join(datasetPath, folder, file)) as image:
                width, height = image.size
            resolution = "(" + str(width) + ", " + str(height) + ")"
            if resolution in resolutions:
                resolutions[resolution] += 1
            else:
                resolutions[resolution] = 1
            
            if resolution not in absoluteResolution: 
                absoluteResolution.append(resolution)
    data.update({folder : resolutions})

print("Всего изображений:", countOfAllImg)
  
plot_data={}
for resolution in absoluteResolution:
    plot_data[resolution] = []

for folder in folders:
    for resolution in absoluteResolution:
        if resolution in data[folder]:
            plot_data[resolution].append(data[folder][resolution])
        else: 
            plot_data[resolution].append(0)


x = np.arange(len(folders))          
width = 0.8/len(absoluteResolution)  

for i, resolution in enumerate(absoluteResolution):
    offset = i * width
    bars = plot.bar(x + offset, plot_data[resolution], width, label=resolution)
    plot.bar_label(bars)

plot.xticks(x + width * (len(absoluteResolution)-1)/2, folders)
plot.ylabel("Number of images")
plot.xlabel("Types of cell")
plot.title("Images of dataset")
plot.legend(title = "Resolutions")
plot.show()

  