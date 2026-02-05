import os

APP_PATH = os.path.split(os.path.dirname(os.path.abspath(__file__)))[0]
TEMPLATES_PATH = os.path.join(APP_PATH, 'templates')
STATIC_PATH = os.path.join(APP_PATH, 'static')
STYLE_PATH = os.path.join(STATIC_PATH, 'style')
IMAGES_PATH = os.path.join(STATIC_PATH, 'images')
JS_PATH = os.path.join(STATIC_PATH, 'js')
UPLOADS_PATH = os.path.join(os.path.dirname(APP_PATH), 'uploads')
ML_PATH = os.path.join(APP_PATH, 'ml')
MODELS_ML_PATH = os.path.join(ML_PATH, 'models')


# print(APP_PATH)
#print(TEMPLATES_PATH)
#print(STATIC_PATH)
#print(STYLE_PATH)
#print(IMAGES_PATH)
#print(JS_PATH)
# print(UPLOADS_PATH)
# print(ML_PATH)
# print(MODELS_ML_PATH)