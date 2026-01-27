from sqlalchemy import desc, select
from model_type1 import create_db, drop_db, Images, Labels, Statistics_image
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from data_generator import generate


def last_six_image(engine):
    items = []
    Sessions = sessionmaker(bind=engine)
    with Sessions() as session:
        session.query(Images).limit(10)
        query = select(Images).order_by(desc(Images.id_image)).limit(6) 
        # Запрос SELECT * FROM images ORDER BY id_image DESC FETCH FIRST 6 ROWS ONLY;
        result = session.execute(query).scalars().all()
        session.commit()
        for item in result:
            item_js = {
                "file_path": item.file_path,
                "file_name": item.file_name,
                "owner_name": 'Ivanov Ivan Ivanovich',
                "date_create": (item.data_create).strftime('%Y-%m-%d %H:%M:%S')
            } 
            items.append(item_js)
    return items


def get_last_image_indx(engine):
    with Session(engine) as session:
        query = select(Images.id_image).order_by(desc(Images.id_image)).limit(1)
        indx = session.execute(query).scalars().one()
        print("=" * 100)
        print("get_last_image_indx TRUE")
        print(f"index: {indx}")
        print("=" * 100)
        return indx
    

def get_image_indx(name, engine):
    print("=" * 100)
    print("get_image_indx")
    print("=" * 100)
    with Session(engine) as session:
        query = select(Images.id_image).where(Images.file_name == f'{name}').limit(1)
        indx = session.execute(query).scalars().first()
        print(indx)
        print("=" * 100)
        print("get_image_indx TRUE")
        print(f"index: {indx}")
        print("=" * 100)
        return indx


def upload_labels(name, result, engine):
    labels = []
    img_indx = get_image_indx(name, engine)
    for box in result.boxes:
        x, y, w, h = box.xywh[0][0].item(), box.xywh[0][1].item(), box.xywh[0][2].item(), box.xywh[0][3].item() #там почему-то тензор двумерный массив, так что надо так писать [0][3]
        conf = box.conf[0].item()
        cls = int(box.cls[0].item()) #box.cls возвращается тензор, поэтому нужно использова обращение к первому и единственному элементу [0] 
        labels.append(Labels(id_image=img_indx, cls=result.names[cls], conf=conf, x=round(x, 2), y=round(y, 2), w=round(w, 2), h=round(h, 2)))
    
    with Session(engine) as session:
        print("=" * 100)
        print("Ошибка в session")
        print("=" * 100)
        session.add_all(labels)
        session.commit()
        print("=" * 100)
        print("Загрузка в labels")
        print("=" * 100)


def upload_image(name, engine):
    image = Images(file_name=name, file_path=f"\\uploads\\{name}")
    with Session(engine) as session:
        session.add(image)
        session.commit()
        print("=" * 100)
        print("Загрузка в images")
        print("=" * 100)


def _restart_db(engine):
    drop_db(engine)
    create_db(engine)
    Sessions = sessionmaker(bind=engine)
    with Sessions() as session:
        # Генерация данных
        stats, labels, images = generate()
        session.add_all(stats + labels + images)
        session.commit()
    return


if __name__=="__main__":
    from conn import conn
    engine = conn()
    print(get_image_indx(engine))
    #_restart_db(engine)
    #print(last_six_image(engine))