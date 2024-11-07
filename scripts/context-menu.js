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

const addParent = document.createElement("button");
const addSpouce = document.createElement("button");
const addChild = document.createElement("button");

addParent.textContent = "Add parent";
addSpouce.textContent = "Add spouce";
addChild.textContent = "Add child";

const onPerson = [addParent, addSpouce, addChild];

function targetPerson(person) {
    function addParentAction(e) {
        e.preventDefault();
        hideContextMenu();

        // person has parents and is single
        if (person.div.parentElement.className === "children") {
            for (let i = 0, length = person.groups.length; i < length; i++) {
                if (person.groups[i].parents.length > 1) {
                    continue;
                }
                person.groups[i].addParent(new Person());
                return;
            }
            person.family.addGroup([new Person()], person);
            return;
        }
        // person is in a family (either married or has children or both)
        for (let i = 0, length = person.groups.length; i < length; i++) {
            if (person.groups[i].children.includes(person.family) && person.groups[i].parents.length < 2) {
                person.groups[i].addParent(new Person());
                return;
            }
        }
        // No parent is single
        if (person.parents.length > 0) {
            person.parents[0].family.addGroup([new Person()], [person]);
            return;
        }
        // Find larger family in spouses
        for (let i = 0, length = person.spouses.length; i < length; i++) {
            if (person.spouses[i].parents.length > 0) {
                person.spouses[i].parents.family.addGroup([new Person()], person);
                return;
            }
        }
        // person is an orphan single parent
        Family.createFamily([new Person()], [person.family], person.family, person);

        addSpouce.removeEventListener("click", addSpouceAction);
    }
    function addSpouceAction(e) {
        e.preventDefault();
        hideContextMenu();

        if (person.div.parentElement.className === "parents") {
            for (let i = 0, length = person.groups.length; i < length; i++) {
                if (person.groups[i].parents.includes(person)) {
                    person.groups[i].addParent(new Person());
                    return;
                }
            }
            console.error("addSpouce action failed, person somehow in parent div without being in a group as a parent");
            return;
        }
        Family.createFamily([person, new Person()], undefined, person, person);

        addParent.removeEventListener("click", addParentAction);
        addChild.removeEventListener("click", addChildAction);
    }
    function addChildAction(e) {
        e.preventDefault();
        hideContextMenu();

        addSpouce.removeEventListener("click", addSpouceAction);
        addParent.removeEventListener("click", addParentAction);
    }

    addParent.addEventListener("click", addParentAction, {once:true});
    addSpouce.addEventListener("click", addSpouceAction, {once:true});
    addChild.addEventListener("click", addChildAction, {once:true});
}

function setContextMenu(target) {
    if (target) {
        targetPerson(target);
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