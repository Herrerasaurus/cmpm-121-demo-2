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
const lines: { x: number, y: number }[][] = [];
let currentLine: { x: number, y: number }[] | null = null;

// add observer for "drawing-changed" event to clear and redraw user lines
const updateCanvas = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", (e) => {
    // clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // redraw points
        for (const line of lines) {
            if(line.length > 1) {
                ctx.beginPath();
                const {x,y} = line[0];
                ctx.moveTo(x, y);
                for(const {x,y} of line){
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            }
        }
    }
});
       


// get user input
canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    console.log(cursor.x, cursor.y);
    
    currentLine = [];
    lines.push(currentLine);
    if (currentLine) {
        currentLine.push({ x: cursor.x, y: cursor.y });
    }
    //dispatch "drawing-changed" event on canvas object after new point
    canvas.dispatchEvent(updateCanvas);
    
});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active && ctx) {
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
        if (currentLine){
            currentLine.push({ x: cursor.x, y: cursor.y });
        }
        //dispatch "drawing-changed" event on canvas object after new point
        canvas.dispatchEvent(updateCanvas);
    }
});

canvas.addEventListener("mouseup", (e) => {
    cursor.active = false;
    currentLine = null;

    //dispatch "drawing-changed" event on canvas object after new point
    canvas.dispatchEvent(updateCanvas);
});

// add clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.addEventListener("click", () => {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lines.length = 0;
    }
});
app.append(clearButton);

const undoLines: { x: number, y: number }[][] = [];
// add undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", () => {
    if (ctx && lines.length > 0) {
        undoLines.push(lines.pop() || []);
        canvas.dispatchEvent(updateCanvas);
    }
});
app.append(undoButton);

// add redo button
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", () => {
    if (ctx && undoLines.length > 0) {
        lines.push(undoLines.pop() || []);
        canvas.dispatchEvent(updateCanvas);
    }
});
app.append(redoButton);



