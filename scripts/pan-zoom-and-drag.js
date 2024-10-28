import Vec2 from "./vec2.js";

const scaleSensitivity = 0.1;
const minScale = 0.1;

let clickedPos = new Vec2(0, 0);
let transformScale = 1;

document.addEventListener("DOMContentLoaded", () => {

    const workspace = document.getElementById("workspace");
    workspace.transformPos = new Vec2(0, 0);
    workspace.onDrag = (dragAmount) => {
        workspace.style.setProperty("--pos-x", dragAmount.x);
        workspace.style.setProperty("--pos-y", dragAmount.y);
    }

    let draggingElement = {};
    function drag(event) {
        const newPos = new Vec2(
            draggingElement.transformPos.x + (event.pageX - clickedPos.x) * (1 / transformScale),
            draggingElement.transformPos.y + (event.pageY - clickedPos.y) * (1 / transformScale)
        );

        draggingElement.onDrag(newPos);
    }

    document.addEventListener("mousedown", (event) => {
        clickedPos.x = event.pageX;
        clickedPos.y = event.pageY;

        if (event.target.classList.contains("node")) {
            draggingElement = event.target.node;
        }
        else if (event.target.parentElement.classList.contains("node")) {
            draggingElement = event.target.parentElement.node;
        }
        else {
            draggingElement = workspace;
        }

        document.addEventListener("mousemove", drag);
        
        document.addEventListener("mouseup", (event) => {
            draggingElement.transformPos.x += (event.pageX - clickedPos.x) * (1 / transformScale);
            draggingElement.transformPos.y += (event.pageY - clickedPos.y) * (1 / transformScale); 
            document.removeEventListener("mousemove", drag);
        }, {once: true});
    });

    document.addEventListener("wheel", (event) => {
        const direction = Math.sign(event.deltaY);
        if (transformScale + direction * scaleSensitivity < minScale) {
            return;
        }
        transformScale += direction * scaleSensitivity;

        workspace.style.setProperty("--scale", transformScale);
    });
});