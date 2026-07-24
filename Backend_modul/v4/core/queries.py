from sqlalchemy import desc, select, delete, func
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import os
import math
from v4.config.paths import APP_PATH, UPLOADS_PATH
from v4.core.data_generator import generate
from v4.core.model_type1 import create_db, drop_db, Images, Labels, Statistics_image
from v4.core.pydantic_models import ImageBoxes, Box

def last_six_image(engine):
    print("\n\nfile: queries.py \nfunc: last_six_image")
    items = []
    names = []
    typeOfFile = []
    Sessions = sessionmaker(bind=engine)
    with Sessions() as session:
        session.query(Images).limit(10)
        query = select(Images).order_by(desc(Images.id_image)).limit(6) 
        result = session.execute(query).scalars().all()
        session.commit()
        for item in result:
            name = str(item.file_name).split('.')
            item_js = {
                "file_path": item.file_path,
                "file_name": item.file_name,
                "owner_name": 'Ivanov Ivan Ivanovich',
                "date_create": (item.data_create).strftime('%Y-%m-%d %H:%M:%S'),
                "div_name": name[0]
            } 
            items.append(item_js)
    print("status: TRUE\n")
    return items


def images_panel(engine, count, page):
    print("\n\nfile: queries.py \nfunc: images_panel")
    with Session(engine) as session:
        queryImages = select(Images).order_by(desc(Images.id_image)).offset(page * count).limit(count)
        images = session.scalars(queryImages).all()
        panels = [] # [[Images, {'WBC': 1, 'RBC': 15} ], [Images, {'WBC': 4, 'RBC': 25}], [] ...]
        for image in images:
            queryLabels = select(Labels.cls, func.count('*')).where(Labels.id_image == image.id_image).group_by(Labels.cls)
            labelsImage = session.execute(queryLabels).all()
            panels.append([image, dict(labelsImage)])
        print("status: TRUE\n")
        return panels


def count_of_pages(engine, count):
    print("\n\nfile: queries.py \nfunc: count_of_images")
    with Session(engine) as session:
        pages = session.scalar(select(func.count(Images.id_image)))
        print("status: TRUE\n")
        return math.ceil(int(pages) / count)


def get_image_path_id(engine, name):
    print("\n\nfile: queries.py \nfunc: get_image_path_id")
    with Session(engine) as session:
        query = select(Images.id_image, Images.file_path, Images.file_name, Images.data_create).where(Images.file_name == f'{name}').limit(1)
        result = session.execute(query).first()
        print("status: TRUE\n")
        return {"id": result[0], "path": result[1], "name": result[2], "date": result[3]}
    

def get_image_labels(engine, id):
    print("\n\nfile: queries.py \nfunc: get_image_labels")
    with Session(engine) as session:
        query = select(Labels.cls, Labels.x, Labels.y, Labels.w, Labels.h, Labels.conf).where(Labels.id_image == id)
        result = session.execute(query).all()
        labels = []
        for item in result:
            label = {
                'cls': item[0],
                'x': item[1],
                'y': item[2],
                'w': item[3],
                'h': item[4],
                'conf': item[5]
            }
            labels.append(label)
        return labels


def get_last_image_indx(engine):
    print("\n\nfile: queries.py \nfunc: get_last_image_indx")
    with Session(engine) as session:
        query = select(Images.id_image).order_by(desc(Images.id_image)).limit(1)
        indx = session.execute(query).scalars().one_or_none()
        print("status: TRUE\n")
        print(f"index: {indx}")
        if indx:
            return indx
        else:
            return 0
    

def get_image_indx(name, engine):
    print("\n\nfile: queries.py \nfunc: get_image_indx")
    with Session(engine) as session:
        query = select(Images.id_image).where(Images.file_name == f'{name}').limit(1)
        indx = session.execute(query).scalars().first()
        print(indx)
        print("status: TRUE\n")
        print(f"index: {indx}")
        return indx


def upload_labels(name, result, engine):
    print("\n\nfile: queries.py \nfunc: upload_labels")
    labels = []
    img_indx = get_image_indx(name, engine)
    for box in result.boxes:
        x, y, w, h = box.xywh[0][0].item(), box.xywh[0][1].item(), box.xywh[0][2].item(), box.xywh[0][3].item() #там тензор двумерный массив, так что надо так писать [0][3]
        conf = box.conf[0].item()
        cls = int(box.cls[0].item()) #box.cls возвращается тензор, поэтому нужно использова обращение к первому и единственному элементу [0] 
        labels.append(Labels(id_image=img_indx, cls=result.names[cls], conf=conf, x=round(x, 2), y=round(y, 2), w=round(w, 2), h=round(h, 2)))
    
    with Session(engine) as session:
        session.add_all(labels)
        session.commit()
        print("status: TRUE\n")


def upload_image(name, engine):
    print("\n\nfile: queries.py \nfunc: upload_image")
    image = Images(file_name=name, file_path=f"/uploads/{name}")
    with Session(engine) as session:
        session.add(image)
        session.commit()
        print("status: TRUE\n")

def delete_image(name, engine):
    print("\n\nfile: queries.py \nfunc: delete_image")
    image_indx = get_image_indx(name, engine)
    image_path = get_image_path_id(engine, name)["path"]
    path = os.path.join(os.path.dirname(APP_PATH), image_path.lstrip('\\/'))
    try:
        with Session(engine) as session:
            image = session.get(Images, image_indx)
            session.delete(image)
            try:
                if os.path.exists(path):
                    os.remove(path)
                    session.commit()
                    print("status: TRUE\n")
                    return {
                        "del_file": True,
                        "del_row": True,
                        "status": True,
                        "image": name
                    }
                else:
                    session.commit()
                    print("status: FALSE FILE NOT FIND\n")
                    return {
                        "del_file": False,
                        "del_row": True,
                        "status": True,
                        "image": name
                    }
                
            except OSError as e:
                session.rollback()
                print(f"status: FALSE {e}\n")
                return {
                    "del_file": False,
                    "del_row": False,
                    "status": False,
                    "image": name
                }
            
    except SQLAlchemyError as e:
        print(f"status: FALSE {e}\n")
        return {
            "del_file": False,
            "del_row": False,
            "status": False,
            "image": name
        }


def delete_labels(name, engine):
    print("\n\nfile: queries.py \nfunc: delete_labels")
    image_indx = get_image_indx(name, engine)
    try:
        with Session(engine) as session:
            query = delete(Labels).where(Labels.id_image == image_indx)
            session.execute(query)
            session.commit()
            print(f"status: TRUE\n")
        return True

    except SQLAlchemyError as e:
        print(f"status: FALSE {e}\n")
        return False
    

def uploud_labels_frontend(name, newBoxes, engine):
    print("\n\nfile: queries.py \nfunc: uploud_labels_frontend")
    image_indx = get_image_indx(name, engine)
    try:
        labels = []
        classes = {v: k for k, v in newBoxes.class_names.items()}
        with Session(engine) as session:
            for box in newBoxes.boxes:
                print(box.cls)
                labels.append(Labels(id_image=image_indx, cls=classes[box.cls], conf=box.conf, x=round(box.x, 2), y=round(box.y, 2), w=round(box.w, 2), h=round(box.h, 2)))
            session.add_all(labels)
            session.commit()
            print(f"status: TRUE\n")
            pass
        return True

    except SQLAlchemyError as e:
        print(f"status: FALSE {e}\n")
        return False


def _restart_db(engine):
    print("\n\nfile: queries.py \nfunc: _restart_db")
    drop_db(engine)
    create_db(engine)
    Sessions = sessionmaker(bind=engine)
    with Sessions() as session:
        # Генерация данных
        stats, labels, images = generate()
        session.add_all(stats + labels + images)
        session.commit()
        print("status: TRUE\n")
    return


if __name__=="__main__":
    pass