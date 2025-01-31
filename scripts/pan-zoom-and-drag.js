import Vec2 from "./vec2.js";
import { GENDERMENU } from "./controls.js";
import { RELATIONSHIPTEXTS } from "./controls.js";
import Person from "./person.js";
import { draggedPerson, draggedPoint } from "./actions.js";

const scaleSensitivity = 0.1;
const minScale = 0.1;

export let CLICKEDPOS = new Vec2(0, 0);
export let TRANSFORMSCALE = 1;

export default function makeDraggableBasic(element) {
    element.transformPos = new Vec2();
    element.onDrag = (dragAmount) => {
        element.style.setProperty("--pos-x", dragAmount.x);
        element.style.setProperty("--pos-y", dragAmount.y);
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const workspace = document.getElementById("workspace");
    makeDraggableBasic(workspace);

    let draggingElements = [];
    function drag(event) {
        draggingElements.forEach((element) => {
            const newPos = new Vec2(
                element.transformPos.x + (event.pageX - CLICKEDPOS.x) * (1 / TRANSFORMSCALE),
                element.transformPos.y + (event.pageY - CLICKEDPOS.y) * (1 / TRANSFORMSCALE)
            );
    
            element.onDrag(newPos);
        });
    }

    let isDragging = false;
    document.addEventListener("mousedown", (event) => {
        if (isDragging) {
            return;
        }

        isDragging = true;
        function addUIElements(person) {
            if (person.div.classList.contains("selected")) {
                draggingElements.push(GENDERMENU);
                return;
            }
            if (RELATIONSHIPTEXTS.has(person.id)) {
                draggingElements.push(RELATIONSHIPTEXTS.get(person.id));
            }
        }
        function getPersonTransforms(person) {
            const transforms = {
                cssPosX: Number(person.div.style.getPropertyValue("--pos-x")),
                cssPosY: Number(person.div.style.getPropertyValue("--pos-y")),
                transformPos: new Vec2(person.transformPos.x, person.transformPos.y),
            }
            return transforms;
        }
        function getPointTransforms(point) {
            const transforms = {
                cssPosX: Number(point.style.getPropertyValue("--pos-x")),
                cssPosY: Number(point.style.getPropertyValue("--pos-y")),
                transformPos: new Vec2(point.transformPos.x, point.transformPos.y),
            }
            return transforms;
        }

        let positionBeforeDragging = undefined;

        if (event.buttons === 2 || event.buttons === 4) {
            draggingElements = [workspace];
        }
        else if (event.target.classList.contains("point")) {
            draggingElements = [event.target];
            positionBeforeDragging = getPointTransforms(event.target);
        }
        else if (event.target.classList.contains("person")) {
            draggingElements = [event.target.person];
            positionBeforeDragging = getPersonTransforms(event.target.person);
            addUIElements(event.target.person);
        }
        else if (event.target.parentElement.classList.contains("person")) {
            draggingElements = [event.target.parentElement.person];
            positionBeforeDragging = getPersonTransforms(event.target.parentElement.person);
            addUIElements(event.target.parentElement.person);
        }
        else {
            isDragging = false;
            return;
        }

        CLICKEDPOS.x = event.pageX;
        CLICKEDPOS.y = event.pageY;

        document.addEventListener("mousemove", drag);
        
        document.addEventListener("mouseup", (event) => {
            isDragging = false;
            let positionAfterDragging = undefined;
            draggingElements.forEach((element) => {
                element.transformPos.x += (event.pageX - CLICKEDPOS.x) * (1 / TRANSFORMSCALE);
                element.transformPos.y += (event.pageY - CLICKEDPOS.y) * (1 / TRANSFORMSCALE); 

                if (element instanceof Person) {
                    positionAfterDragging = getPersonTransforms(element);
                    draggedPerson(element, positionBeforeDragging, positionAfterDragging);
                    return;
                }
                if (element.classList.contains("point")) {
                    positionAfterDragging = getPointTransforms(element);
                    draggedPoint(element, positionBeforeDragging, positionAfterDragging);
                    return;
                }
            });
            
            document.removeEventListener("mousemove", drag);
            event.preventDefault();
        }, {once: true});
    });

    document.addEventListener("wheel", (event) => {
        const direction = Math.sign(event.deltaY);
        if (TRANSFORMSCALE + direction * scaleSensitivity < minScale) {
            return;
        }
        TRANSFORMSCALE += direction * scaleSensitivity;

        workspace.style.setProperty("--scale", TRANSFORMSCALE);
    });
});