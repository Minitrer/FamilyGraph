import Family from "./family.js";
import { clickedPos } from "./pan-zoom-and-drag.js";
import Person from "./person.js";

const contextMenu = document.getElementById("context-menu");
const horizontalRule = document.createElement("hr");

const bgAddPersonButton = document.createElement("button");
const bgResetTransforms = document.createElement("button");

bgAddPersonButton.textContent = "Add person";
bgResetTransforms.textContent = "Reset all positions";

const onBackground = [bgAddPersonButton, horizontalRule, bgResetTransforms];

bgAddPersonButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideContextMenu();
    
    Person.createPerson();
});

bgResetTransforms.addEventListener("click", (e) => {
    e.preventDefault();
    hideContextMenu();

    Person.resetAllTransforms();
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
function addParent() {
    // targetPerson has parents and is single
    if (targetPerson.div.parentElement.className === "children") {
        for (let i = 0, length = targetPerson.groups.length; i < length; i++) {
            if (targetPerson.groups[i].parents.length > 1) {
                continue;
            }
            targetPerson.groups[i].addParent(new Person());
            return;
        }
        targetPerson.family.addGroup([new Person()], [targetPerson]);
        return;
    }
    // targetPerson is in a family (either married or has children or both)
    for (let i = 0, length = targetPerson.groups.length; i < length; i++) {
        if (targetPerson.groups[i].children.includes(targetPerson.family) && targetPerson.groups[i].parents.length < 2) {
            targetPerson.groups[i].addParent(new Person());
            return;
        }
    }

    const subFamilyMap = {};
    subFamilyMap[targetPerson.family.id] = targetPerson;

    // No parent is single
    if (targetPerson.parents.length > 0) {
        targetPerson.parents[0].family.addGroup([new Person()], [targetPerson.family], subFamilyMap);
        return;
    }
    // Find larger family in spouses
    for (let i = 0, length = targetPerson.spouses.length; i < length; i++) {
        if (targetPerson.spouses[i].parents.length > 0) {
            targetPerson.spouses[i].parents[0].family.addGroup([new Person()], [targetPerson.family], subFamilyMap);
            return;
        }
    }
    // targetPerson is an orphan single parent
    // Check if targetPerson is oldest generation
    if (targetPerson.family.div.parentElement.id === "graph")
    {
        Family.createFamily([new Person()], [targetPerson.family], targetPerson.family, subFamilyMap);
        return;
    }
    // Find larger family in other parents
    for (let i = 0, length = targetPerson.family.groups.length; i < length; i++) {
        if (targetPerson.family.groups[i].parents.includes(targetPerson)) {
            continue;
        }
        for (let j = 0, lengthJ = targetPerson.family.groups[i].parents.length; j < lengthJ; j++) {
            if (targetPerson.family.groups[i].parents[j].parents.length > 0) {
                targetPerson.family.groups[i].parents[j].parents[0].family.addGroup([new Person()], [targetPerson.family], subFamilyMap);
                return;
            }
        }
    }
}
function addSpouce() {
    if (targetPerson.div.parentElement.className === "parents") {
        for (let i = 0, length = targetPerson.groups.length; i < length; i++) {
            if (targetPerson.groups[i].parents.includes(targetPerson)) {
                targetPerson.groups[i].addParent(new Person());
                return;
            }
        }
        console.error("addSpouce action failed, targetPerson somehow in parent div without being in a group as a parent");
        return;
    }
    Family.createFamily([targetPerson, new Person()], undefined, targetPerson);
}
function addChild() {
    if (targetPerson.div.parentElement.className === "parents") {
        for (let i = 0, length = targetPerson.groups.length; i < length; i++) {
            if (targetPerson.groups[i].parents.includes(targetPerson)) {
                targetPerson.groups[i].addChild(new Person());
                return;
            }
        }
        console.error("addChild action failed, targetPerson somehow in parent div without being in a group as a parent");
        return;
    }
    Family.createFamily([targetPerson], [new Person()], targetPerson);
}

addParentButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideContextMenu();

    addParent()
});
addSpouceButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideContextMenu();
    
    addSpouce()
});
addChildButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideContextMenu();
    
    addChild()
});
resetTransformButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideContextMenu();
    
    targetPerson.resetTransform();
});
deleteButton.addEventListener("click", (e) => {
    e.preventDefault();
    hideContextMenu();

    targetPerson.delete();
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

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (event.pageX - clickedPos.x !== 0 && event.pageY - clickedPos.y !== 0) {
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
});