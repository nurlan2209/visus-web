from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from .config import get_settings

security = HTTPBasic(auto_error=False)
settings = get_settings()


def get_admin(request: Request, credentials: HTTPBasicCredentials = Depends(security)):
    if request.method == "OPTIONS":
        return "options"
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized", headers={"WWW-Authenticate": "Basic"})
    if credentials.username != settings.admin_username or credentials.password != settings.admin_password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized", headers={"WWW-Authenticate": "Basic"})
    return credentials.username
