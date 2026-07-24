# Blood Cells
---

cd .Целью данного проекта является разработка программного обеспечения для автоматизации анализа мазка крови. Последняя рабочая версия находится по [ссылке]().


Для запуска приложения необходимо:
1. установить библиотеки, названия которых указаны в файле requirements.txt:
```
pip install -r requirements.txt
```

2. Создать БД в PostgreSQL запросом в cmd/PowerShell:
```sql
psql -U username -с "CREATE DATABASE name_db;"
\q
```

3. настроить подключение sqlalchemy к PostgreSQL в файле conn.py по шаблону:
```
"postgresql+psycopg2://username:password@localhost/database_name"
``` 

4. Запустить скрипт conn.py для создания структуры БД:
```
python ./path/to/conn.py
```

5. Запуск осуществляется из родительской папки, в которой лежит папка с приложением (./v4) командой:
```
uvicorn v4.main:app
```


---
### Структура приложения

Файлы программы логически распределены по папкам. В папке config находятся пути до ключевых папок и файлов. В папке ml хранится скринпт инференса модели и сама модель. В папке routers содержаться роутерами с соответствующими им эндпойнтами. Папка static содержит файлы, отправляемые пользователю вместе с html-страницами. templates содержит сами html-страницы. Файл main.py запускает приложение.

```text
v4/
├── config/
│   └── paths.py
├── core/
│   ├── conn.py
│   ├── model_type1.py
│   ├── pydantic_models.py
│   └── queries.py
├── ml/
├────  models/
│   │   └── best.pt
│   └── inference.py
├── routers/
│   ├── images.py
│   ├── list_images.py
│   └── main_menu.py
├── static/
├────  images/
│       └── favicon3.ico
├────  js/
│       ├── konva.js
│       ├── script_editor.js
│       ├── script_images.js
│       └── script_main.js
├────  style/
│       ├── style_editor.js
│       ├── style_images.js
│       └── style_main.js
├── templates/
│   ├── editor.html
│   ├── images.html
│   ├── main_menu.html
│   └── panels.html
├── __init__.py
└── main.py
```

Папка с загружаемыми на сервер изображениями находится в корневой папке приложения (создаётся автоматически).

```text
folder/
├── v4/
└── uploads/
```


---
### Стек

В качестве языка разработки выбран python 3.13.14. Для разработки серверной части используются следующие библиотеки этого языка:
	
- [FastAPI](https://fastapi.tiangolo.com/) выбран для реализации серверного интерфейса (API) благодаря высокой производительности, автоматической генерации документации и простой валидации данных через библиотеку Pydantic;
- [Jinja2](https://jinja.palletsprojects.com/en/stable/) необходим для формирования HTML-страниц, отдаваемых сервером;
- [SQLAlchemy](https://www.sqlalchemy.org/) является ORM (Object-Relational Mapping) для взаимодействия серверного интерфейса с PostgreSQL;
- [Psycopg2](https://www.psycopg.org/docs/) используется SQLAlchemy как драйвер для подключения к базе данных;
- [Pydantic](https://pydantic.dev/) нужен для валидации данных и управления настройками;
- [Pandas](https://pandas.pydata.org/) будет использоваться для обработки и агрегации результатов классификации;
- [Ultralytics](https://www.ultralytics.com/) это официальная библиотека для работы с моделями YOLO;
- [Uvicorn](https://uvicorn.dev/) необходим как ASGI-сервер для запуска FastAPI-приложения.

В качестве системы управления реляционными базами данных  (СУБД) используется [PostgreSQL](https://www.postgresql.org/) 16.3. 

Интерфейс пользователя реализован с использованием стандартных веб-технологий: язык разметки HTML, язык стилей CSS и язык программирования JavaScript. Для отображения результатов анализа выбрана библиотека [Konva.js](https://konvajs.org/). Она предоставляет высокоуровневое API для работы с холстом, поддержку событий мыши и касания, слоёв и трансформаций.

Для создания датасета обучения использовалась программа [labelstudio](https://labelstud.io/), развёрнутая с помощью [docker](https://www.docker.com/). Разработанный мной в labelstudio датасет, включающий 561 изображение, доступен по [ссылке](https://www.kaggle.com/datasets/roujoded/blood-cells-classification-and-detection). 

Для решений задач детекции и классификации клеток крови на изображении выбрана модель YOLOv26 nano. Она хорошо себя показала как на наборе данных, часть которого послужила для датасета, так и на других данных. Из-за малого обучающего набора данных результаты инференса можно использовать только как вспомогательный инструмент.

<details>
<summary>Результаты обучения модели</summary>
<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/results.png" alt="main">
</div>
</details>


---
### Окна

Приложение разделено на три окна: для загрузки изображения, для просмотра результатов инференса и для просмотра всех раннее загруженных изображений. Попасть в окно загрузки и окно со всеми изображениями можно из каждого окна. Для перехода в редактор необходимо выбирать конкретное изображение в окне со всеми изображениями или загрузить новое изображение.


<details>
<summary>Окно загрузки изображения</summary>
<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/upload1.png" alt="main">
</div>
</details>
<details>
<summary>Предпросмотр загружаемого изображения (окно загрузки)</summary>
<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/upload2.png" alt="main">
</div>
</details>
<details>
<summary>Окно-редактор</summary>
<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/editor.png" alt="main">
    <small><em>P.S. Редактор был вдохновлён labelstudio, но сделан самостоятельно</em></small>
</div>
</details>
<details>
<summary>Окно со всеми изображениями</summary>
<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/images.png" alt="main">
</div>
</details>


---
### Проектные решения

За основу взята клиент-серверная архитектура, пример которой представлен на изображении.

<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/Server_Client_HTTP.jpg" alt="main">
    <br>
    <small><em>Схема клиент-серверной архитектуры</em></small>
</div>


Приложению необходимо хранить данные об изображениях, метках и отчётах. В СУБД созданы соответствующие сущности и их атрибуты, а также присвоены типы данных.

<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/db_schema.png" alt="main">
    <br>
    <small><em>Даталогическая модель БД</em></small>
</div>


Пользователь добавляет, редактирует, удаляет и читает данные из БД через API. Для обеспечения всех этих действий выделены следующие эндпоинты, разделённые на роутеры (окно загрузки, просмотр всех изображений и редактор):

<table>
  <thead>
    <tr>
      <th>Роутер</th>
      <th>Эндпойнт</th>
      <th>Метод</th>
      <th>Назначение</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2" style="vertical-align: middle;"><b>main_router</b></td>
      <td>/main_router/</td>
      <td>get</td>
      <td>Передача файлов интерфейса пользователю</td>
    </tr>
    <tr>
      <td>/main_router/image</td>
      <td>post</td>
      <td>Отправка пользователем изображения на сервер</td>
    </tr>
    <tr>
      <td rowspan="2" style="vertical-align: middle;"><b>images_router</b></td>
      <td>/images_router/{file_name}</td>
      <td>get</td>
      <td>Передача файлов интерфейса пользователю с размеченным изображением</td>
    </tr>
    <tr>
      <td>/images_router/{file_name}/save</td>
      <td>post</td>
      <td>Сохранение внесённых изменений в разметку</td>
    </tr>
    <tr>
      <td rowspan="3" style="vertical-align: middle;"><b>list_images_router</b></td>
      <td>/list_images_router/images</td>
      <td>get</td>
      <td>Передача файлов интерфейса со всеми изображениями пользователю</td>
    </tr>
    <tr>
      <td>/list_images_router/images/get</td>
      <td>get</td>
      <td>Пагинация</td>
    </tr>
    <tr>
      <td>/list_images_router/{file_name}/delete</td>
      <td>post</td>
      <td>Удаление изображения и меток из БД</td>
    </tr>
  </tbody>
</table>


<details>
<summary>Сценарии использования приложения</summary>
<div align="center">
    <img src="https://raw.githubusercontent.com/reithosa/webBloodDetectionClassification/main/screenshots/final_schema_app_v.png" alt="main">
    <br>
    <small><em>Блок-схема алгоритма работы приложения</em></small>
</div>
</details>


