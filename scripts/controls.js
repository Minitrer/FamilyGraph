import Person from "./person.js";
import { CLICKEDPOS } from "./pan-zoom-and-drag.js";
import * as Actions from "./actions.js";

const contextMenu = document.getElementById("context-menu");
const horizontalRule = document.createElement("hr");

const bgAddPersonButton = document.createElement("button");
const bgResetTransforms = document.createElement("button");

bgAddPersonButton.textContent = "Add person";
bgResetTransforms.textContent = "Reset all positions";

const onBackground = [bgAddPersonButton, horizontalRule, bgResetTransforms];

bgAddPersonButton.addEventListener("click", (e) => {
    onClick(e, Person.createPerson);
});

bgResetTransforms.addEventListener("click", (e) => {
    onClick(e, Person.resetAllTransforms);
});

const addParentButton = document.createElement("button");
const addSpouceButton = document.createElement("button");
const addChildButton = document.createElement("button");
const resetTransformButton = document.createElement("button");
const deleteButton = document.createElement("button");

addParentButton.textContent = "Add parent";
addSpouceButton.textContent = "Add spouce";
addChildButton.textContent = "Add child";
resetTransformButton.textContent = "Reset Position";
deleteButton.textContent = "Delete";

const onPerson = [addParentButton, addSpouceButton, addChildButton, horizontalRule, resetTransformButton, deleteButton];

let targetPerson;
addParentButton.addEventListener("click", (e) => {
    onClick(e, () => { Actions.addParent(targetPerson) });
});
addSpouceButton.addEventListener("click", (e) => {
    onClick(e, () => { Actions.addSpouce(targetPerson) });
});
addChildButton.addEventListener("click", (e) => {
    onClick(e, () => { Actions.addChild(targetPerson) });
});
resetTransformButton.addEventListener("click", (e) => {
    onClick(e, () => { targetPerson.resetTransform() });
});
deleteButton.addEventListener("click", (e) => {
    onClick(e, () => { targetPerson.delete() });
});

function setContextMenu(target) {
    if (target) {
        targetPerson = target;
        contextMenu.replaceChildren(...onPerson);
        return;
    }
    contextMenu.replaceChildren(...onBackground);
}
function hideContextMenu() {
    contextMenu.replaceChildren();
    contextMenu.className = "hide";
}
function onClick(e, action) {
    e.preventDefault();
    hideContextMenu();

    action();
}

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (event.pageX - CLICKEDPOS.x !== 0 && event.pageY - CLICKEDPOS.y !== 0) {
        return;
    }

    let contextTarget = undefined;
    if (event.target.classList.contains("person")) {
        contextTarget = event.target.person;
    }
    else if (event.target.parentElement.classList.contains("person")) {
        contextTarget = event.target.parentElement.person;
    }

    setContextMenu(contextTarget);

    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;

    contextMenu.className = "show";

    document.addEventListener("click", (event) => {
        if (event.buttons !== 2) {
            hideContextMenu();
        }
    }, {once:true});
});

document.addEventListener("dblclick", (event) => {
    event.preventDefault();

    let target = undefined;
    if (event.target.className === "person") {
        target = event.target.firstElementChild;
    }
    else if (event.target.className === "name") {
        target = event.target;
    }

    if (target) {
        target.focus();
        return;
    }
    Person.createPerson();
})