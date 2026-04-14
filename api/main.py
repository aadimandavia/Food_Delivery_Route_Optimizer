import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Path hack for local vs Vercel compatibility
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import optimize

app = FastAPI(title="Food Delivery Route Optimizer API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(optimize.router, tags=["Optimization"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Food Delivery Route Optimizer API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
