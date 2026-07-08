from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from backend.database import engine, Base
from backend.routers import reps, territories, quotas, attainment, comp_plans, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Marketing51 Rep Management", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(reps.router, prefix="/api/reps", tags=["Reps"])
app.include_router(territories.router, prefix="/api/territories", tags=["Territories"])
app.include_router(quotas.router, prefix="/api/quotas", tags=["Quotas"])
app.include_router(attainment.router, prefix="/api/attainment", tags=["Attainment"])
app.include_router(comp_plans.router, prefix="/api/comp-plans", tags=["Comp Plans"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

# Serve React frontend
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        index = os.path.join(frontend_path, "index.html")
        return FileResponse(index)
