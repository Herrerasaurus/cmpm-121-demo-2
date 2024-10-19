import "./style.css";

const APP_NAME = "Hello World";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

// add app title to webpage
/*const appTitle = document.createElement("h1");
appTitle.innerHTML = APP_NAME;
*/
//add a canvas to the webpage (size 256x256)
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;

//document.body.append(appTitle);
document.body.append(canvas);
