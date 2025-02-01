import Person from "./person.js";
import { PEOPLE } from "./person.js";
import { CLICKEDPOS } from "./pan-zoom-and-drag.js";
import makeDraggableBasic from "./pan-zoom-and-drag.js";
import * as Actions from "./actions.js";

let menuTarget;
let selected = [];
export let RELATIONSHIPTEXTS = new Map();

// 
// Menu for changing the target person's gender
// 
export const GENDERMENU = document.getElementById("gender-menu");
makeDraggableBasic(GENDERMENU);

const genderOptions = document.getElementsByName("gender");
for (const option of genderOptions) {
    option.onchange = () => {
        if (menuTarget) {
            menuTarget.gender = option.value;
        }
    }
}
// 
// Context menu options on background
// 
const contextMenu = document.getElementById("context-menu");
const horizontalRule = document.createElement("hr");

const bgAddPersonButton = document.createElement("button");
const bgResetTransforms = document.createElement("button");

bgAddPersonButton.textContent = "Add person";
bgResetTransforms.textContent = "Reset all positions";

const onBackground = [bgAddPersonButton, horizontalRule, bgResetTransforms];

bgAddPersonButton.addEventListener("click", (e) => {
    onMenuClick(e, Actions.addPerson);
});

bgResetTransforms.addEventListener("click", (e) => {
    onMenuClick(e, Actions.resetAllTransforms);
});

// 
// Context menu options on person
// 
const addParentButton = document.createElement("button");
const addSpouceButton = document.createElement("button");
const addChildButton = document.createElement("button");
const editButton = document.createElement("button");
const resetTransformButton = document.createElement("button");
const deleteButton = document.createElement("button");

addParentButton.textContent = "Add parent";
addSpouceButton.textContent = "Add spouce";
addChildButton.textContent = "Add child";
editButton.textContent = "Edit";
resetTransformButton.textContent = "Reset Position";
deleteButton.textContent = "Delete";

const onPerson = [addParentButton, addSpouceButton, addChildButton, editButton, horizontalRule, resetTransformButton, deleteButton];

addParentButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addParent(menuTarget); });
});
addSpouceButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addSpouce(menuTarget); });
});
addChildButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addChild(menuTarget); });
});
editButton.addEventListener("click", (e) => {
    onEditClick(e);
});
resetTransformButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.resetPersonTransform(menuTarget); });
});
deleteButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.hidePerson(menuTarget); });
});

// 
// Contextmenu on point
// 
const resetPointTransformButton = document.createElement("button");

resetPointTransformButton.textContent = "Reset Position of Point";

const onPoint = [bgAddPersonButton, horizontalRule, resetPointTransformButton, bgResetTransforms];

resetPointTransformButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.resetPointTransform(menuTarget); })
})

// 
// Edit person
// 
const editRelationshipSelectParent = document.getElementById("select-parent");
const editRelationshipSelectChild = document.getElementById("select-child");
let relationshipParentID;
let relationshipChildID;
function checkRelationshipType(type) {
    const id = type === "parent"? relationshipParentID : relationshipChildID;
    const isStep = menuTarget.relationships.get(id).text.includes("Step-");
    const currentRelationshipType = isStep? document.getElementById(`step-${type}`) : document.getElementById(`biological-${type}`);
    
    currentRelationshipType.checked = true;
}
editRelationshipSelectParent.onchange = () => {
    relationshipParentID = Number(editRelationshipSelectParent.value);
    checkRelationshipType("parent");
}
editRelationshipSelectChild.onchange = () => {
    relationshipChildID = Number(editRelationshipSelectChild.value);
    checkRelationshipType("child");
}

const parentRelationshipTypeOptions = document.getElementsByName("parent-relationship-type");
for (const option of parentRelationshipTypeOptions) {
    option.onchange = () => { onRelationshipTypeChange(relationshipParentID, option.value) };
}
const childRelationshipTypeOptions = document.getElementsByName("child-relationship-type");
for (const option of childRelationshipTypeOptions) {
    option.onchange = () => { onRelationshipTypeChange(relationshipChildID, option.value) };
}
const editRelationship = document.getElementById("edit-relationship");
const editRelationshipParent = document.getElementById("edit-parent-relationship");
const editRelationshipChild = document.getElementById("edit-child-relationship");

editRelationship.replaceChildren();
editRelationship.parentElement.removeChild(editRelationship);
editRelationship.classList.remove("hidden");

// 
// Functions
// 
function setContextMenu(target) {
    if (target instanceof Person) {
        menuTarget = target;
        contextMenu.replaceChildren(...onPerson);
        return;
    }
    else if (target) {
        menuTarget = target;
        contextMenu.replaceChildren(...onPoint);
        return;
    }
    contextMenu.replaceChildren(...onBackground);
}
function hideContextMenu() {
    contextMenu.replaceChildren();
    contextMenu.className = "hide";
}
function resetEditRelationshipMenu() {
    editRelationshipSelectParent.replaceChildren();
    editRelationshipSelectChild.replaceChildren();
    editRelationship.replaceChildren();
}
function onMenuClick(e, action) {
    e.preventDefault();
    hideContextMenu();

    action();
}
function onEditClick(e) {
    e.preventDefault();
    isEditing = true;
    contextMenu.replaceChildren();
    
    if (menuTarget.parents.length === 0 && menuTarget.children.length === 0) {
        return;
    }
    resetEditRelationshipMenu();
    contextMenu.appendChild(editRelationship);
    if (menuTarget.parents.length > 0) {
        editRelationship.appendChild(editRelationshipParent);
        menuTarget.parents.forEach(parent => {
            const option = document.createElement("option");
            option.value = parent.id;
            option.textContent = (parent.name !== "")? `${parent.name}` : `#${parent.id}`;
            editRelationshipSelectParent.appendChild(option);
        });
        editRelationshipSelectParent.value = editRelationshipSelectParent.options[0].value;
        relationshipParentID = Number(editRelationshipSelectParent.value);
        checkRelationshipType("parent");
    }
    if (menuTarget.children.length > 0) {
        if (menuTarget.parents.length > 0) {
            editRelationship.appendChild(horizontalRule);
        }
        editRelationship.appendChild(editRelationshipChild);
        menuTarget.children.forEach(child => {
            const option = document.createElement("option");
            option.value = child.id;
            option.textContent = (child.name !== "")? `${child.name}` : `#${child.id}`;
            editRelationshipSelectChild.appendChild(option);
        });
        editRelationshipSelectChild.value = editRelationshipSelectChild.options[0].value;
        relationshipChildID = Number(editRelationshipSelectChild.value);
        checkRelationshipType("child");
    }
}
function onRelationshipTypeChange(ID, type) {
    const isTargetTheParent = type.includes("child");
    if (isTargetTheParent) {
        const isStep = type === "step-child";
        Actions.changeRelationshipType(PEOPLE[ID], menuTarget, isStep);
        // Relationship.setStepRelationships(PEOPLE[ID], targetPerson, "Child", isStep);
        // Relationship.setStepRelationships(targetPerson, PEOPLE[ID], "Parent", isStep);
        return;
    }
    const isStep = type === "step-parent";
    Actions.changeRelationshipType(menuTarget, PEOPLE[ID], isStep);
    // Relationship.setStepRelationships(targetPerson, PEOPLE[ID], "Child", isStep);
    // Relationship.setStepRelationships(PEOPLE[ID], targetPerson, "Parent", isStep);
}
function selectPeople(selection) {
    selected.forEach((previouslySelected) => {
        previouslySelected.classList.remove("selected");
    });
    selection.forEach((person) => {
        person.classList.add("selected");
    });
    selected = selection;
    for (const text of RELATIONSHIPTEXTS.values()) {
        text.remove();
    }
    menuTarget = selected[0].person;
    createRelationshipText(menuTarget);
}
function setGenderOption(target) {
    const currentGenderOption = document.getElementById(target.person.gender);
    currentGenderOption.checked = true;
}
function showGenderMenu(selected) {
    GENDERMENU.className = "show";
    const x = selected.offsetLeft + selected.person.transformPos.x + selected.offsetWidth / 2 - GENDERMENU.offsetWidth / 2;
    const y = selected.offsetTop + selected.person.transformPos.y - GENDERMENU.offsetHeight;
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
        if (PEOPLE[id].isHidden) {
            return;
        }

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
function clearSelections() {
    selected.forEach((selection) => {
        selection.classList.remove("selected");
        // console.debug(document.activeElement, selection.firstElementChild);
    });
    selected = [];
    for (const text of RELATIONSHIPTEXTS.values()) {
        text.remove();
    }
    RELATIONSHIPTEXTS.clear();

    GENDERMENU.className = "hidden";
    resetGenderMenuPosition();

    document.activeElement.blur();
}
// 
// Select people who are in focus
// 
document.addEventListener("focusin", (event) => {
    if (!event.target.classList.contains("name")) {
        return;
    }
    const target = event.target.parentElement;
    setGenderOption(target);
    selectPeople([target]);
});
document.addEventListener("focusout", (event) => {
    if (!event.target.classList.contains("name")) {
        return;
    }
    clearSelections();
});

// 
// Controls
// 
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (event.pageX - CLICKEDPOS.x !== 0 && event.pageY - CLICKEDPOS.y !== 0) {
        return;
    }

    let contextTarget = undefined;
    if (event.target.classList.contains("point")) {
        contextTarget = event.target;
    }
    else if (event.target.classList.contains("person")) {
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
        if (event.target === editButton) {
            function clickAfterEditing(e) {
                if (!contextMenu.contains(e.target) && e.target !== editButton) {
                    e.preventDefault();
                    hideContextMenu();
                    isEditing = false;
                    document.removeEventListener("click", clickAfterEditing);
                }
            }
            document.addEventListener("click", clickAfterEditing);
            return;
        }
        if (event.buttons !== 2) {
            hideContextMenu();
        }
    }, {once:true});
});

let isEditing = false;
document.addEventListener("dblclick", (event) => {
    if (isEditing) {
        return;
    }
    
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
        
        showGenderMenu(target.parentElement);
        return;
    }
    Actions.addPerson();
});

document.addEventListener("click", (event) => {
    if (event.target.tagName === "FORM" || event.target.tagName === "INPUT" || event.target.tagName === "LABEL" || isEditing) {
        return;
    }
    event.preventDefault();

    let target = undefined;
    menuTarget = undefined;
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
        selectPeople([target]);
        return;
    }

    clearSelections();
});

// This is to prevent the person's name from losing focus when clicking on a gender option;
document.addEventListener("mousedown", (e) => {
    if (e.target.nodeName !== "LABEL") {
        return;
    }
    switch (e.target.htmlFor) {
        case "male":
        case "neutral":
        case "female":
            e.preventDefault();
            return;
        default:
            return;
    }
});

// 
// Keybinds
// 
document.addEventListener("keyup", (e) => {
    switch (e.key) {
        // Add person
        case "n":
        case "N":
            if (document.activeElement.className === "name") {
                if (GENDERMENU.className === "hidden" || !e.altKey) {
                    return;
                }
                const element = document.getElementById("neutral");
                if (element.checked) {
                    return;
                }
                element.click();
                GENDERMENU.className = "hidden";
                resetGenderMenuPosition();
                return;
            }
            if (selected.length === 0) {
                Actions.addPerson();
                return;
            }
            selected.forEach((selection) => {
                Actions.addPerson(selection.person);
            });
            return;
        // Open gender menu
        case "g":
        case "G":
            if (!e.ctrlKey || document.activeElement.className !== "name") {
                return;
            }
            if (GENDERMENU.className === "hidden") {
                showGenderMenu(document.activeElement.parentElement);
                return;
            }
            else {
                GENDERMENU.className = "hidden";
                resetGenderMenuPosition();
                return;
            }
        // Select gender
        case "m":
        case "M": {
            if (GENDERMENU.className === "hidden" || !e.altKey) {
                return;
            }
            const element = document.getElementById("male");
            if (element.checked) {
                return;
            }
            element.click();
            GENDERMENU.className = "hidden";
            resetGenderMenuPosition();
            return;
        }
        case "f":
        case "F": {
            if (GENDERMENU.className === "hidden" || !e.altKey) {
                return;
            }
            const element = document.getElementById("female");
            if (element.checked) {
                return;
            }
            element.click();
            GENDERMENU.className = "hidden";
            resetGenderMenuPosition();
            return;
        }
        // Confirm name
        case "Enter":
            if (e.shiftKey || document.activeElement.className !== "name") {
                return;
            }
            clearSelections();
            e.preventDefault();
            return;
        // Undo-redo
        case "z":
        case "Z":
            if (!e.ctrlKey || document.activeElement.className === "name") {
                return;
            }
            Actions.undo();
            return;
        case "y":
        case "Y":
            if (!e.ctrlKey || document.activeElement.className === "name") {
                return;
            }
            Actions.redo();
            return;
        default:
            return;
    }
});
// 
// Remove default behaviour
// 
document.addEventListener("keydown", (e) => {
    switch(e.key) {
        // Don't add a new line on enter when inputting the name
        case "Enter":
            if (e.shiftKey || document.activeElement.className !== "name") {
                return;
            }
            e.preventDefault();
            return;
        // Don't find in page when name is in focus
        case "g":
        case "G":
            if (!e.ctrlKey || document.activeElement.className !== "name") {
                return;
            }
            e.preventDefault();
            return;
        // Stop behaviour when changing gender
        case "m":
        case "M":
        case "n":
        case "N":
        case "f":
        case "F":
            if (!e.altKey || document.activeElement.className !== "name" || GENDERMENU.className === "hidden") {
                return;
            }
            e.preventDefault();
            return;
        default:
            return;
    }
});