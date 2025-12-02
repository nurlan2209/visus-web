from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CamelModel(BaseModel):
    class Config:
        allow_population_by_field_name = True
        populate_by_name = True
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class DoctorBase(CamelModel):
    name: str
    role: str
    experience_years: Optional[int] = Field(default=None, alias="experienceYears")
    description_ru: Optional[str] = Field(default=None, alias="descriptionRu")
    description_kk: Optional[str] = Field(default=None, alias="descriptionKk")
    photo_url: Optional[str] = Field(default=None, alias="photoUrl")


class DoctorCreate(DoctorBase):
    pass


class DoctorRead(DoctorBase):
    id: int


class ServiceBase(CamelModel):
    slug: str
    title_ru: str = Field(alias="titleRu")
    title_kk: str = Field(alias="titleKk")
    short_description_ru: Optional[str] = Field(default=None, alias="shortDescriptionRu")
    short_description_kk: Optional[str] = Field(default=None, alias="shortDescriptionKk")
    full_description_ru: Optional[str] = Field(default=None, alias="fullDescriptionRu")
    full_description_kk: Optional[str] = Field(default=None, alias="fullDescriptionKk")
    is_active: bool = Field(alias="isActive")


class ServiceCreate(ServiceBase):
    pass


class ServiceRead(ServiceBase):
    id: int


class ReviewBase(CamelModel):
    patient_name: str = Field(alias="patientName")
    rating: int = 5
    text_ru: Optional[str] = Field(default=None, alias="textRu")
    text_kk: Optional[str] = Field(default=None, alias="textKk")
    video_url: Optional[str] = Field(default=None, alias="videoUrl")
    poster_url: Optional[str] = Field(default=None, alias="posterUrl")


class ReviewCreate(ReviewBase):
    pass


class ReviewRead(ReviewBase):
    id: int


class CallbackCreate(BaseModel):
    name: str
    phone: str


class CallbackRead(BaseModel):
    id: int
    name: str
    phone: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MediaAssetBase(CamelModel):
    category: str
    title: Optional[str] = None
    description: Optional[str] = None
    photo_url: str = Field(alias="photoUrl")


class MediaAssetCreate(MediaAssetBase):
    pass


class MediaAssetRead(MediaAssetBase):
    id: int
