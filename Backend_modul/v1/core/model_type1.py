from sqlalchemy.orm import (
    relationship,
    DeclarativeBase,
    Mapped,
    mapped_column,
)
from sqlalchemy.sql import func
from sqlalchemy import DateTime, ForeignKey, String, Integer, CheckConstraint, Float

class Base(DeclarativeBase):
    pass

class Images(Base):
    __tablename__="images"
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'processing', 'completed', 'failed')"),
    )
    id_image: Mapped[Integer] = mapped_column(Integer, primary_key=True)
    file_name: Mapped[String] = mapped_column(String, unique=True)
    file_path: Mapped[String] = mapped_column(String, default=r".\static\images\sample1.jpg")
    data_create: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    status: Mapped[String] = mapped_column(String, default="pending")

    relation_statistics: Mapped[list["Statistics_image"]] = relationship("Statistics_image", back_populates="relation_images", cascade="all, delete-orphan", passive_deletes=True)
    relation_labels: Mapped[list["Labels"]] = relationship("Labels", back_populates="relation_images", cascade="all, delete-orphan", passive_deletes=True)

class Statistics_image(Base):
    __tablename__="stats"
    id_statistic: Mapped[Integer] = mapped_column(Integer, primary_key=True)
    id_image: Mapped[Integer] = mapped_column(Integer, ForeignKey("images.id_image", ondelete="CASCADE")) # эта строка при создании БД, но в orm, по сути, не используется
    descriptions: Mapped[String] = mapped_column(String)
    date_create: Mapped[DateTime] = mapped_column(DateTime, default=func.now())
    
    relation_images: Mapped["Images"] = relationship("Images", back_populates="relation_statistics") # эта строка используется только для orm

class Labels(Base):
    __tablename__="labels"
    __table_args__ = (
        CheckConstraint("cls IN ('Platelet', 'RBC', 'WBC')"), #НАДО СВОЮ МОДЕЛЬ ПИСАТЬ
    )
    id_label: Mapped[Integer] = mapped_column(Integer, primary_key=True)
    id_image: Mapped[Integer] = mapped_column(Integer, ForeignKey("images.id_image", ondelete="CASCADE"))
    cls: Mapped[String] = mapped_column(String)
    x: Mapped[Float] = mapped_column(Float)
    y: Mapped[Float] = mapped_column(Float)
    w: Mapped[Float] = mapped_column(Float)
    h: Mapped[Float] = mapped_column(Float)
    conf: Mapped[Float] = mapped_column(Float)
    relation_images: Mapped["Images"] = relationship("Images", back_populates="relation_labels")


if __name__ == "__main__":
    pass

def create_db(engine):
    Base.metadata.create_all(engine)

def drop_db(engine):
    Base.metadata.drop_all(engine, checkfirst=True)