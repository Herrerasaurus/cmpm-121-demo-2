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

// array for mouse input
const points: { x: number; y: number }[] = [];

// add observer for "drawing-changed" event to clear and redraw user lines
app.addEventListener("drawing-changed", (e) => {
    // clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // redraw points
        for (let i = 0; i < points.length; i++) {
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
            }
            ctx.lineTo(points[i].x, points[i].y);
            ctx.stroke();
        }
    }
});
       


// get user input
canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    //dispatch "drawing-changed" event on canvas object after new point
    
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

// add clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.addEventListener("click", () => {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});
app.append(clearButton);




