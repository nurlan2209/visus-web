import logging
from typing import List
from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import get_settings
from .database import Base, engine, get_db, SessionLocal
from . import models, schemas
from .auth import get_admin
from .storage import save_file, delete_file

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("visus")

VALID_MEDIA_CATEGORIES = {"diagnostics", "interior"}


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.allowed_origins.split(',')],
    allow_methods=["*"] ,
    allow_headers=["*"],
    allow_credentials=True,
)

app.mount("/media", StaticFiles(directory=settings.local_storage_path), name="media")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/api/doctors", response_model=List[schemas.DoctorRead])
def list_doctors(db: Session = Depends(get_db)):
    logger.debug("GET /api/doctors")
    return db.query(models.Doctor).order_by(models.Doctor.id).all()


@app.get("/api/services", response_model=List[schemas.ServiceRead])
def list_services(db: Session = Depends(get_db)):
    logger.debug("GET /api/services")
    return db.query(models.ServiceItem).filter(models.ServiceItem.is_active.is_(True)).order_by(models.ServiceItem.id).all()


@app.get("/api/reviews", response_model=List[schemas.ReviewRead])
def list_reviews(db: Session = Depends(get_db)):
    logger.debug("GET /api/reviews")
    return db.query(models.Review).order_by(models.Review.id).all()


@app.post("/api/requests/callback", response_model=schemas.CallbackRead, status_code=201)
def create_callback(request: schemas.CallbackCreate, db: Session = Depends(get_db)):
    logger.info("New callback request from %s", request.name)
    obj = models.CallbackRequest(name=request.name, phone=request.phone)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def get_media_assets(db: Session, category: str):
    if category not in VALID_MEDIA_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown category")
    return db.query(models.MediaAsset).filter(models.MediaAsset.category == category).order_by(models.MediaAsset.id).all()


@app.get("/api/media/{category}", response_model=List[schemas.MediaAssetRead])
def list_media(category: str, db: Session = Depends(get_db)):
    logger.debug("GET /api/media/%s", category)
    return get_media_assets(db, category)


# Admin routes
@app.get("/api/admin/doctors", response_model=List[schemas.DoctorRead])
def admin_list_doctors(_: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.debug("ADMIN list doctors")
    return db.query(models.Doctor).order_by(models.Doctor.id).all()


@app.post("/api/admin/doctors", response_model=schemas.DoctorRead)
def admin_create_doctor(data: schemas.DoctorCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.info("ADMIN create doctor %s", data.name)
    obj = models.Doctor(**data.dict(by_alias=False))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/admin/doctors/{doctor_id}", response_model=schemas.DoctorRead)
def admin_update_doctor(doctor_id: int, data: schemas.DoctorCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.info("ADMIN update doctor %s", doctor_id)
    obj = db.get(models.Doctor, doctor_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Doctor not found")
    for field, value in data.dict(by_alias=False).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@app.delete("/api/admin/doctors/{doctor_id}", status_code=204)
def admin_delete_doctor(doctor_id: int, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    obj = db.get(models.Doctor, doctor_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Doctor not found")
    logger.info("ADMIN delete doctor %s", doctor_id)
    if obj.photo_url:
        delete_file(obj.photo_url)
    db.delete(obj)
    db.commit()


@app.get("/api/admin/services", response_model=List[schemas.ServiceRead])
def admin_list_services(_: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.debug("ADMIN list services")
    return db.query(models.ServiceItem).order_by(models.ServiceItem.id).all()


@app.post("/api/admin/services", response_model=schemas.ServiceRead)
def admin_create_service(data: schemas.ServiceCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.info("ADMIN create service %s", data.slug)
    obj = models.ServiceItem(**data.dict(by_alias=False))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/admin/services/{service_id}", response_model=schemas.ServiceRead)
def admin_update_service(service_id: int, data: schemas.ServiceCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.info("ADMIN update service %s", service_id)
    obj = db.get(models.ServiceItem, service_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, value in data.dict(by_alias=False).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@app.delete("/api/admin/services/{service_id}", status_code=204)
def admin_delete_service(service_id: int, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    obj = db.get(models.ServiceItem, service_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Service not found")
    logger.info("ADMIN delete service %s", service_id)
    db.delete(obj)
    db.commit()


@app.get("/api/admin/reviews", response_model=List[schemas.ReviewRead])
def admin_list_reviews(_: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.debug("ADMIN list reviews")
    return db.query(models.Review).order_by(models.Review.id).all()


@app.post("/api/admin/reviews", response_model=schemas.ReviewRead)
def admin_create_review(data: schemas.ReviewCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.info("ADMIN create review %s", data.patient_name)
    obj = models.Review(**data.dict(by_alias=False))
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/admin/reviews/{review_id}", response_model=schemas.ReviewRead)
def admin_update_review(review_id: int, data: schemas.ReviewCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.info("ADMIN update review %s", review_id)
    obj = db.get(models.Review, review_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Review not found")
    for field, value in data.dict(by_alias=False).items():
        setattr(obj, field, value)
    db.commit()
    db.refresh(obj)
    return obj


@app.delete("/api/admin/reviews/{review_id}", status_code=204)
def admin_delete_review(review_id: int, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    obj = db.get(models.Review, review_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Review not found")
    logger.info("ADMIN delete review %s", review_id)
    db.delete(obj)
    db.commit()


@app.get("/api/admin/media/{category}", response_model=List[schemas.MediaAssetRead])
def admin_list_media(category: str, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    logger.debug("ADMIN list media %s", category)
    return get_media_assets(db, category)


@app.post("/api/admin/media/{category}", response_model=schemas.MediaAssetRead)
def admin_create_media(category: str, data: schemas.MediaAssetCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    if category not in VALID_MEDIA_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown category")
    logger.info("ADMIN create media %s", category)
    obj = models.MediaAsset(
        category=category,
        title=data.title,
        description=data.description,
        photo_url=data.photo_url,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.put("/api/admin/media/{category}/{media_id}", response_model=schemas.MediaAssetRead)
def admin_update_media(category: str, media_id: int, data: schemas.MediaAssetCreate, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    if category not in VALID_MEDIA_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown category")
    obj = db.get(models.MediaAsset, media_id)
    if not obj or obj.category != category:
        raise HTTPException(status_code=404, detail="Media not found")
    logger.info("ADMIN update media %s id=%s", category, media_id)
    obj.title = data.title
    obj.description = data.description
    obj.photo_url = data.photo_url
    db.commit()
    db.refresh(obj)
    return obj


@app.delete("/api/admin/media/{category}/{media_id}", status_code=204)
def admin_delete_media(category: str, media_id: int, _: str = Depends(get_admin), db: Session = Depends(get_db)):
    if category not in VALID_MEDIA_CATEGORIES:
        raise HTTPException(status_code=400, detail="Unknown category")
    obj = db.get(models.MediaAsset, media_id)
    if not obj or obj.category != category:
        raise HTTPException(status_code=404, detail="Media not found")
    logger.info("ADMIN delete media %s id=%s", category, media_id)
    delete_file(obj.photo_url)
    db.delete(obj)
    db.commit()


@app.post("/api/admin/upload")
def admin_upload(file: UploadFile = File(...), folder: str = Form("media"), objectName: str | None = Form(None), _: str = Depends(get_admin)):
    logger.info("ADMIN upload file %s folder=%s", file.filename, folder)
    url, path = save_file(file, folder, objectName or None)
    return {"url": url, "path": path}


@app.delete("/api/admin/upload")
def admin_delete_upload(objectName: str, _: str = Depends(get_admin)):
    logger.info("ADMIN delete file %s", objectName)
    delete_file(objectName)
    return {"status": "deleted"}
