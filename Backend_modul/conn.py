from sqlalchemy import create_engine
from model_type1 import create_db, drop_db, Images, Labels, Statistics_image
from sqlalchemy.orm import sessionmaker
from data_generator import generate


def main():
    engine = create_engine(
        "postgresql+psycopg2://postgres:1414@localhost:5432/bloodcells",
        echo=True
    )
    #drop_db(engine)
    #create_db(engine)

    Sessions = sessionmaker(bind=engine)
    with Sessions() as session:
        #stats, labels, images = generate()
        #session.add_all(stats + labels + images)
        session.commit()
    return


if __name__ == "__main__":
    main()