from sqlalchemy import create_engine

def conn():
    engine = create_engine(
        "postgresql+psycopg2://postgres:1414@localhost:5432/bloodcells",
        echo=True
    )
    return engine
