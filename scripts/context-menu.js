import Family from "./family.js";
import { clickedPos } from "./pan-zoom-and-drag.js";
import Person from "./person.js";

const contextMenu = document.getElementById("context-menu");

const bgAddPerson = document.createElement("button");
bgAddPerson.textContent = "Add person";
bgAddPerson.addEventListener("click", (e) => {
    e.preventDefault();
    
    Person.createPerson();
    hideContextMenu();
});
const onBackground = [bgAddPerson];

const addParentButton = document.createElement("button");
const addSpouceButton = document.createElement("button");
const addChildButton = document.createElement("button");

addParentButton.textContent = "Add parent";
addSpouceButton.textContent = "Add spouce";
addChildButton.textContent = "Add child";

const onPerson = [addParentButton, addSpouceButton, addChildButton];

let targetPerson;
function addParent(e) {
    e.preventDefault();
    hideContextMenu();

    // targetPerson has parents and is single
    if (targetPerson.div.parentElement.className === "children") {
        for (let i = 0, length = targetPerson.groups.length; i < length; i++) {
            if (targetPerson.groups[i].parents.length > 1) {
                continue;
            }
            targetPerson.groups[i].addParent(new Person());
            return;
        }
        targetPerson.family.addGroup([new Person()], targetPerson);
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
    Family.createFamily([new Person()], [targetPerson.family], targetPerson.family, subFamilyMap);
}
function addSpouce(e) {
    e.preventDefault();
    hideContextMenu();

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
function addChild(e) {
    e.preventDefault();
    hideContextMenu();
}

addParentButton.addEventListener("click", addParent);
addSpouceButton.addEventListener("click", addSpouce);
addChildButton.addEventListener("click", addChild);

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
    contextMenu.className = "hide"
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