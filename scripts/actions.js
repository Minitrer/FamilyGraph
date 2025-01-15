import Person from "./person.js";
import Family from "./family.js";
import { FAMILIES } from "./family.js";

const stackSize = 20;
class Command {
    constructor(undo, redo) {
        this.undo = undo;
        this.redo = redo;
    }
}
const undoStack = [];
const redoStack = [];

export function undo() {
    const command = undoStack.pop();
    command.undo();
    redoStack.push(command);
}
export function redo() {
    const command = redoStack.pop();
    command.redo();
    undoStack.push(command);
}

export function addParent(person) {
    const newPerson = new Person();
    // person has parents and is single
    if (person.div.parentElement.className === "children") {
        for (let i = 0, length = person.groups.length; i < length; i++) {
            if (person.groups[i].parents.length > 1) {
                continue;
            }
            person.groups[i].addParent(newPerson);
            newPerson.div.firstElementChild.focus();
            return;
        }
        person.family.addGroup([newPerson], [person]);
        newPerson.div.firstElementChild.focus();
        return;
    }
    // person is in a family (either married or has children or both)
    for (let i = 0, length = person.groups.length; i < length; i++) {
        if (person.groups[i].children.includes(person.family) && person.groups[i].parents.length < 2) {
            person.groups[i].addParent(newPerson);
            newPerson.div.firstElementChild.focus();
            return;
        }
    }

    const subFamilyMap = {};
    subFamilyMap[person.family.id] = person;

    // No parent is single
    if (person.parents.length > 0) {
        person.parents[0].family.addGroup([newPerson], [person.family], subFamilyMap);
        newPerson.div.firstElementChild.focus();
        return;
    }
    // Find larger family in spouses
    for (let i = 0, length = person.spouses.length; i < length; i++) {
        if (person.spouses[i].parents.length > 0) {
            person.spouses[i].parents[0].family.addGroup([newPerson], [person.family], subFamilyMap);
            newPerson.div.firstElementChild.focus();
            return;
        }
    }
    // person is an orphan single parent
    // Check if person is oldest generation
    if (person.family.div.parentElement.id === "graph")
    {
        Family.createFamily([newPerson], [person.family], person.family, subFamilyMap);
        newPerson.div.firstElementChild.focus();
        return;
    }
    // Find larger family in other parents
    for (let i = 0, length = person.family.groups.length; i < length; i++) {
        if (person.family.groups[i].parents.includes(person)) {
            continue;
        }
        for (let j = 0, lengthJ = person.family.groups[i].parents.length; j < lengthJ; j++) {
            if (person.family.groups[i].parents[j].parents.length > 0) {
                person.family.groups[i].parents[j].parents[0].family.addGroup([newPerson], [person.family], subFamilyMap);
                newPerson.div.firstElementChild.focus();
                return;
            }
        }
    }
    // Find larger family through DOM tree
    // Maybe figure out a different way cause this is bad
    if (person.family.div.parentElement.className === "children") {
        const largerFamilyDiv = person.family.div.parentElement.parentElement;
        const largerFamilyID = Family.getIDFromDiv(largerFamilyDiv);

        FAMILIES[largerFamilyID].addGroup([newPerson], [person.family], subFamilyMap);
        newPerson.div.firstElementChild.focus();
        return;
    }

    console.error(`Failed to add parent of ${person}`);
}
export function addSpouce(person) {
    const newPerson = new Person();
    if (person.div.parentElement.className === "parents") {
        for (let i = 0, length = person.groups.length; i < length; i++) {
            if (person.groups[i].parents.includes(person)) {
                person.groups[i].addParent(newPerson);
                newPerson.div.firstElementChild.focus();
                return;
            }
        }
        console.error("addSpouce action failed, person somehow in parent div without being in a group as a parent");
        return;
    }
    Family.createFamily([person, newPerson], undefined, person);
    newPerson.div.firstElementChild.focus();
}
export function addChild(person) {
    const newPerson = new Person();
    if (person.div.parentElement.className === "parents") {
        for (let i = 0, length = person.groups.length; i < length; i++) {
            if (person.groups[i].parents.includes(person)) {
                person.groups[i].addChild(newPerson);
                newPerson.div.firstElementChild.focus();
                return;
            }
        }
        console.error("addChild action failed, person somehow in parent div without being in a group as a parent");
        return;
    }
    Family.createFamily([person], [newPerson], person);
    newPerson.div.firstElementChild.focus();
}

export function hidePerson(person) {
    const command = new Command(() => { person.show() }, () => { person.hide() });
    undoStack.push(command);

    person.hide();
}