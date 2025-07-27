class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class LocalDevelopmentConfig(Config):
    # Database
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True

    # Flask-Security
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = 'thisshouldbekeptsecret'
    SECRET_KEY = 'shouldbekeyveryhidden'
    
    # Token header config
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    SECURITY_TOKEN_AUTHENTICATION_MODE = 'token'
    SECURITY_TOKEN_MAX_AGE = 3600
    SECURITY_LOGIN_URL = "/login"
    SECURITY_USE_SESSION = False

    WTF_CSRF_ENABLED = False

    # Flask-Mail
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'anjalidogra2005@gmail.com'
    MAIL_PASSWORD = 'zxgh oxws hdya ybiq'
    MAIL_DEFAULT_SENDER = 'anjalidogra2005@gmail.com'

    # Redis & Celery
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
