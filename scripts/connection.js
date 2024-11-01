import Vec2 from "./vec2.js";

const pathWidth = 5;
const curveLength = 10;
const arrowWidth = 5;
const padding = pathWidth + arrowWidth;
const workspace = document.getElementById("workspace");

export default function createConnection(from, to, direction, color="white", hasArrow=true, replace=undefined) {
    
    if (direction !== "left" &&
        direction !== "right" &&
        direction !== "up" &&
        direction !== "down") {
            console.error("Invalid connection direction, check creation function");
            return;
        }

    const dirTo = to.sub(from);
    let svg = replace;
    if (!replace) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    }
    
    svg.setAttribute("height", Math.abs(dirTo.y) + padding * 2);
    svg.setAttribute("width", Math.abs(dirTo.x) + padding * 2);
    svg.setAttribute("viewBox", `0 0 ${Math.abs(dirTo.x) + padding * 2} ${Math.abs(dirTo.y) + padding * 2}`);

    svg.style.position = "absolute";
    svg.style.left = `${Math.min(from.x, to.x) - padding}px`;
    svg.style.top = `${Math.min(from.y, to.y) - padding}px`;

    let path;
    if (replace) {
        path = replace.children[0];
    }
    else {
        path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    }
    let origin = new Vec2();
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
    let arrowPositions = [];
    if (hasArrow) {
        arrowPositions[0] = origin.add(dirTo);
        arrowPositions[1] = origin.add(dirTo);
    }

    // Connection is a straight line
    if (from.x === to.x || from.y === to.y) {
        if (hasArrow) {
            switch(direction) {
                case "left":
                    arrowPositions[0].x += arrowWidth;
                    arrowPositions[0].y += arrowWidth;
                    arrowPositions[1].x += arrowWidth;
                    arrowPositions[1].y -= arrowWidth;
                    break;
                case "right":
                    arrowPositions[0].x -= arrowWidth;
                    arrowPositions[0].y += arrowWidth;
                    arrowPositions[1].x -= arrowWidth;
                    arrowPositions[1].y -= arrowWidth;
                    break;
                case "up":
                    arrowPositions[0].x += arrowWidth;
                    arrowPositions[0].y += arrowWidth;
                    arrowPositions[1].x -= arrowWidth;
                    arrowPositions[1].y += arrowWidth;
                    break;
                case "down":
                    arrowPositions[0].x += arrowWidth;
                    arrowPositions[0].y -= arrowWidth;
                    arrowPositions[1].x -= arrowWidth;
                    arrowPositions[1].y -= arrowWidth;
                    break;
            }
    
            path.setAttribute("d",
                `M ${origin.x} ${origin.y}
                 L ${origin.x + dirTo.x} ${origin.y + dirTo.y}
                 L ${arrowPositions[0].x} ${arrowPositions[0].y}
                 M ${origin.x + dirTo.x} ${origin.y + dirTo.y}
                 L ${arrowPositions[1].x} ${arrowPositions[1].y}`);
        }
        else {
            path.setAttribute("d",
                `M ${origin.x} ${origin.y}
                 L ${origin.x + dirTo.x} ${origin.y + dirTo.y}`);
        }
    }
    else {
        let cornerPos = new Vec2();
        
        switch(direction) {
            case "left":
            case "right":
                cornerPos = new Vec2(origin.x + dirTo.x, origin.y);

                if (!hasArrow) {
                    break;
                }
    
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

                if (!hasArrow) {
                    break;
                }
    
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
    
        const originToCornerLength = cornerPos.sub(origin).magnitude();
        const cornerToTargetLength = origin.add(dirTo).sub(cornerPos).magnitude();
        
        const curveStart = origin.add(
            cornerPos.sub(origin).normalized().mult(Math.max(1, (originToCornerLength - curveLength)))
        );
        const curveEnd = cornerPos.add(
            origin.add(dirTo).sub(cornerPos).normalized().mult(Math.min(curveLength, cornerToTargetLength))
        );
        let pathString = 
           `M ${origin.x} ${origin.y}
            L ${curveStart.x} ${curveStart.y}
            Q ${cornerPos.x} ${cornerPos.y} ${curveEnd.x} ${curveEnd.y}
            L ${origin.x + dirTo.x} ${origin.y + dirTo.y}`;
        if (hasArrow) {
            pathString += 
               `L ${arrowPositions[0].x} ${arrowPositions[0].y}
                M ${origin.x + dirTo.x} ${origin.y + dirTo.y}
                L ${arrowPositions[1].x} ${arrowPositions[1].y}`;
        }
        path.setAttribute("d", pathString);
    }

    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", `${pathWidth}`);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("fill", "none");
    
    if (!replace) {
        svg.appendChild(path);
        workspace.prepend(svg);
    }
    return svg;
}