import os
import random
import shutil

datasetPath = ".\\Dataset"
newPath = ".\\MyDataset"
folders = os.listdir(datasetPath)
data = {}
rng = random.Random(42)
countOfPictures = 100 # Желаемое количество картинок 

# Читаем уже скопированные файлы ИЗ КАЖДОЙ ПАПКИ
existing_files = {}
for folder in folders:
    existing_files[folder] = set()
    result_file = os.path.join(newPath, folder, "_copied_files.txt")
    if os.path.exists(result_file):
        with open(result_file, 'r') as f:
            existing_files[folder] = set(line.strip() for line in f)

# Создание и фильтрация списков
for folder in folders:
    paths = []
    for file in os.listdir(os.path.join(datasetPath, folder)):
        if (os.path.isfile(os.path.join(datasetPath, folder, file)) and 
            file not in existing_files[folder]):  # Только новые файлы
            paths.append(file)
    rng.shuffle(paths)
    data[folder] = paths

# Копирование данных с ведением лога ДЛЯ КАЖДОГО КЛАССА
for folder in folders:
    result = data[folder][:countOfPictures - len(existing_files[folder])]  # Добираем до нужного количества
    
    with open(os.path.join(newPath, folder, "_copied_files.txt"), 'a') as txt:
        for file in result:
            newFilePath = os.path.join(newPath, folder, file)
            olderFilePath = os.path.join(datasetPath, folder, file)
            shutil.copy2(olderFilePath, newFilePath)
            txt.write(file + "\n")