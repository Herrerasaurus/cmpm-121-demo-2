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
const commands: LineCommand[] = [];
const redoCommands: (LineCommand | never[])[] = [];
let cursorCommand: CursorCommand | null = null;

// add observer for "drawing-changed" event to clear and redraw user lines
const updateCanvas = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", (e) => {
    // clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        commands.forEach(command => command.execute());
        if(cursorCommand){
            cursorCommand.execute(ctx);
        }
    }
});

class CursorCommand{
    x: number;
    y: number;
    lineWidth: number;
    constructor (x: number, y: number, lineWidth: number){
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
    }
    execute(ctx: CanvasRenderingContext2D){
            //make text bold if line width is 6
            if(this.lineWidth == 6){
                ctx.font = "20px Arial";
            }else{
                ctx.font = "10px Arial";
            }
            ctx.fillText("●", this.x-5, this.y+3);

        }
    }

class LineCommand{
    points: { x: number; y: number; lineWidth: number; }[];
    constructor (x: number, y: number, lineWidth: number){
        this.points = [{x, y, lineWidth}];
    }
    execute(){
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

let currentLineCommand: LineCommand | null = null;

let lineWidth = 2;

// get user input for cursor
canvas.addEventListener("mouseout", (e) => {
    cursorCommand = null;
    canvas.dispatchEvent(updateCanvas);
});

canvas.addEventListener("mouseenter", (e) => {
    cursorCommand = new CursorCommand(e.offsetX, e.offsetY, lineWidth);
    canvas.dispatchEvent(updateCanvas);
});

// get user input for drawing
canvas.addEventListener("mousedown", (e) => {
    currentLineCommand = new LineCommand(e.offsetX, e.offsetY, lineWidth);
    commands.push(currentLineCommand);
    redoCommands.splice(0, redoCommands.length);
    canvas.dispatchEvent(updateCanvas);
});


canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(e.offsetX, e.offsetY, lineWidth);
    canvas.dispatchEvent(updateCanvas);
    if(e.buttons == 1){
        currentLineCommand?.points.push({x: e.offsetX, y: e.offsetY, lineWidth});
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
        redoCommands.push(commands.pop() || []);
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
        if (command instanceof LineCommand) {
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
});

const thinLine = document.createElement("button");
thinLine.innerHTML = "Thin Line";
thinLine.addEventListener("click", () => {
    lineWidth = 2;
});

app.append(document.createElement("br"));
app.append(thickLine);
app.append(thinLine);  





