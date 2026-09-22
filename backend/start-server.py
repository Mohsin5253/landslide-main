import os
import sys
import uvicorn
from main import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    reload_mode = os.environ.get("RELOAD", "false").lower() in ("true", "1", "yes")
    print(f"Starting NEXUS-LAND FastAPI Server on 0.0.0.0:{port}...", flush=True)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=reload_mode, access_log=True)
