import matplotlib.pyplot as plt
import numpy as np
import cv2

img = cv2.imread(r"D:\webBloodDetection\Backend_modul\sample.jpg")
img_array = np.array(img)
r = img_array[:, :, 0]
g = img_array[:, :, 1]
b = img_array[:, :, 2] # срез дающий двумерный массив значений яркости красного цвета из трёхмерного массива

H, W = r.shape # считаем мерность массива r (360, 360) и присваем численные значения двум переменным
x = np.arange(W) # создаём массив с 360 элементами с 0 до 359 
y = np.arange(H)
X, Y = np.meshgrid(x, y) # создаём массив 360 на 360 с координами x и y (смотреть в альбоме)

fig = plt.figure()
blue = fig.add_subplot(1, 3, 1, projection='3d')
blue.plot_surface(X, Y, g, color='blue')

red = fig.add_subplot(1, 3, 2, projection='3d') # 1, 3, 2 означают одну строку, три столбца и второй индекс
red.plot_surface(X, Y, g, color='red')

green = fig.add_subplot(1, 3, 3, projection='3d')
green.plot_surface(X, Y, g, color='green')
plt.show()