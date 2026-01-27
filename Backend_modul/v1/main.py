from v1.routers.main_menu import main_router
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles 
from v1.config.paths import STATIC_PATH, UPLOADS_PATH

app = FastAPI()
app.mount(path='/static', app=StaticFiles(directory=STATIC_PATH), name='static')
app.mount(path='/uploads', app=StaticFiles(directory=UPLOADS_PATH), name='uploads')

app.include_router(main_router)

