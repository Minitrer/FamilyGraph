import Person from "./person.js";
import { PEOPLE } from "./person.js";
import { CLICKED_POS, DRAGGING_ELEMENTS } from "./pan-zoom-and-drag.js";
import makeDraggableBasic from "./pan-zoom-and-drag.js";
import * as Actions from "./actions.js";
import * as SaveLoad from "./save-and-load.js";

let menuTarget;
export let SELECTED = [];
export let RELATIONSHIPTEXTS = new Map();

// 
// Icons
// 
const trashIcon = document.createElement("i");
trashIcon.className = "material-symbols-rounded";
trashIcon.textContent = "delete";
const addIcon = document.createElement("i");
addIcon.className = "material-symbols-rounded";
addIcon.textContent = "add";
const editIcon = document.createElement("i");
editIcon.className = "material-symbols-rounded";
editIcon.textContent = "edit";
const transformIcon = document.createElement("i");
transformIcon.className = "material-symbols-rounded";
transformIcon.textContent = "transform";
const focusIcon = document.createElement("i");
focusIcon.className = "material-symbols-rounded";
focusIcon.textContent = "crop_free";
const centerPointIcon = document.createElement("i");
centerPointIcon.className = "material-symbols-rounded";
centerPointIcon.textContent = "point_scan";
const undoIcon = document.createElement("i");
undoIcon.className = "material-symbols-rounded";
undoIcon.textContent = "undo";
const redoIcon = document.createElement("i");
redoIcon.className = "material-symbols-rounded";
redoIcon.textContent = "redo";

// 
// Menu for changing the target person's gender
// 
const genderMenu = document.getElementById("gender-menu");
makeDraggableBasic(genderMenu);

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
const bgRecenter = document.createElement("button");
const undoButton = document.createElement("button");
const redoButton = document.createElement("button");

bgAddPersonButton.textContent = "Add person";
bgResetTransforms.textContent = "Reset all positions";
bgRecenter.textContent = "Recenter";
undoButton.textContent = "Undo";
redoButton.textContent = "Redo";

bgAddPersonButton.prepend(addIcon);
bgResetTransforms.prepend(transformIcon);
bgRecenter.prepend(focusIcon);
undoButton.prepend(undoIcon);
redoButton.prepend(redoIcon);

const onBackground = [bgAddPersonButton, horizontalRule, bgResetTransforms, bgRecenter, horizontalRule.cloneNode(true), undoButton, redoButton];

bgAddPersonButton.addEventListener("click", (e) => {
    onMenuClick(e, Actions.addPerson);
});
bgResetTransforms.addEventListener("click", (e) => {
    onMenuClick(e, Actions.resetAllTransforms);
});
bgRecenter.addEventListener("click", (e) => {
    onMenuClick(e, Actions.recenter);
});
undoButton.addEventListener("click", (e) => {
    onMenuClick(e, Actions.undo);
});
redoButton.addEventListener("click", (e) => {
    onMenuClick(e, Actions.redo);
});

// 
// Context menu options on person
// 
const addParentButton = document.createElement("button");
const addSpouceButton = document.createElement("button");
const addChildButton = document.createElement("button");
const addSiblingButton = document.createElement("button");
const editButton = document.createElement("button");
const resetTransformButton = document.createElement("button");
const deleteButton = document.createElement("button");

addParentButton.textContent = "Add parent";
addSpouceButton.textContent = "Add spouce";
addChildButton.textContent = "Add child";
addSiblingButton.textContent = "Add sibling";
editButton.textContent = "Edit";
resetTransformButton.textContent = "Reset position";
deleteButton.textContent = "Delete";

addParentButton.prepend(addIcon.cloneNode(true));
addSpouceButton.prepend(addIcon.cloneNode(true));
addChildButton.prepend(addIcon.cloneNode(true));
addSiblingButton.prepend(addIcon.cloneNode(true));
editButton.prepend(editIcon);
resetTransformButton.prepend(transformIcon.cloneNode(true));
deleteButton.prepend(trashIcon);

const onPerson = [addParentButton, addSpouceButton, addChildButton, addSiblingButton, editButton, horizontalRule, resetTransformButton, deleteButton];

addParentButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addParent(menuTarget); });
});
addSpouceButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addSpouce(menuTarget); });
});
addChildButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addChild(menuTarget); });
});
addSiblingButton.addEventListener("click", (e) => {
    onMenuClick(e, () => { Actions.addSibling(menuTarget); });
});
editButton.addEventListener("click", (e) => {
    e.preventDefault();
    onEdit(menuTarget);
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

resetPointTransformButton.textContent = "Reset position of Point";

resetPointTransformButton.prepend(centerPointIcon);

const onPoint = [resetPointTransformButton, bgResetTransforms];

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
    const isStep = personEditing.relationships.get(id).text.includes("Step-");
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
export function hideContextMenu() {
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

let personEditing;
function onEdit(targetPerson) {
    isEditing = true;
    personEditing = targetPerson;

    function clickAfterEditing(e) {
        if (!contextMenu.contains(e.target) && e.target !== editButton) {
            e.preventDefault();
            hideContextMenu();
            isEditing = false;
            document.removeEventListener("click", clickAfterEditing);
        }
    }
    document.addEventListener("click", clickAfterEditing);

    contextMenu.replaceChildren();
    
    const visibleParents = targetPerson.parents.filter((parent) => !parent.isHidden);
    const visibleChildren = targetPerson.children.filter((child) => !child.isHidden);
    if (visibleParents.length === 0 && visibleChildren.length === 0) {
        return;
    }

    selectPeople([personEditing.div]);

    resetEditRelationshipMenu();
    contextMenu.appendChild(editRelationship);
    if (visibleParents.length > 0) {
        editRelationship.appendChild(editRelationshipParent);
        visibleParents.forEach(parent => {
            const option = document.createElement("option");
            option.value = parent.id;
            option.textContent = (parent.name !== "")? `${parent.name}` : `#${parent.id}`;
            editRelationshipSelectParent.appendChild(option);
        });
        editRelationshipSelectParent.value = editRelationshipSelectParent.options[0].value;
        relationshipParentID = Number(editRelationshipSelectParent.value);
        checkRelationshipType("parent");
    }
    if (visibleChildren.length > 0) {
        if (visibleParents.length > 0) {
            editRelationship.appendChild(horizontalRule);
        }
        editRelationship.appendChild(editRelationshipChild);
        visibleChildren.forEach(child => {
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
        Actions.changeRelationshipType(PEOPLE[ID], personEditing, isStep);
        return;
    }
    const isStep = type === "step-parent";
    Actions.changeRelationshipType(personEditing, PEOPLE[ID], isStep);
}
function selectPeople(selection) {
    SELECTED.forEach((previouslySelected) => {
        previouslySelected.classList.remove("selected");
    });
    selection.forEach((person) => {
        person.classList.add("selected");
    });
    SELECTED = selection;
    for (const text of RELATIONSHIPTEXTS.values()) {
        text.remove();
    }
    menuTarget = SELECTED[0].person;
    createRelationshipTexts(menuTarget);
}
function setGenderOption(target) {
    const currentGenderOption = document.getElementById(target.person.gender);
    currentGenderOption.checked = true;
}
function showGenderMenu(selected) {
    genderMenu.className = "show";
    const x = selected.offsetLeft + selected.person.transformPos.x + selected.offsetWidth / 2 - genderMenu.offsetWidth / 2;
    const y = selected.offsetTop + selected.person.transformPos.y - genderMenu.offsetHeight;
    genderMenu.style.left = `${x}px`;
    genderMenu.style.top = `${y}px`;
}
function resetGenderMenuPosition() {
    genderMenu.style.setProperty("--pos-x", 0);
    genderMenu.style.setProperty("--pos-y", 0);
    genderMenu.transformPos.x = 0;
    genderMenu.transformPos.y = 0;
}

export function updateRelationshipTextPos(text, id) {
    const x = PEOPLE[id].div.offsetLeft + PEOPLE[id].transformPos.x + PEOPLE[id].div.offsetWidth / 2 - text.offsetWidth / 2;
    const y = PEOPLE[id].div.offsetTop + PEOPLE[id].transformPos.y + PEOPLE[id].div.offsetHeight;
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;

    text.style.setProperty("--pos-x", 0);
    text.style.setProperty("--pos-y", 0);
}
export function updateRelationshipText(text, id, relationship) {
    text.textContent = relationship.text.at(0).toUpperCase().concat(relationship.text.slice(1));
    updateRelationshipTextPos(text, id);
}
function createRelationshipTexts(person) {
    const workspace = document.getElementById("workspace");
    for (const [id, relationship] of person.relationships) {
        if (PEOPLE[id].isHidden) {
            continue;
        }

        if (RELATIONSHIPTEXTS.has(PEOPLE[id])) {
            const text = RELATIONSHIPTEXTS.get(PEOPLE[id]);
            if (!text.parentElement) {
                workspace.appendChild(text);
            }
            updateRelationshipText(text, id, relationship);
            continue;
        }
        const text = document.createElement("h2");
        RELATIONSHIPTEXTS.set(PEOPLE[id], text);
        text.classList.add("relationship");

        workspace.appendChild(text);
        
        updateRelationshipText(text, id, relationship);

        text.style.transform = "translate(calc(var(--pos-x) * 1px), calc(var(--pos-y) * 1px))";
        makeDraggableBasic(text);
    }
}
export function clearSelections() {
    SELECTED.forEach((selection) => {
        selection.classList.remove("selected");
    });
    SELECTED = [];
    for (const text of RELATIONSHIPTEXTS.values()) {
        text.remove();
    }

    genderMenu.className = "hidden";
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
    showGenderMenu(target);
    selectPeople([target]);
});
document.addEventListener("focusout", (event) => {
    if (!event.target.classList.contains("name")) {
        return;
    }
    event.target.contentEditable = false;
    genderMenu.className = "hidden";
    resetGenderMenuPosition();
    // clearSelections();
});

// 
// Controls
// 
document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (Math.abs(event.pageX - CLICKED_POS.x) > 1 || Math.abs(event.pageY - CLICKED_POS.y) > 1) {
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
        if ((event.buttons !== 2 || event.target !== editButton) && !isEditing) {
            hideContextMenu();
        }
    }, {once:true});
});

let isEditing = false;
document.addEventListener("dblclick", (event) => {
    if (isEditing || (event.target.tagName === "I" && event.target.parentElement.tagName === "LABEL") || event.target.tagName === "LABEL") {
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
        target.contentEditable = true;
        target.focus();
        
        showGenderMenu(target.parentElement);
        return;
    }
    Actions.addPerson();
});

document.addEventListener("click", (event) => {
    if (event.target.tagName === "FIELDSET" || event.target.tagName === "INPUT" || event.target.tagName === "LABEL" || event.target.tagName === "BUTTON" ||
        (event.target.tagName === "I" && event.target.parentElement.tagName === "LABEL") || isEditing) {
            return;
        }
        
        let target = undefined;
        menuTarget = undefined;
        if (event.target.classList.contains("person")) {
            target = event.target;
        }
        else if (event.target.classList.contains("name")) {
            target = event.target.parentElement;
        }
        
        if (target) {
            if (Math.abs(event.pageX - CLICKED_POS.x) > 1 || Math.abs(event.pageY - CLICKED_POS.y) > 1) {
                return;
        }
        resetGenderMenuPosition();
        selectPeople([target]);
        return;
    }

    clearSelections();
});

// This is to prevent the person's name from losing focus when clicking on a gender option;
document.addEventListener("pointerdown", (e) => {
    if (e.target.tagName !== "LABEL"  && e.target.tagName !== "I") {
        return;
    }
    const label = e.target.tagName === "I"? e.target.parentElement : e.target;
    switch (label.htmlFor) {
        case "male":
        case "agender":
        case "female":
            e.preventDefault();
            return;
        default:
            return;
    }
});
// 
// Trash can
// 
{
    const trashCan = document.getElementById("trash-can");
    trashCan.addEventListener("pointerenter", (e) => {
        e.preventDefault();

        const people = DRAGGING_ELEMENTS.filter((element) => element instanceof Person);
        if (people.length === 0) {
            return;
        }
        trashCan.style.color = "rgba(255, 0 ,0, 0.8)";
    
        function deletePeople() {
            people.forEach((element) => {
                Actions.hidePerson(element);
            });
            
            trashCan.style.color = "rgba(255, 255 ,255, 0.8)";
            document.removeEventListener("pointerleave", onLeave);
        }
        function onLeave() {
            trashCan.style.color = "rgba(255, 255 ,255, 0.8)";
            document.removeEventListener("pointerup", deletePeople);
        }
    
        document.addEventListener("pointerup", deletePeople, {once: true});
    
        trashCan.addEventListener("pointerleave", onLeave, {once: true});
    });
}

// 
// Keybinds
// 
document.addEventListener("keyup", (e) => {
    switch (e.key) {
        // Add person
        case "n":
        case "N":
            if (document.activeElement.className === "name") {
                // Choose agender
                if (genderMenu.className === "hidden" || !e.altKey) {
                    return;
                }
                const element = document.getElementById("agender");
                if (element.checked) {
                    return;
                }
                element.click();
                genderMenu.className = "hidden";
                resetGenderMenuPosition();
                return;
            }
            if (SELECTED.length === 0) {
                Actions.addPerson();
                return;
            }
            SELECTED.forEach((selection) => {
                Actions.addPerson(selection.person);
            });
            return;
        // Add parent
        case "p":
        case "P":
            if ((document.activeElement.className === "name" && !e.altKey) || SELECTED.length === 0) {
                return;
            }
            SELECTED.forEach((selection) => {
                Actions.addParent(selection.person);
            });
            return;
        case "s":
        case "S":
            // Save
            if (e.ctrlKey && PEOPLE.length > 0) {
                SaveLoad.save();
                return;
            }
            // Add spouce
            if ((document.activeElement.className === "name" && !e.altKey) || SELECTED.length === 0) {
                return;
            }
            SELECTED.forEach((selection) => {
                Actions.addSpouce(selection.person);
            });
            return;            
        // Add child
        case "c":
        case "C":
            if ((document.activeElement.className === "name" && !e.altKey) || SELECTED.length === 0) {
                return;
            }
            SELECTED.forEach((selection) => {
                Actions.addChild(selection.person);
            });
            return;
        // Add sibling
        case "a":
        case "A":
            if ((document.activeElement.className === "name" && !e.altKey) || SELECTED.length === 0) {
                return;
            }
            SELECTED.forEach((selection) => {
                Actions.addSibling(selection.person);
            });
            return;
        // Delete person
        case "Backspace":
        case "Delete":
            if ((document.activeElement.className === "name" && !e.altKey) || SELECTED.length === 0) {
                return;
            }
            // DEBUG:
            // if (e.ctrlKey) {
            //     SELECTED.forEach((selection) => {
            //         selection.person.delete();
            //     });
            //     hideContextMenu();
            //     clearSelections();
            //     return;
            // }
            SELECTED.forEach((selection) => {
                Actions.hidePerson(selection.person);
            });
            hideContextMenu();
            clearSelections();
            return;
        // Edit
        case "e":
        case "E":
            if ((document.activeElement.className === "name" && !e.altKey) || SELECTED.length === 0) {
                return;
            }
            const x = SELECTED[0].offsetLeft + SELECTED[0].offsetWidth;
            const y = SELECTED[0].offsetTop;
            contextMenu.style.left = `${x}px`;
            contextMenu.style.top = `${y}px`;
            contextMenu.className = "show";

            onEdit(SELECTED[0].person);
            return;
        // Open gender menu
        case "g":
        case "G":
            if (!e.ctrlKey || document.activeElement.className !== "name") {
                return;
            }
            if (genderMenu.className === "hidden") {
                showGenderMenu(document.activeElement.parentElement);
                return;
            }
            else {
                genderMenu.className = "hidden";
                resetGenderMenuPosition();
                return;
            }
        // Select gender   
        case "m":
        case "M": {
            if (genderMenu.className === "hidden" || !e.altKey) {
                return;
            }
            const element = document.getElementById("male");
            if (element.checked) {
                return;
            }
            element.click();
            genderMenu.className = "hidden";
            resetGenderMenuPosition();
            return;
        }
        case "f":
        case "F": {
            if (genderMenu.className === "hidden" || !e.altKey) {
                return;
            }
            const element = document.getElementById("female");
            if (element.checked) {
                return;
            }
            element.click();
            genderMenu.className = "hidden";
            resetGenderMenuPosition();
            return;
        }
        // Open file
        case "o":
        case "O":
            if (!e.ctrlKey) {
                return;
            }
            SaveLoad.open();
            return;
        case "Enter":
            if (e.shiftKey || document.activeElement.className !== "name") {
                if (document.activeElement.tagName !== "DIV") {
                    // Focus person
                    if (SELECTED.length === 0) {
                        return;
                    }
                    SELECTED[0].firstElementChild.contentEditable = true;
                    SELECTED[0].firstElementChild.focus();
                    return;
                }
                // Toggle relationship
                const selectedButtons = document.activeElement.firstElementChild;
                if (!selectedButtons || (selectedButtons.id !== "parent-relationship-buttons" && selectedButtons.id !== "child-relationship-buttons")) {
                    return;
                }
                const inputs = selectedButtons.getElementsByTagName("input");
                const uncheckedOption = inputs.item(0).checked? inputs.item(1) : inputs.item(0);
                uncheckedOption.click();

                e.preventDefault();
                return;
            }
            // Confirm name
            if (!e.shiftKey && document.activeElement.className === "name") {
                document.activeElement.blur();
                e.preventDefault();
            }
            return;
        // Hide menu/unselect
        case "Escape":
            if (contextMenu.className === "show") {
                hideContextMenu();
                e.preventDefault();
                return;
            }
            if (SELECTED.length !== 0) {
                clearSelections();
                e.preventDefault();
                return;
            }
            return;
        // Navigation
        function NavigatePeople(method) {
            if (SELECTED.length === 0) {
                selectPeople([PEOPLE.find((person) => !person.isHidden).div]);
                return;
            }
            if (SELECTED.length > 1) {
                return;
            }
            const person = method(SELECTED[0]);
            if (person) {
                selectPeople([person]);
            }
        }
        case "ArrowUp":
            if ((document.activeElement.className === "name" && !e.altKey) || PEOPLE.length === 0 || !document.querySelector(".person")) {
                return;
            }
            function findFirstVisibleParent(selected) {
                const firstParent = selected.person.parents.find((parent) => !parent.isHidden);
                if (firstParent) {
                    return firstParent.div;
                }
                // Search first outer family or second outer family
                let divToSearch = selected.parentElement.classList.contains("children")? selected.parentElement.parentElement : selected.parentElement.parentElement.parentElement.parentElement;
                while (divToSearch.id !== "workspace") {
                    const firstParent = divToSearch.firstElementChild.firstElementChild;
                    if (firstParent) {
                        return firstParent;
                    }
                    divToSearch = divToSearch.parentElement.parentElement;
                }
                function getDeepestPerson(from, depth=0) {
                    if (from instanceof HTMLCollection) {
                        let deepest = getDeepestPerson(from.item(0), depth);
                        for (let i = 1, length = from.length; i < length; i++) {
                            const get = getDeepestPerson(from.item(i), depth);
                            if (get.depth > deepest.depth) {
                                deepest = get;
                            }
                        }
                        return deepest;
                    }
                    if (from.classList.contains("family")) {
                        switch(from.lastElementChild.childElementCount) {
                            case 0:
                                return { div: from.firstElementChild.firstElementChild, depth: depth, };
                            case 1:
                                return getDeepestPerson(from.lastElementChild.firstElementChild, depth + 1);
                            default:
                                return getDeepestPerson(from.lastElementChild.children, depth + 1);
                        }
                    }
                    return { div: from, depth: depth };
                }
                return getDeepestPerson(document.getElementById("graph").firstElementChild).div;
            }
            return NavigatePeople(findFirstVisibleParent);
        case "ArrowDown":
            if ((document.activeElement.className === "name" && !e.altKey) || PEOPLE.length === 0 || !document.querySelector(".person")) {
                return;
            }
            function findFirstVisibleChild(selected) {
                const firstChild = selected.person.children.find((child) => !child.isHidden);
                if (firstChild) {
                    return firstChild.div;
                }
                const nestedCount = (() => {
                    let i = -1;
                    let currentFamily = selected.parentElement.parentElement;
                    while (currentFamily.id.includes("family") ) {
                        i++;
                        currentFamily = currentFamily.parentElement.parentElement;
                    }
                    return i;
                }) ();
                const graph = document.getElementById("graph");
                let person;
                // If a parent, look for first child or parent in a family nested 1 more than current family
                if (selected.parentElement.classList.contains("parents")) {
                    person = graph.querySelector(`:scope>${"div>.children>".repeat(nestedCount + 1)}.person, :scope>${"div>.children>".repeat(nestedCount + 1)}div>div>.person`);
                }
                else {
                    // Look for first child in a family nested 2 more than current family
                    person = graph.querySelector(`:scope>${"div>.children>".repeat(nestedCount + 2)}.person`);
                }
                if (person) {
                    return person;
                }
                return graph.querySelector(":scope .person");
            }
            return NavigatePeople(findFirstVisibleChild);

        
        function getDivWithNestCount(from, nestedCount) {
            return from.querySelector(`:scope>${".children>.family>".repeat(nestedCount - 1)}.children>div`);
        }
        case "ArrowLeft": 
            if ((document.activeElement.className === "name" && !e.altKey) || PEOPLE.length === 0 || !document.querySelector(".person")) {
                return;
            }
            function findPreviousPerson(selected) {
                function getPersonDiv(div) {
                    if (div.person) {
                        return div;
                    }
                    return div.firstElementChild.lastElementChild;
                }

                if (selected.previousElementSibling) {
                    return getPersonDiv(selected.previousElementSibling);
                }
                let divToCheck = selected.parentElement.parentElement;
                const inParents = selected.parentElement.classList.contains("parents");
                let nestedCount = 0;
                if (inParents) {
                    if (divToCheck.previousElementSibling) {
                        return getPersonDiv(divToCheck.previousElementSibling);
                    }
                    divToCheck = divToCheck.parentElement.parentElement;
                }

                function getPreviousFamilyDiv(from) {
                    if (!from.previousElementSibling) {
                        return undefined;
                    }
                    if (from.previousElementSibling.classList.contains("family")) {
                        return from.previousElementSibling;
                    }
                    return getPreviousFamilyDiv(from.previousElementSibling);
                }

                while (divToCheck.classList.contains("family")) {
                    nestedCount++;

                    let previousFamilyDiv = getPreviousFamilyDiv(divToCheck);
                    while (previousFamilyDiv) {
                        const groupDiv = getDivWithNestCount(previousFamilyDiv, nestedCount);
                        if (groupDiv) {
                            return getPersonDiv(groupDiv);
                        }
                        previousFamilyDiv = getPreviousFamilyDiv(previousFamilyDiv);
                    }

                    divToCheck = divToCheck.parentElement.parentElement;
                }
                if (nestedCount < 1) {
                    return selected.parentElement.childElementCount > 1? selected.parentElement.lastElementChild : null;
                }
                // Person of same generation not found, loop to the right-most person of same generation
                const firstFamily = document.getElementById("graph").firstElementChild;
                const generation = firstFamily.querySelectorAll(`:scope>${".children>.family>".repeat(nestedCount - 1)}.children>div`);
                const div = generation[generation.length - 1];
                if (div) {
                    return getPersonDiv(div);
                }
                return null;
            }
            return NavigatePeople(findPreviousPerson);
        case "ArrowRight": {
            if ((document.activeElement.className === "name" && !e.altKey) || PEOPLE.length === 0 || !document.querySelector(".person")) {
                return;
            }
            function findNextPerson(selected) {
                function getPersonDiv(div) {
                    if (div.person) {
                        return div;
                    }
                    return div.firstElementChild.firstElementChild;
                }

                if (selected.nextElementSibling) {
                    return getPersonDiv(selected.nextElementSibling);
                }
                let divToCheck = selected.parentElement.parentElement;
                const inParents = selected.parentElement.classList.contains("parents");
                let nestedCount = 0;
                if (inParents) {
                    if (divToCheck.nextElementSibling) {
                        return getPersonDiv(divToCheck.nextElementSibling);
                    }
                    divToCheck = divToCheck.parentElement.parentElement;
                }

                while (divToCheck.classList.contains("family")) {
                    nestedCount++;

                    let nextFamilyDiv = divToCheck.querySelector(`:scope ~ .family`);
                    while (nextFamilyDiv) {
                        const groupDiv = getDivWithNestCount(nextFamilyDiv, nestedCount);
                        if (groupDiv) {
                            return getPersonDiv(groupDiv);
                        }
                        nextFamilyDiv = nextFamilyDiv.querySelector(`:scope ~ .family`);
                    }

                    divToCheck = divToCheck.parentElement.parentElement;
                }
                if (nestedCount < 1) {
                    return selected.parentElement.childElementCount > 1? selected.parentElement.firstElementChild : null;
                }
                // Person of same generation not found, loop to the left-most person of same generation
                const firstFamily = document.getElementById("graph").firstElementChild;
                const div = getDivWithNestCount(firstFamily, nestedCount);
                if (div) {
                    return getPersonDiv(div);
                }
                return null;
            }
            return NavigatePeople(findNextPerson);
        }
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
        // Don't show history/edit page when selected a person
        case "s":
        case "S":
        // Don't let browser save file
            if (e.ctrlKey) {
                e.preventDefault();
                return;
            }
            // Fall-through
        case "e":
        case "E":
            if (!e.altKey || SELECTED.length === 0) {
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
            if (!e.altKey || document.activeElement.className !== "name" || genderMenu.className === "hidden") {
                return;
            }
            e.preventDefault();
            return;
        // Don't let browser open files
        case "o":
        case "O":
            if (e.ctrlKey) {
                e.preventDefault();
            }
            return;
        default:
            return;
    }
});

// Hack to fix a bug with chrome where gender options won't click the input unless double-clicked when a part of the person's name is selected
{
    let isChrome = navigator.userAgent.includes("Chrome");
    if (isChrome) {
        document.addEventListener("DOMContentLoaded", () => {
            const genderMenuButtons = document.getElementById("gender-menu-buttons");
            const labels = genderMenuButtons.querySelectorAll("label");
            const icons = genderMenuButtons.querySelectorAll("i");

            labels.forEach((label) => {
                const input = document.getElementById(label.htmlFor);
                label.addEventListener("click", (e) => {
                    input.click();
                    e.stopPropagation();
                    e.preventDefault();
                });
            });
            icons.forEach((icon) => {
                const input = document.getElementById(icon.parentElement.htmlFor);
                icon.addEventListener("click", (e) => {
                    input.click();
                    e.stopPropagation();
                    e.preventDefault();
                });
            });
        });
    }
}