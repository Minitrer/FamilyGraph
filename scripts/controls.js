import Vec2 from "./vec2.js";
import Person from "./person.js";
import { PEOPLE } from "./person.js";
import { CLICKEDPOS } from "./pan-zoom-and-drag.js";
import makeDraggableBasic from "./pan-zoom-and-drag.js";
import * as Actions from "./actions.js";

let targetPerson;
let selected = [];
export let RELATIONSHIPTEXTS = new Map();

export const GENDERMENU = document.getElementById("gender-menu");
makeDraggableBasic(GENDERMENU);

const genderOptions = document.getElementsByName("gender");
for (const option of genderOptions) {
    option.onchange = () => {
        if (targetPerson) {
            targetPerson.gender = option.value;
        }
    }
}
// Context menu options on background
const contextMenu = document.getElementById("context-menu");
const horizontalRule = document.createElement("hr");

const bgAddPersonButton = document.createElement("button");
const bgResetTransforms = document.createElement("button");

bgAddPersonButton.textContent = "Add person";
bgResetTransforms.textContent = "Reset all positions";

const onBackground = [bgAddPersonButton, horizontalRule, bgResetTransforms];

bgAddPersonButton.addEventListener("click", (e) => {
    onMenuClick(e, Person.createPerson);
});

bgResetTransforms.addEventListener("click", (e) => {
    onMenuClick(e, Person.resetAllTransforms);
});
// Context menu option on person
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

addParentButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addParent(targetPerson) });
});
addSpouceButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addSpouce(targetPerson) });
});
addChildButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addChild(targetPerson) });
});
resetTransformButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { targetPerson.resetTransform() });
});
deleteButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { targetPerson.delete() });
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
function onMenuClick(e, action) {
    e.preventDefault();
    hideContextMenu();

    action();
}
function selectPeople(selection) {
    selected.forEach((selection) => {
        selection.classList.remove("selected");
    });
    selection.forEach((person) => {
        person.classList.add("selected");
    });
    selected = selection;
    for (const text of RELATIONSHIPTEXTS.values()) {
        text.remove();
    }
    targetPerson = selected[0].person;
    createRelationshipText(targetPerson);

    GENDERMENU.className = "show";
    const x = selected[0].offsetLeft + selected[0].person.transformPos.x + selected[0].offsetWidth / 2 - GENDERMENU.offsetWidth / 2;
    const y = selected[0].offsetTop + selected[0].person.transformPos.y - GENDERMENU.offsetHeight;
    GENDERMENU.style.left = `${x}px`;
    GENDERMENU.style.top = `${y}px`;
}
function resetGenderMenuPosition() {
    GENDERMENU.style.setProperty("--pos-x", 0);
    GENDERMENU.style.setProperty("--pos-y", 0);
    GENDERMENU.transformPos.x = 0;
    GENDERMENU.transformPos.y = 0;
}

const workspace = document.getElementById("workspace");
function createRelationshipText(person) {
    for (const [id, relationship] of person.relationships) {
        const text = document.createElement("h2");

        text.classList.add("relationship");
        text.textContent = relationship.text.at(0).toUpperCase().concat(relationship.text.slice(1));
        workspace.appendChild(text);

        const x = PEOPLE[id].div.offsetLeft + PEOPLE[id].transformPos.x + PEOPLE[id].div.offsetWidth / 2 - text.offsetWidth / 2;
        const y = PEOPLE[id].div.offsetTop + PEOPLE[id].transformPos.y + PEOPLE[id].div.offsetHeight;
        text.style.left = `${x}px`;
        text.style.top = `${y}px`;

        text.style.setProperty("--pos-x", 0);
        text.style.setProperty("--pos-y", 0);
        text.style.transform = "translate(calc(var(--pos-x) * 1px), calc(var(--pos-y) * 1px))";
        makeDraggableBasic(text);

        RELATIONSHIPTEXTS.set(id, text);
    }
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
    if (event.target.classList.contains("person")) {
        target = event.target.firstElementChild;
    }
    else if (event.target.classList.contains("name")) {
        target = event.target;
    }

    if (target) {
        target.focus();
        return;
    }
    Person.createPerson();
});

document.addEventListener("click", (event) => {
    if (event.target.tagName === "FORM" || event.target.tagName === "INPUT" || event.target.tagName === "LABEL") {
        return;
    }
    event.preventDefault();

    let target = undefined;
    targetPerson = undefined;
    if (event.target.classList.contains("person")) {
        target = event.target;
    }
    else if (event.target.classList.contains("name")) {
        target = event.target.parentElement;
    }

    if (target) {
        if (CLICKEDPOS.x !== event.pageX || CLICKEDPOS.y !== event.pageY) {
            return;
        }
        resetGenderMenuPosition();
        const currentGenderOption = document.getElementById(target.person.gender);
        currentGenderOption.checked = true;
        selectPeople([target]);
        return;
    }

    selected.forEach((selection) => {
        selection.classList.remove("selected");
    });
    selected = [];
    for (const text of RELATIONSHIPTEXTS.values()) {
        text.remove();
    }
    RELATIONSHIPTEXTS.clear;

    GENDERMENU.className = "hidden";
    resetGenderMenuPosition();
});