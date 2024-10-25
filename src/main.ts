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

// adding spacing between canvas and buttons
const spacer = document.createElement("div");
spacer.style.height = "20px";
app.append(spacer);

// add simple marker drawing
const ctx = canvas.getContext("2d");

// array for mouse input
const commands: (LineCommand | StickerCommand)[] = [];
const redoCommands: (LineCommand | StickerCommand)[] = [];
let cursorCommand: CursorCommand | null = null;

// add observer for "drawing-changed" event to clear and redraw user lines
const updateCanvas = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", (e) => {
    // clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        commands.forEach(command => command.display());
        if(cursorCommand){
            cursorCommand.display(ctx);
        }
    }
});

let cursor = "●";

class CursorCommand{
    cursor: string;
    x: number;
    y: number;
    lineWidth: number;
    constructor (cursor: string, x: number, y: number, lineWidth: number){
        this.cursor = cursor;
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
    }
    display(ctx: CanvasRenderingContext2D){
            let xShift = 0;
            let yShift = 0;
            if(this.lineWidth == 6){
                xShift = 8;
                yShift = 3;
                ctx.font = "20px Arial";
            }else if (this.lineWidth == 2){
                xShift = 5;
                ctx.font = "10px Arial";
            }else{
                xShift = 15;
                yShift = 6;
                ctx.font = "30px Arial";
            }
            ctx.fillText(this.cursor, this.x - xShift, this.y + yShift);
        }
    }

class LineCommand{
    points: {x: number; y: number; lineWidth: number;}[];
    constructor (x: number, y: number, lineWidth: number){
        this.points = [{x, y, lineWidth}];
    }
    display(){
        if (ctx) {
            ctx.strokeStyle = "black";
            ctx.beginPath();
            const {x, y} = this.points[0];
            ctx.moveTo(x, y);
            for(const {x, y, lineWidth} of this.points){
                ctx.lineWidth = lineWidth;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    grow(x: number, y: number, lineWidth: number){
        this.points.push({x, y, lineWidth});
    }
}

class StickerCommand{
    points: {x: number; y: number; cursor: string}[];
    constructor (x: number, y: number, cursor: string){
        this.points = [{x, y, cursor}];
    }
    display(){
        if (ctx) {
            //place one of the stickers
            ctx.font = "30px Arial";
            const {x, y, cursor} = this.points[0];
            ctx.fillText(cursor, x-15, y+5);
        }
    }
    grow(x: number, y: number, cursor: string){
        this.points.push({x, y, cursor});
    }
}

let currentLineCommand: LineCommand | StickerCommand | null = null;

let lineWidth = 2;

// get user input for cursor
canvas.addEventListener("mouseout", (e) => {
    cursorCommand = null;
    canvas.dispatchEvent(updateCanvas);
});

canvas.addEventListener("mouseenter", (e) => {
    cursorCommand = new CursorCommand(cursor, e.offsetX, e.offsetY, lineWidth);
    canvas.dispatchEvent(updateCanvas);
});

// get user input for drawing
canvas.addEventListener("mousedown", (e) => {
    if(cursor == "●"){
        currentLineCommand = new LineCommand(e.offsetX, e.offsetY, lineWidth);
    }else{
        currentLineCommand = new StickerCommand(e.offsetX, e.offsetY, cursor);
    }
    commands.push(currentLineCommand);
    redoCommands.splice(0, redoCommands.length);
    canvas.dispatchEvent(updateCanvas);
});


canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(cursor, e.offsetX, e.offsetY, lineWidth);
    canvas.dispatchEvent(updateCanvas);
    if(cursor == "●"){
        if (currentLineCommand instanceof LineCommand) {
            currentLineCommand.points.push({x: e.offsetX, y: e.offsetY, lineWidth});
        }
        canvas.dispatchEvent(updateCanvas);
    }
});

canvas.addEventListener("mouseup", (e) => {
    currentLineCommand = null;
    canvas.dispatchEvent(updateCanvas);
});

// add clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.addEventListener("click", () => {
    if (ctx) {
        commands.splice(0, commands.length);
        redoCommands.splice(0, redoCommands.length);
        canvas.dispatchEvent(updateCanvas);
    }
});
app.append(clearButton);

// add undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", () => {
    if (ctx && commands.length > 0) {
        const command = commands.pop();
        if (command) {
            redoCommands.push(command);
        }
        canvas.dispatchEvent(updateCanvas);
    }
});
app.append(undoButton);

// add redo button
const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", () => {
    if (ctx && redoCommands.length > 0) {
        const command = redoCommands.pop();
        if (command) {
            commands.push(command);
        }
        canvas.dispatchEvent(updateCanvas);
    }
});
app.append(redoButton);

//adding different line width buttons
const thickLine = document.createElement("button");
thickLine.innerHTML = "Thick Line";
thickLine.addEventListener("click", () => {
    lineWidth = 6;
    cursor = "●";
});

const thinLine = document.createElement("button");
thinLine.innerHTML = "Thin Line";
thinLine.addEventListener("click", () => {
    lineWidth = 2;
    cursor = "●";
});

app.append(document.createElement("br"));
app.append(thickLine);
app.append(thinLine); 

// add stickers
const sticker1 = document.createElement("button");
sticker1.innerHTML = "🧌";
sticker1.addEventListener("click", () => {
    lineWidth = 0;
    cursor = "🧌";
    canvas.dispatchEvent(updateCanvas);
});

const sticker2 = document.createElement("button");
sticker2.innerHTML = "🦆";
sticker2.addEventListener("click", () => {
    lineWidth = 0;
    cursor = "🦆"  ;
    canvas.dispatchEvent(updateCanvas);
});

const sticker3 = document.createElement("button");
sticker3.innerHTML = "😜";
sticker3.addEventListener("click", () => {
    lineWidth = 0;
    cursor = "😜";
    canvas.dispatchEvent(updateCanvas);
});

app.append(document.createElement("br"));
app.append(sticker1);
app.append(sticker2);
app.append(sticker3);






