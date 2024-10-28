import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// add app title to webpage
const appTitle = document.createElement("h1");
appTitle.innerHTML = APP_NAME;
app.append(appTitle);


//adding export feature
const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
exportButton.addEventListener("click", () => {
    //temporary canvas object of 1024x1024 size
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    
    //prepare canvasrenderincontext2d object for canvas, using scale (x,y)
    ctx = exportCanvas.getContext("2d");
    if(ctx){
        ctx.scale(4, 4);
        commands.forEach(command => command.display());
        ctx.scale(1, 1);
        ctx = canvas.getContext("2d");

    }

    const anchor = document.createElement("a");
    anchor.href = exportCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();

});
app.append(exportButton);
app.append(document.createElement("br"));
app.append(document.createElement("br"));

//add a canvas to the webpage (size 256x256)
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);
app.append(document.createElement("br"));
app.append(document.createElement("br"));

// add simple marker drawing
let ctx = canvas.getContext("2d");

// array for mouse input
const commands: (LineCommand | StickerCommand)[] = [];
const redoCommands: (LineCommand | StickerCommand)[] = [];
let cursorCommand: CursorCommand | null = null;

// add observer for "drawing-changed" event to clear and redraw user lines
const updateCanvas = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
    // clear canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        commands.forEach(command => command.display());
        if(cursorCommand){
            cursorCommand.display(ctx);
        }
    }
});

let cursor = "*";
let lineColor = getRandomColor();

class CursorCommand{
    cursor: string;
    x: number;
    y: number;
    lineWidth: number;
    lineColor: string;
    rotationValue: number;
    constructor (cursor: string, x: number, y: number, lineWidth: number, lineColor: string, rotationValue: number){
        this.cursor = cursor;
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.rotationValue = rotationValue;
    }
    display(ctx: CanvasRenderingContext2D){
            let xShift = 0;
            let yShift = 0;            
            ctx.fillStyle = this.lineColor;
            if(this.lineWidth == 6){
                xShift = 10;
                yShift = 18;
                ctx.font = "40px Arial";
                ctx.fillText(this.cursor, this.x - xShift, this.y + yShift);

            }else if (this.lineWidth == 3){
                xShift = 8;
                yShift = 12;
                ctx.font = "30px Arial";
                ctx.fillText(this.cursor, this.x - xShift, this.y + yShift);

            }else{
                xShift = 15;
                yShift = 6;
                ctx.font = "30px Arial";
                ctx.save();
                const textMetrics = ctx.measureText(cursor);
                const width = textMetrics.width;
                const height = 30;
                ctx.translate(this.x + width/2, this.y + height / 2);
                ctx.rotate(rotationValue * Math.PI / 180);
                ctx.fillText(cursor, -width/2, height / 2);
                ctx.restore();
            }
        }
    }

class LineCommand{
    points: {x: number; y: number; lineWidth: number; lineColor: string;}[];
    constructor (x: number, y: number, lineWidth: number, lineColor: string){
        this.points = [{x, y, lineWidth, lineColor}];
    }
    display(){
        if (ctx) {
            ctx.strokeStyle = this.points[0].lineColor;
            ctx.beginPath();
            const {x, y} = this.points[0];
            ctx.moveTo(x, y);
            for(const {x, y, lineWidth, lineColor} of this.points){
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = lineColor;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    grow(x: number, y: number, lineWidth: number, lineColor: string){
        this.points.push({x, y, lineWidth, lineColor});
    }
}

let rotationValue = 0;

class StickerCommand{
    points: {x: number; y: number; cursor: string, rotationValue: number}[];
    constructor (x: number, y: number, cursor: string, rotationValue: number){
        this.points = [{x, y, cursor, rotationValue}];
    }
    display(){
        if (ctx) {
            //place one of the stickers
            ctx.font = "30px Arial";
            const {x, y, cursor, rotationValue} = this.points[0];
            ctx.save();
            const textMetrics = ctx.measureText(cursor);
            const width = textMetrics.width;
            const height = 30;
            ctx.translate(x + width/2, y + height / 2);
            ctx.rotate(rotationValue * Math.PI / 180);
            ctx.fillText(cursor, -width/2, height / 2);
            ctx.restore();
        }
    }
    grow(x: number, y: number, cursor: string, rotationValue: number){
        this.points.push({x, y, cursor, rotationValue});
    }
}

let currentLineCommand: LineCommand | StickerCommand | null = null;

let lineWidth = 3;

// get user input for cursor
canvas.addEventListener("mouseout", () => {
    cursorCommand = null;
    canvas.dispatchEvent(updateCanvas);
});

canvas.addEventListener("mouseenter", (e) => {
    cursorCommand = new CursorCommand(cursor, e.offsetX, e.offsetY, lineWidth, lineColor, rotationValue);
    canvas.dispatchEvent(updateCanvas);
});

// get user input for drawing
canvas.addEventListener("mousedown", (e) => {
    if(cursor == "*"){
        currentLineCommand = new LineCommand(e.offsetX, e.offsetY, lineWidth, lineColor);
    }else{
        currentLineCommand = new StickerCommand(e.offsetX, e.offsetY, cursor, rotationValue);
    }
    commands.push(currentLineCommand);
    redoCommands.splice(0, redoCommands.length);
    canvas.dispatchEvent(updateCanvas);
});


canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(cursor, e.offsetX, e.offsetY, lineWidth, lineColor, rotationValue);
    canvas.dispatchEvent(updateCanvas);
    if(cursor == "*"){
        if (currentLineCommand instanceof LineCommand) {
            currentLineCommand.points.push({x: e.offsetX, y: e.offsetY, lineWidth, lineColor});
        }
    }else{
        if(currentLineCommand instanceof StickerCommand){
            //transform sticker position
            currentLineCommand.points[0].x = e.offsetX;
            currentLineCommand.points[0].y = e.offsetY;
        }

    }
    canvas.dispatchEvent(updateCanvas);

});

canvas.addEventListener("mouseup", () => {
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
app.append(document.createElement("br"));

//randomize color
function getRandomColor(){
    const letters = '0123456789ABCDEF';
    let color = '#';
    for(let i = 0; i < 6; i++){
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//adding different line width buttons
const thickLine = document.createElement("button");
thickLine.innerHTML = "Thick Line";
thickLine.addEventListener("click", () => {
    lineColor = getRandomColor();
    lineWidth = 6;
    cursor = "*";
});

const thinLine = document.createElement("button");
thinLine.innerHTML = "Thin Line";
thinLine.addEventListener("click", () => {
    lineColor = getRandomColor();
    lineWidth = 3;
    cursor = "*";
});

app.append(thickLine);
app.append(thinLine);
app.append(document.createElement("br"));

// rotate sticker orientation with range slider
const rotateSlider = document.createElement("input");
rotateSlider.type = "range";
rotateSlider.min = "0";
rotateSlider.max = "360";
rotateSlider.value = "0";
rotateSlider.addEventListener("input", (e) => {
    rotationValue = parseInt(rotateSlider.value, 10);
    if (currentLineCommand instanceof StickerCommand) {
        currentLineCommand.points[0].rotationValue = rotationValue;
    }
    canvas.dispatchEvent(updateCanvas);
});


const rotateLabel = document.createElement("label");
rotateLabel.innerHTML = "Rotate Sticker";

app.append(rotateLabel);
app.append(document.createElement("br"));
app.append(rotateSlider);
app.append(document.createElement("br"));

interface Sticker{
    emoji: string,
};

const stickers: Sticker[] = [
    {emoji: "{custom}"},
    {emoji: "🧌"},
    {emoji: "🦆"},
    {emoji: "😜"}
];

// function, add button
class addButton{
    emoji: string;
    constructor(emoji: string){
        this.emoji = emoji;
    }
    display(){
        const button = document.createElement("button");
        button.innerHTML = this.emoji;
        button.addEventListener("click", () => {
            lineWidth = 0;
            if(this.emoji == "{custom}"){
                const customSticker = prompt("Enter a custom sticker", "😀");
                if(customSticker != null){
                    const newSticker = {emoji: customSticker};
                    stickers.push(newSticker);
                    const newButton = new addButton(customSticker);
                    newButton.display();
                    cursor = customSticker;
                }
            }else{
                cursor = this.emoji;
            }
            canvas.dispatchEvent(updateCanvas);
        });
        app.append(button);
    }
}

for(let i = 0; i < stickers.length; i++){
    const sticker = stickers[i];
    const newButton = new addButton(sticker.emoji);
    newButton.display();
}










