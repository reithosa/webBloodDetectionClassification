from sqlalchemy import create_engine
from model_type1 import drop_db, create_db

def conn():
    engine = create_engine(
        "postgresql+psycopg2://scott:tiger@localhost/test",
        echo=True
    )
    return engine

if __name__=="__main__":
    engine = conn()
    drop_db(engine)
    create_db(engine)