from fastapi import FastAPI

print("APP STARTING...", flush=True)

app = FastAPI()


@app.on_event("startup")
async def startup():
    print("FASTAPI STARTUP COMPLETE", flush=True)


@app.get("/")
async def root():
    return {
        "message": "FastAPI is working"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }


@app.get("/test")
async def test():
    return {
        "success": True
    }