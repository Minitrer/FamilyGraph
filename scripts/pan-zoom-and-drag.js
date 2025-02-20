import Vec2 from "./vec2.js";
import { GENDERMENU } from "./controls.js";
import { RELATIONSHIPTEXTS } from "./controls.js";
import Person from "./person.js";
import { draggedPerson, draggedPoint } from "./actions.js";

const scaleSensitivity = 0.1;
const minScale = 0.1;
const workspace = document.getElementById("workspace");

export let CLICKED_POS = new Vec2(0, 0);
export let TRANSFORM_SCALE = 1;
export let DRAGGING_ELEMENTS = [];

export default function makeDraggableBasic(element) {
    element.transformPos = new Vec2();
    element.onDrag = (dragAmount) => {
        element.style.setProperty("--pos-x", dragAmount.x);
        element.style.setProperty("--pos-y", dragAmount.y);
    }
}

export function centerWorkspace() {
    workspace.transformPos = new Vec2();
    workspace.onDrag(new Vec2());

    const firstFamily = document.getElementById("graph").firstElementChild;
    if (!firstFamily) {
        setWorkspaceScale(1);
        return;
    }

    const firstFamilyRect = firstFamily.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();

    if (firstFamilyRect.width <= workspaceRect.width && firstFamilyRect.height <= workspaceRect.height) {
        setWorkspaceScale(1);
        return;
    }
    const scaleByWidth = (firstFamilyRect.width > workspaceRect.width && firstFamilyRect.height <= workspaceRect.height) ||
                         (firstFamilyRect.width - workspaceRect.width > firstFamilyRect.height - workspaceRect.height);
    if (scaleByWidth) {
        const difference = firstFamilyRect.width - workspaceRect.width;
        const scale = 1 - difference / firstFamilyRect.width;
        const rounded = Math.floor(scale / scaleSensitivity) * scaleSensitivity;
        setWorkspaceScale(rounded);
        return;
    }

    const difference = firstFamilyRect.height - workspaceRect.height;
    const scale = 1 - difference / firstFamilyRect.height;
    const rounded = Math.floor(scale / scaleSensitivity) * scaleSensitivity;
    setWorkspaceScale(rounded);
}

 export function setWorkspaceScale(scale) {
    TRANSFORM_SCALE = scale;
    workspace.style.setProperty("--scale", TRANSFORM_SCALE);
}

document.addEventListener("DOMContentLoaded", () => {
    makeDraggableBasic(workspace);

    function drag(event) {
        DRAGGING_ELEMENTS.forEach((element) => {
            const newPos = new Vec2(
                element.transformPos.x + (event.pageX - CLICKED_POS.x) * (1 / TRANSFORM_SCALE),
                element.transformPos.y + (event.pageY - CLICKED_POS.y) * (1 / TRANSFORM_SCALE)
            );
    
            element.onDrag(newPos);
        });
    }

    let isDragging = false;
    document.addEventListener("pointerdown", (event) => {
        if (isDragging || (event.target.parentElement && event.target.parentElement.id === "help-text") || event.target.id === "help-text") {
            return;
        }

        isDragging = true;
        function addUIElements(person) {
            if (person.div.classList.contains("selected")) {
                DRAGGING_ELEMENTS.push(GENDERMENU);
                return;
            }
            if (RELATIONSHIPTEXTS.has(person.id)) {
                DRAGGING_ELEMENTS.push(RELATIONSHIPTEXTS.get(person.id));
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
            DRAGGING_ELEMENTS = [workspace];
        }
        else if (event.target.classList.contains("point")) {
            DRAGGING_ELEMENTS = [event.target];
            positionBeforeDragging = getPointTransforms(event.target);
        }
        else if (event.target.classList.contains("person")) {
            DRAGGING_ELEMENTS = [event.target.person];
            positionBeforeDragging = getPersonTransforms(event.target.person);
            addUIElements(event.target.person);

            const trashCan = document.getElementById("trash-can");
            trashCan.style.pointerEvents = "all";
            event.target.releasePointerCapture(event.pointerId);
        }
        else if (event.target.parentElement && event.target.parentElement.classList.contains("person")) {
            DRAGGING_ELEMENTS = [event.target.parentElement.person];
            positionBeforeDragging = getPersonTransforms(event.target.parentElement.person);
            addUIElements(event.target.parentElement.person);

            const trashCan = document.getElementById("trash-can");
            trashCan.style.pointerEvents = "all";
            event.target.releasePointerCapture(event.pointerId);
        }
        else {
            DRAGGING_ELEMENTS = [workspace];
        }

        CLICKED_POS.x = event.pageX;
        CLICKED_POS.y = event.pageY;

        document.addEventListener("pointermove", drag);
        
        document.addEventListener("pointerup", (event) => {
            isDragging = false;
            let positionAfterDragging = undefined;
            DRAGGING_ELEMENTS.forEach((element) => {
                element.transformPos.x += (event.pageX - CLICKED_POS.x) * (1 / TRANSFORM_SCALE);
                element.transformPos.y += (event.pageY - CLICKED_POS.y) * (1 / TRANSFORM_SCALE); 

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
            
            document.removeEventListener("pointermove", drag);
            DRAGGING_ELEMENTS = [];
            
            const trashCan = document.getElementById("trash-can");
            trashCan.style.pointerEvents = "none";
            event.preventDefault();
        }, {once: true});
    });

    document.addEventListener("wheel", (event) => {
        if (event.target.id === "help-text" || event.target.parentElement.id === "help-text") {
            return;
        }
        const direction = Math.sign(event.deltaY);
        if (TRANSFORM_SCALE + direction * scaleSensitivity < minScale) {
            return;
        }
        setWorkspaceScale(TRANSFORM_SCALE + direction * scaleSensitivity);
    });
});