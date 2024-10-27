import Vec2 from "./vec2.js";

const pathWidth = 5;
const arrowWidth = 5;
const padding = pathWidth + arrowWidth;
const workspace = document.getElementById("workspace");

export default function createConnection(from, to, direction, color="white") {
    
    if (direction !== "left" &&
        direction !== "right" &&
        direction !== "up" &&
        direction !== "down"
    ) {
        console.error("Invalid connection direction, check creation function");
        return;
    }

    const dirTo = to.subtract(from);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("height", Math.abs(dirTo.y) + padding * 2);
    svg.setAttribute("width", Math.abs(dirTo.x) + padding * 2);
    svg.setAttribute("viewBox", `0 0 ${Math.abs(dirTo.x) + padding * 2} ${Math.abs(dirTo.y) + padding * 2}`);

    svg.style.position = "absolute";
    svg.style.left = `${Math.min(from.x, to.x) - padding}px`;
    svg.style.top = `${Math.min(from.y, to.y) - padding}px`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let origin = {};
    switch(direction) {
        case "left":
            origin = new Vec2(
                Math.abs(dirTo.x) + padding,
                dirTo.y > 0? padding : padding - dirTo.y
            );
            break;
        case "right":
            origin = new Vec2(
                padding,
                dirTo.y > 0? padding : padding - dirTo.y
            );
            break;
        case "up":
            origin = new Vec2(
                dirTo.x > 0? padding : padding - dirTo.x,
                Math.abs(dirTo.y) + padding
            );
            break;
        case "down":
            origin = new Vec2(
                dirTo.x > 0? padding : padding - dirTo.x,
                padding
            );
            break;
    }
    let cornerPos = {};
    let arrowPositions = [];
    switch(direction) {
        case "left":
        case "right":
            cornerPos = new Vec2(origin.x + dirTo.x, origin.y);

            arrowPositions[0] = origin.add(dirTo);
            arrowPositions[1] = origin.add(dirTo);
            arrowPositions[0].x += arrowWidth;
            arrowPositions[1].x -= arrowWidth;

            if (dirTo.y > 0) {
                arrowPositions[0].y -= arrowWidth;
                arrowPositions[1].y -= arrowWidth;
                break;
            }
            arrowPositions[0].y += arrowWidth;
            arrowPositions[1].y += arrowWidth;
            break;
        case "up":
        case "down":
            cornerPos = new Vec2(origin.x, origin.y + dirTo.y);

            arrowPositions[0] = origin.add(dirTo);
            arrowPositions[1] = origin.add(dirTo);
            arrowPositions[0].y += arrowWidth;
            arrowPositions[1].y -= arrowWidth;

            if (dirTo.x > 0) {
                arrowPositions[0].x -= arrowWidth;
                arrowPositions[1].x -= arrowWidth;
                break;
            }
            arrowPositions[0].x += arrowWidth;
            arrowPositions[1].x += arrowWidth;
            break;
    }    
    path.setAttribute("d",
       `M ${origin.x} ${origin.y}
        L ${cornerPos.x} ${cornerPos.y}
        L ${origin.x + dirTo.x} ${origin.y + dirTo.y}
        L ${arrowPositions[0].x} ${arrowPositions[0].y}
        M ${origin.x + dirTo.x} ${origin.y + dirTo.y}
        L ${arrowPositions[1].x} ${arrowPositions[1].y}`);
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", `${pathWidth}`);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    
    svg.appendChild(path);
    workspace.appendChild(svg);
    return svg;
}