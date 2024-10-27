const pathWidth = 5;
const arrowWidth = 5;
const padding = pathWidth + arrowWidth;
const workspace = document.getElementById("workspace");

export default function createConnection(from, to, direction) {
    
    if (direction !== "left" &&
        direction !== "right" &&
        direction !== "up" &&
        direction !== "down"
    ) {
        console.error("Invalid connection direction, check creation function");
        return;
    }

    const dirTo = {
        x: to.x - from.x,
        y: to.y - from.y,
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("height", Math.abs(dirTo.y) + padding * 2);
    svg.setAttribute("width", Math.abs(dirTo.x) + padding * 2);
    svg.setAttribute("viewBox", `0 0 ${Math.abs(dirTo.x) + padding * 2} ${Math.abs(dirTo.y) + padding * 2}`);

    svg.style.position = "absolute";
    svg.style.top = `${Math.min(from.x, from.x) - padding}`;
    svg.style.left = `${Math.min(from.y, from.y) - padding}`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const origin = {
        x: 0,
        y: 0,
    }
    origin.x = dirTo.x > 0? padding : Math.abs(dirTo.x);
    origin.y = dirTo.y > 0? padding : Math.abs(dirTo.y);
    path.setAttribute("d",
       `M ${origin.x} ${origin.y}
        L ${origin.x} ${origin.y + dirTo.y}
        L ${origin.x + dirTo.x} ${origin.y + dirTo.y}
        L ${origin.x + dirTo.x - arrowWidth} ${origin.y + dirTo.y - arrowWidth}
        M ${origin.x + dirTo.x} ${origin.y + dirTo.y}
        L ${origin.x + dirTo.x - arrowWidth} ${origin.y + dirTo.y + arrowWidth}`);
    path.setAttribute("stroke", "#ffffff");
    path.setAttribute("stroke-width", `${pathWidth}`);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    
    svg.appendChild(path);
    workspace.appendChild(svg);
    return svg;
}