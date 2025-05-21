
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request
import random

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

connected_users = {}
drawn_numbers = []
available_numbers = list(range(1, 76))

@app.get("/", response_class=HTMLResponse)
async def get(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = id(websocket)
    connected_users[user_id] = websocket
    try:
        while True:
            data = await websocket.receive_text()
            if data.startswith("draw"):
                if available_numbers:
                    number = random.choice(available_numbers)
                    available_numbers.remove(number)
                    drawn_numbers.append(number)
                    for ws in connected_users.values():
                        await ws.send_text(f"number:{number}")
            elif data.startswith("bingo"):
                name = data.split(":")[1]
                for ws in connected_users.values():
                    await ws.send_text(f"bingo:{name}")
    except WebSocketDisconnect:
        del connected_users[user_id]
    