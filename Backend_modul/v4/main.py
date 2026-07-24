from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from v4.config.paths import STATIC_PATH, UPLOADS_PATH, create_uploads_dir
from v4.routers.main_menu import main_router
from v4.routers.images import images_router
from v4.routers.list_images import list_images_router

create_uploads_dir()

app = FastAPI()
app.mount(path='/static', app=StaticFiles(directory=STATIC_PATH), name='static')
app.mount(path='/uploads', app=StaticFiles(directory=UPLOADS_PATH), name='uploads')

app.include_router(main_router)
app.include_router(images_router)
app.include_router(list_images_router)


