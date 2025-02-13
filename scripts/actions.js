import Person, { PEOPLE } from "./person.js";
import Family from "./family.js";
import Vec2 from "./vec2.js";
import { FAMILIES } from "./family.js";
import Relationship from "./relationship.js";
import { TRANSFORM_SCALE, setWorkspaceScale, centerWorkspace } from "./pan-zoom-and-drag.js";

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
    if (undoStack.length === 0) {
        return;
    }

    const command = undoStack.pop();
    command.undo();
    pushStack(command, redoStack);
}
export function redo() {
    if (redoStack.length === 0) {
        return;
    }

    const command = redoStack.pop();
    command.redo();
    pushStack(command, undoStack);
}
function pushStack(command, stack) {
    if (stack.push(command) <= stackSize) {
        return;
    };
    const removed = stack.shift()
    if (Object.hasOwn(removed, "onRemoved")) {
        removed.onRemoved();
    }
}

export function addPerson(addTo=undefined) {
    const newPerson = Person.createPerson(addTo);

    const command = new Command(() => { newPerson.hide() }, () => { newPerson.show() });
    command.onRemoved = () => {
        if (newPerson.isHidden) {
            newPerson.delete();
        }
    }
    pushStack(command, undoStack);
}

export function addParent(person) {
    const newPerson = new Person();

    const command = new Command(() => { newPerson.hide() }, () => { newPerson.show() });
        command.onRemoved = () => {
        if (newPerson.isHidden) {
            newPerson.delete();
        }
    }
    pushStack(command, undoStack);

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
    // Check if person is of the oldest generation
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

    const command = new Command(() => { newPerson.hide() }, () => { newPerson.show() });
        command.onRemoved = () => {
        if (newPerson.isHidden) {
            newPerson.delete();
        }
    }
    pushStack(command, undoStack);
}
export function addChild(person) {
    const newPerson = new Person();

    const command = new Command(() => { newPerson.hide() }, () => { newPerson.show() });
    command.onRemoved = () => {
        if (newPerson.isHidden) {
            newPerson.delete();
        }
    }
    pushStack(command, undoStack);

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
    command.onRemoved = () => {
        if (person.isHidden) {
            person.delete();
        }
    }
    pushStack(command, undoStack);

    person.hide();
}

function setPersonTransform(person, transforms) {
    person.div.style.setProperty("--pos-x", transforms.cssPosX);
    person.div.style.setProperty("--pos-y", transforms.cssPosY);

    person.transformPos = transforms.transformPos;
}

function setPointTransform(point, transforms) {
    const cssPos = { 
        x: transforms.cssPosX,
        y: transforms.cssPosY,
    }
    point.onDrag(cssPos);
    point.transformPos = transforms.transformPos;
}

export function resetPersonTransform(person) {
    const transforms = {
        cssPosX: Number(person.div.style.getPropertyValue("--pos-x")),
        cssPosY: Number(person.div.style.getPropertyValue("--pos-y")),
        transformPos: new Vec2(person.transformPos.x, person.transformPos.y),
    }

    const command = new Command(() => { 
        setPersonTransform(person, transforms);
    }, () => { person.resetTransform() });
    pushStack(command, undoStack);

    person.resetTransform();
}

export function resetPointTransform(point) {
    const transforms = {
        cssPosX: Number(point.style.getPropertyValue("--pos-x")),
        cssPosY: Number(point.style.getPropertyValue("--pos-y")),
        transformPos: new Vec2(point.transformPos.x, point.transformPos.y),
    }
    const emptyTransforms = {
        cssPosX: 0,
        cssPosY: 0,
        transformPos: new Vec2(),
    }

    const command = new Command(() => { 
        setPointTransform(point, transforms);
    }, () => { setPointTransform(point, emptyTransforms); });
    pushStack(command, undoStack);

    setPointTransform(point, emptyTransforms);
}

export function resetAllTransforms() {
    const personTransforms = Array.from(PEOPLE, (person) => {
        return {
            cssPosX: Number(person.div.style.getPropertyValue("--pos-x")),
            cssPosY: Number(person.div.style.getPropertyValue("--pos-y")),
            transformPos: new Vec2(person.transformPos.x, person.transformPos.y),
        }
    });
    const workspace = document.getElementById("workspace");
    const points = Array.from(workspace.getElementsByClassName("point"));
    const pointTransforms = Array.from(points, (point) => {
        return {
            cssPosX: Number(point.style.getPropertyValue("--pos-x")),
            cssPosY: Number(point.style.getPropertyValue("--pos-y")),
            transformPos: new Vec2(point.transformPos.x, point.transformPos.y),
        }
    });

    const command = new Command(() => {
        for (let i = 0, length = PEOPLE.length; i < length; i++) {
            setPersonTransform(PEOPLE[i], personTransforms[i]);
        }
        for (let i = 0, length = points.length; i < length; i++) {
            setPointTransform(points[i], pointTransforms[i]);
        }
    }, () => { Person.resetAllTransforms(points); });
    pushStack(command, undoStack);

    Person.resetAllTransforms(points);
}

export function Recenter() {
    const workspace = document.getElementById("workspace");
    const currentScale = TRANSFORM_SCALE;
    const transforms = {
        cssPosX: Number(workspace.style.getPropertyValue("--pos-x")),
        cssPosY: Number(workspace.style.getPropertyValue("--pos-y")),
        transformPos: new Vec2(workspace.transformPos.x, workspace.transformPos.y),
    }

    const command = new Command(() => { 
        workspace.transformPos = transforms.transformPos;
        workspace.style.setProperty("--pos-x", transforms.cssPosX);
        workspace.style.setProperty("--pos-y", transforms.cssPosY);
        setWorkspaceScale(currentScale); 
    }, centerWorkspace );
    pushStack(command, undoStack);

    centerWorkspace();
}

export function draggedPerson(person, positionBeforeDragging, positionAfterDragging) {
    const command = new Command(() => { setPersonTransform(person, positionBeforeDragging); }, () => { setPersonTransform(person, positionAfterDragging); });
    pushStack(command, undoStack);
}

export function draggedPoint(point, positionBeforeDragging, positionAfterDragging) {
    const command = new Command(() => { setPointTransform(point, positionBeforeDragging); }, () => { setPointTransform(point, positionAfterDragging); });
    pushStack(command, undoStack);
}

export function changeRelationshipType(child, parent, isStep) {
    const command = new Command(() => {
        Relationship.setStepRelationships(child, parent, "Child", !isStep);
        Relationship.setStepRelationships(parent, child, "Parent", !isStep);
    }, () => {
        Relationship.setStepRelationships(child, parent, "Child", isStep);
        Relationship.setStepRelationships(parent, child, "Parent", isStep);
    });
    pushStack(command, undoStack);

    command.redo();
}