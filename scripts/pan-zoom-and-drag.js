const scaleSensitivity = 0.1;
const minScale = 0.1;

let clickedPos = {
    x: 0,
    y: 0
}
let transformScale = 1;

document.addEventListener("DOMContentLoaded", () => {

    const graph = document.getElementsByClassName("graph")[0];
    graph.transformPos = {
        x: 0,
        y: 0
    }

    let draggingElement = {};
    function drag(event) {
        const newPos = {
            x: draggingElement.transformPos.x + (event.pageX - clickedPos.x) * (1 / transformScale),
            y: draggingElement.transformPos.y + (event.pageY - clickedPos.y) * (1 / transformScale),
        }

        draggingElement.style.setProperty("--pos-x", newPos.x);
        draggingElement.style.setProperty("--pos-y", newPos.y);
    }

    document.addEventListener("mousedown", (event) => {
        clickedPos.x = event.pageX;
        clickedPos.y = event.pageY;

        if (event.target.classList.contains("node")) {
            draggingElement = event.target;
        }
        else if (event.target.parentElement.classList.contains("node")) {
            draggingElement = event.target.parentElement;
        }
        else {
            draggingElement = graph;
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

        graph.style.setProperty("--scale", transformScale);
    });
});