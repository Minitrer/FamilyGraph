import { clickedPos } from "./pan-zoom-and-drag.js";
import Person from "./person.js";

const contextMenu = document.getElementById("context-menu");

let onBackground = [];
const bgAddPerson = document.createElement("button");
bgAddPerson.textContent = "Add person";
bgAddPerson.addEventListener("click", (e) => {
    e.preventDefault();
    
    Person.createPerson();
    hideContextMenu();
});
onBackground.push(bgAddPerson);

let onPerson = [];
const addParent = document.createElement("button");
const addSpouce = document.createElement("button");
const addChild = document.createElement("button");

addParent.textContent = "Add parent";
addSpouce.textContent = "Add spouce";
addChild.textContent = "Add child";

function targetPerson(person) {
    addParent.addEventListener("click", (e) => {
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
        // person is in a family
        // TODO:
    });
}

function setContextMenu(target) {
    if (target) {
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