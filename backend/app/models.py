from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func
from sqlalchemy.orm import relationship
from .database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    experience_years = Column(Integer, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_kk = Column(Text, nullable=True)
    photo_url = Column(String(512), nullable=True)


class ServiceItem(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, nullable=False)
    title_ru = Column(String(255), nullable=False)
    title_kk = Column(String(255), nullable=False)
    short_description_ru = Column(Text, nullable=True)
    short_description_kk = Column(Text, nullable=True)
    full_description_ru = Column(Text, nullable=True)
    full_description_kk = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String(255), nullable=False)
    rating = Column(Integer, default=5)
    text_ru = Column(Text, nullable=True)
    text_kk = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    poster_url = Column(String(512), nullable=True)


class CallbackRequest(Base):
    __tablename__ = "callback_requests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(80), nullable=False)
    status = Column(String(32), default="NEW", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(64), nullable=False)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    photo_url = Column(String(512), nullable=False)
