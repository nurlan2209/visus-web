from sqlalchemy.orm import Session
from . import models


def seed_data(db: Session):
    if db.query(models.Doctor).count() == 0:
        doctors = [
            models.Doctor(
                name="Айжан Ермекова",
                role="Врач-офтальмолог",
                experience_years=12,
                description_ru="Комплексная диагностика, подбор коррекции, наблюдение взрослых пациентов.",
                description_kk="Кешенді диагностика, түзетуді таңдау, ересек пациенттерді бақылау.",
                photo_url="doctors/doctor1.jpg"
            ),
            models.Doctor(
                name="Динара Сапарова",
                role="Детский офтальмолог",
                experience_years=8,
                description_ru="Наблюдение детей, контроль прогрессирования близорукости, мягкие линзы.",
                description_kk="Балаларды бақылау, миопияның үдеуін бақылау, жұмсақ линзалар.",
                photo_url="doctors/doctor2.jpg"
            ),
            models.Doctor(
                name="Алина Тлеуберді",
                role="Администратор центра",
                experience_years=5,
                description_ru="Организует запись, отвечает на вопросы по услугам и времени приёма.",
                description_kk="Жазылуды ұйымдастырады, қызметтер және қабылдау уақыты туралы сұрақтарға жауап береді.",
                photo_url="doctors/admin.jpg"
            ),
        ]
        db.add_all(doctors)

    if db.query(models.ServiceItem).count() == 0:
        services = [
            models.ServiceItem(
                slug="diagnostics",
                title_ru="Комплексная диагностика зрения",
                title_kk="Кешенді көру диагностикасы",
                short_description_ru="Компьютерные измерения, проверка остроты зрения, осмотр глаз.",
                short_description_kk="Компьютерлік өлшеулер, көру өткірлігін тексеру, көзді қарау.",
                is_active=True
            ),
            models.ServiceItem(
                slug="kids",
                title_ru="Детская офтальмология",
                title_kk="Балалар офтальмологиясы",
                short_description_ru="Наблюдение детей, подбор очков и линз.",
                short_description_kk="Балаларды бақылау, көзілдірік пен линзаларды таңдау.",
                is_active=True
            ),
        ]
        db.add_all(services)

    if db.query(models.Review).count() == 0:
        reviews = [
            models.Review(
                patient_name="Пациент №1",
                rating=5,
                text_ru="Сделали диагностику за 40 минут",
                text_kk="40 минутта диагностика жасалды",
                poster_url="reviews/review1.jpg"
            )
        ]
        db.add_all(reviews)

    db.commit()
