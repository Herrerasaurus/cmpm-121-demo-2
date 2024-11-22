import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

// add app title to webpage
const appTitle = document.createElement("h1");
appTitle.innerHTML = APP_NAME;
app.append(appTitle);

//adding export feature
// Refectoring export button with helper function -- itzzbeatrizz
app.append(createButton("Export", () => {
    //temporary canvas object of 1024x1024 size
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;

    //prepare canvasrenderincontext2d object for canvas, using scale (x,y)
    ctx = exportCanvas.getContext("2d");
    if (ctx) {
        ctx.scale(4, 4);
        commands.forEach((command) => command.display());
        ctx.scale(1, 1);
        ctx = canvas.getContext("2d");
    }

    const anchor = document.createElement("a");
    anchor.href = exportCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
}));
app.append(document.createElement("br"), document.createElement("br"));

//add a canvas to the webpage (size 256x256)
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);
app.append(document.createElement("br"), document.createElement("br"));

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
        commands.forEach((command) => command.display());
        if (cursorCommand) {
            cursorCommand.display(ctx);
        }
    }
});

let cursor = "*";
let lineColor = "black";

class CursorCommand {
    cursor: string;
    x: number;
    y: number;
    lineWidth: number;
    lineColor: string;
    rotationValue: number;
    constructor(
        cursor: string,
        x: number,
        y: number,
        lineWidth: number,
        lineColor: string,
        rotationValue: number,
    ) {
        this.cursor = cursor;
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.rotationValue = rotationValue;
    }
    display(ctx: CanvasRenderingContext2D) {
        let xShift = 0;
        let yShift = 0;
        ctx.fillStyle = this.lineColor;
        if (this.lineWidth == 6) {
            xShift = 10;
            yShift = 18;
            ctx.font = "40px Arial";
            ctx.fillText(this.cursor, this.x - xShift, this.y + yShift);
        } else if (this.lineWidth == 3) {
            xShift = 8;
            yShift = 12;
            ctx.font = "30px Arial";
            ctx.fillText(this.cursor, this.x - xShift, this.y + yShift);
        } else { // Updating cursor for stickers -- itzzbeatrizz
            ctx.font = "30px Arial";
            ctx.save();
            const textMetrics = ctx.measureText(cursor);
            const width = textMetrics.width;
            const height = 30;
            ctx.translate(this.x + width / 2, this.y + height / 2);
            ctx.rotate(rotationValue * Math.PI / 180);
            ctx.fillText(cursor, -width / 2, height / 2);
            ctx.restore();
        }
    }
}

class LineCommand {
    points: { x: number; y: number; lineWidth: number; lineColor: string }[];
    constructor(x: number, y: number, lineWidth: number, lineColor: string) {
        this.points = [{ x, y, lineWidth, lineColor }];
    }
    display() {
        if (ctx) {
            ctx.strokeStyle = this.points[0].lineColor;
            ctx.beginPath();
            const { x, y } = this.points[0];
            ctx.moveTo(x, y);
            for (const { x, y, lineWidth, lineColor } of this.points) {
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = lineColor;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    grow(x: number, y: number, lineWidth: number, lineColor: string) {
        this.points.push({ x, y, lineWidth, lineColor });
    }
}

let rotationValue = 0;

class StickerCommand {
    points: { x: number; y: number; cursor: string; rotationValue: number }[];
    constructor(x: number, y: number, cursor: string, rotationValue: number) {
        this.points = [{ x, y, cursor, rotationValue }];
    }
    display() {
        if (ctx) {
            //place one of the stickers
            ctx.font = "30px Arial";
            const { x, y, cursor, rotationValue } = this.points[0];
            ctx.save();
            const textMetrics = ctx.measureText(cursor);
            const width = textMetrics.width;
            const height = 30;
            ctx.translate(x + width / 2, y + height / 2);
            ctx.rotate(rotationValue * Math.PI / 180);
            ctx.fillText(cursor, -width / 2, height / 2);
            ctx.restore();
        }
    }
    grow(x: number, y: number, cursor: string, rotationValue: number) {
        this.points.push({ x, y, cursor, rotationValue });
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
    cursorCommand = new CursorCommand(
        cursor,
        e.offsetX,
        e.offsetY,
        lineWidth,
        lineColor,
        rotationValue,
    );
    canvas.dispatchEvent(updateCanvas);
});

// get user input for drawing
canvas.addEventListener("mousedown", (e) => {
    // Refactoring code -- itzzbeatrizz
    if (cursor == "*") {
        currentLineCommand = new LineCommand(
            e.offsetX,
            e.offsetY,
            lineWidth,
            lineColor,
        );
    } else {
        currentLineCommand = new StickerCommand(
            e.offsetX,
            e.offsetY,
            cursor,
            rotationValue,
        );
    }

    commands.push(currentLineCommand);
    redoCommands.splice(0, redoCommands.length);
    canvas.dispatchEvent(updateCanvas);
});

canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(
        cursor,
        e.offsetX,
        e.offsetY,
        lineWidth,
        lineColor,
        rotationValue,
    );
    canvas.dispatchEvent(updateCanvas);
    if (cursor == "*") {
        if (currentLineCommand instanceof LineCommand) {
            currentLineCommand.points.push({
                x: e.offsetX,
                y: e.offsetY,
                lineWidth,
                lineColor,
            });
        }
    } else {
        if (currentLineCommand instanceof StickerCommand) {
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

// rotate sticker orientation with range slider
const rotateSlider = document.createElement("input");
rotateSlider.type = "range";
rotateSlider.min = "0";
rotateSlider.max = "360";
rotateSlider.value = "0";
rotateSlider.style.marginRight = "50px";
rotateSlider.addEventListener("input", (e) => {
    rotationValue = parseInt(rotateSlider.value, 10);
    if (currentLineCommand instanceof StickerCommand) {
        currentLineCommand.points[0].rotationValue = rotationValue;
    }
    canvas.dispatchEvent(updateCanvas);
});

// Allow players to manually change the color of the line
// Raquel Bravo
const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.value = "#000000";
colorPicker.style.marginLeft = "10px";
colorPicker.addEventListener("input", (e) => {
    lineColor = (e.target as HTMLInputElement).value;
    canvas.dispatchEvent(updateCanvas);
});

const rotateLabel = document.createElement("label");
rotateLabel.innerHTML = "Rotate Sticker";
app.append(rotateLabel);
const colorLabel = document.createElement("label");
colorLabel.innerHTML = "Line Color";
colorLabel.style.marginLeft = "60px";
app.append(colorLabel);
app.append(document.createElement("br"));

app.append(rotateSlider);
app.append(colorPicker);
app.append(document.createElement("br"));

// Refactoring clear, undo, and redo buttons with helper function -- itzzbeatrizz
app.append(createButton("Clear", () => {
    if (ctx) {
        commands.splice(0, commands.length);
        redoCommands.splice(0, redoCommands.length);
        canvas.dispatchEvent(updateCanvas);
    }
}));

app.append(createButton("Undo", () => {
    if (ctx && commands.length > 0) {
        const command = commands.pop();
        if (command) {
            redoCommands.push(command);
        }
        canvas.dispatchEvent(updateCanvas);
    }
}));

app.append(createButton("Redo", () => {
    if (ctx && redoCommands.length > 0) {
        const command = redoCommands.pop();
        if (command) {
            commands.push(command);
        }
        canvas.dispatchEvent(updateCanvas);
    }
}));
app.append(document.createElement("br"));

//adding different line width buttons
// Refactoring line width buttons with helper function -- itzzbeatrizz
app.append(createButton("Thick Line", () => {
    //lineColor = getRandomColor();
    lineWidth = 6;
    cursor = "*";
}));

app.append(createButton("Thin Line", () => {
    //lineColor = getRandomColor();
    lineWidth = 3;
    cursor = "*";
}));
app.append(document.createElement("br"));

interface Sticker {
    emoji: string;
}

const stickers: Sticker[] = [
    { emoji: "{custom}" },
    { emoji: "🧌" },
    { emoji: "🦆" },
    { emoji: "😜" },
];

// function, add button
class addButton {
    emoji: string;
    constructor(emoji: string) {
        this.emoji = emoji;
    }
    display() {
        const button = document.createElement("button");
        button.innerHTML = this.emoji;
        button.addEventListener("click", () => {
            lineWidth = 0;
            if (this.emoji == "{custom}") {
                const customSticker = prompt("Enter a custom sticker", "😀");
                if (customSticker != null) {
                    const newSticker = { emoji: customSticker };
                    stickers.push(newSticker);
                    const newButton = new addButton(customSticker);
                    newButton.display();
                    cursor = customSticker;
                }
            } else {
                cursor = this.emoji;
            }
            canvas.dispatchEvent(updateCanvas);
        });
        app.append(button);
    }
}

for (let i = 0; i < stickers.length; i++) {
    const sticker = stickers[i];
    const newButton = new addButton(sticker.emoji);
    newButton.display();
}
app.append(document.createElement("br"));

// Refactoring button creation into a helper function -- itzzbeatrizz
function createButton(text: string, onClick: () => void) {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.addEventListener("click", onClick);
    return button;
}
