import os, os.path
from PIL import Image
import cv2
import numpy as np
import shutil

datasetPath = "./Dataset"
folders = os.listdir(datasetPath)
newPathDataset = "./NewDataset"
standart = (360, 360)
countOfBigImg = 0
countOfSmallImg = 0
countOfNotNormalImg = 0
countOfNormalImg = 0
countOfAllImg = 0
for folder in folders:
    for file in os.listdir(os.path.join(datasetPath, folder)):
        if os.path.isfile(os.path.join(datasetPath, folder, file)):
            countOfAllImg += 1
            with Image.open(os.path.join(datasetPath, folder, file)) as image:
                width, height = image.size
            olderPath = os.path.join(datasetPath, folder, file)
            newPath = os.path.join(newPathDataset, folder, file)
            if height==standart[1] and width==standart[0]:
                    shutil.copy2(olderPath, newPath)
                    countOfNormalImg += 1
            else:
                countOfNotNormalImg += 1
                img = cv2.imread(olderPath)
                
                if width>=360 and height>=360:
                    start_y = (height - standart[1]) // 2
                    start_x = (width - standart[0]) // 2
                    newImg = img[start_y:start_y+standart[1], start_x:start_x+standart[0]].copy()
                    cv2.imwrite(newPath, newImg)
                    countOfBigImg += 1
                elif width<360 or height<360:
                    blackImg = np.zeros((standart[1], standart[0], 3), dtype="uint8")
                    start_y = (standart[1] - height) // 2
                    start_x = (standart[0] - width) // 2
                    blackImg[start_y:start_y+height, start_x:start_x+width] = img 
                    cv2.imwrite(newPath, blackImg)
                    countOfSmallImg += 1
                
print("Нормальных изображений: ", countOfNormalImg)
print("Ненормальных изображений:", countOfNotNormalImg, ". Из которых маленьких изображений:", countOfSmallImg, ", и больших изображений:", countOfBigImg)
print("Всего изображений:", countOfAllImg)
  