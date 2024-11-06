import Vec2 from "./vec2.js";

const scaleSensitivity = 0.1;
const minScale = 0.1;

export let clickedPos = new Vec2(0, 0);
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
        if (event.buttons === 2 || event.buttons === 4) {
            draggingElement = workspace;
        }
        else if (event.target.classList.contains("point")) {
            draggingElement = event.target;
        }
        else if (event.target.classList.contains("person")) {
            draggingElement = event.target.person;
        }
        else if (event.target.parentElement.classList.contains("person")) {
            draggingElement = event.target.parentElement.person;
        }
        else {
            return;
        }

        clickedPos.x = event.pageX;
        clickedPos.y = event.pageY;

        document.addEventListener("mousemove", drag);
        
        document.addEventListener("mouseup", (event) => {
            draggingElement.transformPos.x += (event.pageX - clickedPos.x) * (1 / transformScale);
            draggingElement.transformPos.y += (event.pageY - clickedPos.y) * (1 / transformScale); 
            document.removeEventListener("mousemove", drag);
            event.preventDefault();
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