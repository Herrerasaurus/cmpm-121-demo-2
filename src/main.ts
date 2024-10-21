import "./style.css";

const APP_NAME = "Hello World";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// add app title to webpage
const appTitle = document.createElement("h1");
appTitle.innerHTML = APP_NAME;

//add a canvas to the webpage (size 256x256)
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;

app.append(appTitle);
app.append(canvas);

// add simple marker drawing
const ctx = canvas.getContext("2d");
const cursor = { x: 0, y: 0, active: false };

canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && ctx) {
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
    }
});

canvas.addEventListener("mouseup", (e) => {
    cursor.active = false;
});






