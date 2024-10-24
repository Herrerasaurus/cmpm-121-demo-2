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
if (ctx) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
}
const cursor = { x: 0, y: 0, active: false };

// array for mouse input
const commands: LineCommand[] = [];
const redoCommands: (LineCommand | never[])[] = [];

// add observer for "drawing-changed" event to clear and redraw user lines
const updateCanvas = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", (e) => {
    // clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        commands.forEach(command => command.execute());
    }
});

// have display list hold onto objects that have display (ctx) method and accept context parameter
//implement class used to represetn marker lines

class LineCommand{
    points: { x: number; y: number; }[];
    constructor (x: number, y: number){
        this.points = [{x, y}];
    }
    execute(){
        if (ctx) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 10;
            ctx.beginPath();
            const {x, y} = this.points[0];
            ctx.moveTo(x, y);
            for(const {x, y} of this.points){
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    grow(x: number, y: number){
        this.points.push({x, y});
    }

}

let currentLineCommand: LineCommand | null = null;



// get user input
canvas.addEventListener("mousedown", (e) => {
    currentLineCommand = new LineCommand(e.offsetX, e.offsetY);
    commands.push(currentLineCommand);
    redoCommands.splice(0, redoCommands.length);
    canvas.dispatchEvent(updateCanvas);
});


canvas.addEventListener("mousemove", (e) => {
    currentLineCommand?.points.push({x: e.offsetX, y: e.offsetY});
    canvas.dispatchEvent(updateCanvas);
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



