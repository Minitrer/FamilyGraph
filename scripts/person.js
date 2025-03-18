import Family from "./family.js";
import { FAMILIES } from "./family.js";
import Vec2 from "./vec2.js";
import Relationship from "./relationship.js";
import { RELATIONSHIPTEXTS, updateRelationshipTextPos } from "./controls.js";

export let PEOPLE = [];
const observer = new ResizeObserver(() => {
    Family.updateAll();

    RELATIONSHIPTEXTS.forEach((text, id) => {
        updateRelationshipTextPos(text, id);
    });
});

export default class Person {
    #family;
    #groups = [];
    #spouses = [];
    #parents = [];
    #children = [];
    #gender = "agender";
    #relationships = new Map();
    #div;
    #transformPos = new Vec2();
    #workspacePos = new Vec2();
    #connectionPoints = {
        "up": new Vec2(),
        "down" : new Vec2(),
        "left" : new Vec2(),
        "right" : new Vec2()
    }
    #isHidden = false;
    #DOMPositionBeforeHiding = {
        index: 0,
        parent: undefined,
    };
    #NameBeforeHiding = "";
    connections = new Map();

    constructor(jsonObject) {
        PEOPLE.push(this);

        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "person agender");

        const nameElement = document.createElement("h1");
        nameElement.textContent = "Name";
        nameElement.setAttribute("placeholder", "Name");
        nameElement.className = "name";
        nameElement.spellcheck = false;
        nameElement.autofocus = true;
        nameElement.addEventListener("focus", focusName);
        this.#div.appendChild(nameElement);

        // Set up properties to make the div draggable
        this.#div.style.setProperty("--pos-x", 0);
        this.#div.style.setProperty("--pos-y", 0);

        this.#div.style.transform = "translate(calc(var(--pos-x) * 1px), calc(var(--pos-y) * 1px))";
        this.#div.person = this;

        observer.observe(this.#div);

        if (jsonObject) {
            this.load(jsonObject);
        }
    }
    
    get id() {
        return PEOPLE.indexOf(this);
    }
    get name() {
        return this.#div.firstElementChild.textContent;
    }
    set name(value) {
        this.#div.firstElementChild.textContent = value;
    }
    get family() {
        return this.#family;
    }
    get gender() {
        return this.#gender;
    }
    set gender(value) {
        this.#div.classList.replace(`${this.#gender}`, value);
        this.#gender = value;
    }
    get relationships() {
        return this.#relationships;
    }
    get div() {
        return this.#div;
    }
    get groups() {
        return this.#groups;
    }
    get spouses() {
        return this.#spouses;
    }
    get parents() {
        return this.#parents;
    }
    get children() {
        return this.#children;
    }
    get div() {
        return this.#div;
    }
    get isHidden() {
        return this.#isHidden;
    }
    get transformPos() {
        return this.#transformPos;
    }
    set transformPos(value) {
        this.#transformPos = value;
        this.workspacePos = new Vec2(
            this.#div.offsetLeft + this.#transformPos.x,
            this.#div.offsetTop + this.#transformPos.y
        );
    }
    get workspacePos() {
        return this.#workspacePos;
    }
    set workspacePos(value) {
        this.#workspacePos = value;

        const relativeConnectionPoints = {
            up: new Vec2(this.#div.offsetWidth / 2, 0),
            down: new Vec2(this.#div.offsetWidth / 2, this.#div.offsetHeight),
            left: new Vec2(0, this.#div.offsetHeight / 2),
            right: new Vec2(this.#div.offsetWidth, this.#div.offsetHeight / 2),
        }
        this.#connectionPoints.up = this.#workspacePos.add(relativeConnectionPoints.up);
        this.#connectionPoints.down = this.#workspacePos.add(relativeConnectionPoints.down);
        this.#connectionPoints.left = this.#workspacePos.add(relativeConnectionPoints.left);
        this.#connectionPoints.right = this.#workspacePos.add(relativeConnectionPoints.right);

        if (this.#family) {
            this.#family.draw(this);
        }
    }
    get connectionPoints() {
        return this.#connectionPoints;
    }

    setFamily(family) {
        this.#family = family;
    }
    addGroup(group) {
        this.#groups.push(group);
    }
    // Each of these methods update the instance's property
    // They also update the target's corresponding property if the method wasn't called internally
    adopt(children, internal=false) {
        if (this.#children.includes(children)) {
            return false;
        }

        if (Array.isArray(children)) {
            this.#children = this.#children.concat(children);

            children.forEach((child) => {
                Relationship.setRelationships(child, this, "Child");
            });

            if (internal) {
                return true;
            }
            children.forEach(child => {
                child.getAdopted(this, true);
            });
            return true;
        }
        this.#children.push(children);

        Relationship.setRelationships(children, this, "Child");

        if (internal) {
            return true;
        }
        children.getAdopted(this, true);
        return true;
    }
    getAdopted(parents, internal=false) {
        if (this.#parents.includes(parents)) {
            return false;
        }

        if (Array.isArray(parents)) {
            this.#parents = this.#parents.concat(parents);

            parents.forEach((parent) => {
                Relationship.setRelationships(parent, this, "Parent");
            });

            if (internal) {
                return true;
            }
            this.#parents.forEach((parent) => {
                parent.adopt(this, true);
            });
            return true;
        }
        this.#parents.push(parents);

        Relationship.setRelationships(parents, this, "Parent");

        if (internal) {
            return true;
        }
        parents.adopt(this, true);
        return true;
    }
    orphan(child=undefined, internal=false) {
        if (child) {
            const index = this.#children.indexOf(child);
            if (index < 0) {
                return false;
            }

            this.#children.splice(index, 1);
            if (this.#relationships && child.relationship) {
                this.#relationships.delete(child.id);
            }

            if (internal) {
                return true;
            }
            child.orphanSelf(this, true);
            return true;
        }

        if (!internal) {
            this.#children.forEach(_child => {
                _child.orphanSelf(this, true);
            });
        }
        
        this.#children.forEach((child) => {
            if (this.#relationships && child.relationship) {
                this.#relationships.delete(child.id);
            }
        });
        this.#children = [];
        return true;
    }
    orphanSelf(parent=undefined, internal=false) {
        if (parent) {
            const index = this.#parents.indexOf(parent);
            if (index < 0) {
                return false;
            }

            this.#parents.splice(index, 1);
            if (this.#relationships && parent.relationship) {
                this.#relationships.delete(parent.id);
            }

            if (internal) {
                return true;
            }
            parent.orphan(this, true);
            return true;
        }

        
        if (!internal) {
            this.#parents.forEach(_parent => {
                _parent.orphan(this, true);
            });
        }
        
        this.#parents.forEach((parent) => {
            if (this.#relationships && parent.relationship) {
                this.#relationships.delete(parent.id);
            }
        });
        this.#parents = [];
        return true;
    }

    marry(spouses, internal=false) {
        if (this.#spouses.includes(spouses)) {
            return false;
        }

        if (Array.isArray(spouses)) {

            this.#spouses = this.#spouses.concat(spouses);

            spouses.forEach((spouse) => {
                Relationship.setRelationships(spouse, this, "Spouce");
            })

            if (internal) {
                return true;
            }
            spouses.forEach((spouse) => {
                spouse.marry(this, true);
            });
            return true;
        }

        this.#spouses.push(spouses);

        Relationship.setRelationships(spouses, this, "Spouce");

        if (internal) {
            return true;
        }
        spouses.marry(this, true);
        return true;
    }
    divorce(spouse=undefined, internal=false) {
        if (spouse) {
            const index = this.#spouses.indexOf(spouse);
            if (index < 0) {
                return false;
            }

            this.#spouses.splice(index, 1);
            if (this.#relationships && spouse.relationship) {
                this.#relationships.delete(spouse);
            }

            if (internal) {
                return true;
            }
            spouse.divorce(this, true);
            return true;
        }

        
        if (!internal) {
            this.#spouses.forEach(_spouse => {
                _spouse.divorce(this, true);
            });
        }

        this.#spouses.forEach((spouse) => {
            if (this.#relationships && spouse.relationship) {
                this.#relationships.delete(spouse);
            }
        });
        this.#spouses = [];
        return true;
    }

    onDrag(dragAmount) {
        this.#div.style.setProperty("--pos-y", dragAmount.y);
        
        if (this.#div.nextElementSibling) {
            const divToSwap = this.#div.nextElementSibling;
            const isFamily = divToSwap.person? false : true;
            const nextSibling = isFamily? divToSwap.firstElementChild.lastElementChild : divToSwap;

            if (this.#div.offsetLeft + dragAmount.x > nextSibling.person.workspacePos.x) {
                const widthDifference = this.#div.offsetWidth - divToSwap.offsetWidth;
                this.#transformPos.x -= divToSwap.offsetLeft - this.#div.offsetLeft - widthDifference;
                const oldOffset = this.#div.offsetLeft;

                divToSwap.after(this.#div);

                if (!isFamily) {
                    nextSibling.person.workspacePos = new Vec2(
                        nextSibling.offsetLeft + nextSibling.person.transformPos.x,
                        nextSibling.offsetTop + nextSibling.person.transformPos.y
                    );
                }
                else {
                    const id = Family.getIDFromDiv(divToSwap);
                    FAMILIES[id].updateWorkspacePositions();
                    FAMILIES[id].updateConnectionPoints();
                }

                const newDragX = dragAmount.x + oldOffset - this.#div.offsetLeft;
                this.#div.style.setProperty("--pos-x", newDragX);
                this.workspacePos = new Vec2(
                    this.#div.offsetLeft + newDragX,
                    this.#div.offsetTop + dragAmount.y
                );
                return;
            }
        }
        if (this.#div.previousElementSibling) {
            const divToSwap = this.#div.previousElementSibling;
            const isFamily = divToSwap.person? false : true;
            const previousSibling = isFamily? divToSwap.firstElementChild.firstElementChild : divToSwap;

            if (this.#div.offsetLeft + dragAmount.x < previousSibling.person.workspacePos.x) {
                this.#transformPos.x -= divToSwap.offsetLeft - this.#div.offsetLeft;
                const oldOffset = this.#div.offsetLeft;

                this.#div.after(divToSwap);

                if (!isFamily) {
                    previousSibling.person.workspacePos = new Vec2(
                        previousSibling.offsetLeft + previousSibling.person.transformPos.x,
                        previousSibling.offsetTop + previousSibling.person.transformPos.y
                    );
                }
                else {
                    const id = Family.getIDFromDiv(divToSwap);
                    FAMILIES[id].updateWorkspacePositions();
                    FAMILIES[id].updateConnectionPoints();
                }
                
                const newTransformX = dragAmount.x + oldOffset - this.#div.offsetLeft;
                this.#div.style.setProperty("--pos-x", newTransformX);
                this.workspacePos = new Vec2(
                    this.#div.offsetLeft + newTransformX,
                    this.#div.offsetTop + dragAmount.y
                );
                return;            
            }
        }

        this.#div.style.setProperty("--pos-x", dragAmount.x);
        this.workspacePos = new Vec2(
            this.#div.offsetLeft + dragAmount.x,
            this.#div.offsetTop + dragAmount.y
        );
    }

    updateWorkspacePos() {
        this.workspacePos = new Vec2(
            this.#div.offsetLeft + this.#transformPos.x,
            this.#div.offsetTop + this.#transformPos.y
        );
    }

    resetTransform() {
        this.#div.style.setProperty("--pos-x", 0);
        this.#div.style.setProperty("--pos-y", 0);

        this.transformPos = new Vec2();
    }

    hide() {
        if (this.#isHidden) {
            return;
        }
        this.#isHidden = true;

        this.#NameBeforeHiding = this.name;
        const children = this.#div.parentElement.children;
        let i = 0;
        for (let length = children.length; i < length; i++) {
            if (children.item(i) !== this.#div) {
                continue;
            }
            this.#DOMPositionBeforeHiding.index = i;
            this.#DOMPositionBeforeHiding.parent = this.#div.parentElement;
            break;
        }

        const found = i !== children.length;
        if (!found) {
            console.error(`Unable to find DOM position of ${this}`);
            return;
        }

        this.connections.forEach((connection) => {
            connection.remove();
        });

        observer.unobserve(this.#div);

        this.#div.remove();
        const text = RELATIONSHIPTEXTS.get(this.id)
        if (text) {
            text.remove();
            RELATIONSHIPTEXTS.delete(this.id);
        }
        this.#groups.forEach(group => {
            group.hide(this);
        });

        Family.updateAll();
    }

    show() {
        if (!this.#isHidden) {
            return;
        }
        this.#isHidden = false;

        if (this.#family.isHidden) {
            this.#family.show();
        }

        this.#groups.forEach(group => {
            if (group.isHidden) {
                group.show();
            }
            group.show(this);
        });

        if (this.#DOMPositionBeforeHiding.index === 0) {
            this.#DOMPositionBeforeHiding.parent.prepend(this.#div);
        }
        else if (this.#DOMPositionBeforeHiding.index > this.#DOMPositionBeforeHiding.parent.childElementCount) {
            this.#DOMPositionBeforeHiding.parent.append(this.#div);
        }
        else {
            const children = this.#DOMPositionBeforeHiding.parent.children;
            children.item(this.#DOMPositionBeforeHiding.index - 1).after(this.#div);
        }
        const workspace = document.getElementById("workspace");
        this.connections.forEach((connection) => {
            workspace.append(connection);
        });
        this.name = this.#NameBeforeHiding;
        
        observer.observe(this.#div);

        Family.updateAll();
    }

    delete(update=true) {
        // Correct relationships
        const deletedId = this.id;
        for (let i = 0; i < PEOPLE.length; i++) {
            if (i === deletedId) {
                continue;
            }
            const relationshipIDs = Array.from(PEOPLE[i].relationships.keys()).sort((a, b) => a - b);
            relationshipIDs.forEach((id) => {
                if (id < deletedId) {
                    return;
                }
                if (id === deletedId) {
                    PEOPLE[i].relationships.delete(id);
                    return;
                }
                PEOPLE[i].relationships.set(id - 1, PEOPLE[i].relationships.get(id));
                PEOPLE[i].relationships.delete(id);
            });
        }
        
        this.#relationships.clear();
        this.#relationships = null;
        
        this.divorce();
        this.orphanSelf();
        this.orphan();

        this.connections.forEach((connection) => {
            connection.remove();
        });
        this.connections = null;
        
        PEOPLE.splice(PEOPLE.indexOf(this), 1);
        
        observer.unobserve(this.#div);

        this.#div.firstElementChild.removeEventListener("focus", focusName);
        this.#div.remove();
        this.#div = null;
            
        for (let i = 0, length = this.#groups.length; i < length; i++) {
            this.#groups[0].remove(this, update);
        }
        this.#groups = null;
        
        if (PEOPLE.length === 0 || this.isHidden || !update) {
            return;
        }
        Family.updateAll();
    }

    toJSON(visiblePeople, visibleFamilies) {
        const stepRelationshipIDs = {
            step: [],
            half: [],
        };
        this.#relationships.forEach((relationship, id) => {
            switch (relationship.prefix) {
                case ("Step-"): {
                    const index = visiblePeople.indexOf(PEOPLE[id]);
                    if (index > -1) {
                        stepRelationshipIDs.step.push(index);
                    }
                    return;
                }
                case ("Half-"): {
                    const index = visiblePeople.indexOf(PEOPLE[id]);
                    if (index > -1) {
                        stepRelationshipIDs.half.push(index);
                    }
                    return;
                }
                default:
                    return;
            }
        });
        return {
            name: this.name,
            familyID: visibleFamilies.indexOf(this.#family),
            groupIDs: getIDs(this.#groups),
            spouseIDs: getIDs(this.#spouses, visiblePeople),
            parentIDs: getIDs(this.#parents, visiblePeople),
            childrenIDs: getIDs(this.#children, visiblePeople),
            gender: this.#gender,
            stepRelationshipIDs: stepRelationshipIDs,
            transformPos: this.#transformPos,
            workspacePos: this.#workspacePos,
            connectionPoints: this.#connectionPoints,
        }
    }
    load(jsonObject) {
        this.name = jsonObject.name;
        this.#spouses = fromIDs(jsonObject.spouseIDs, PEOPLE);
        this.#parents = fromIDs(jsonObject.parentIDs, PEOPLE);
        this.#children = fromIDs(jsonObject.childrenIDs, PEOPLE);
        this.gender = jsonObject.gender;
        this.#transformPos = new Vec2(jsonObject.transformPos.x, jsonObject.transformPos.y);
        this.#workspacePos = new Vec2(jsonObject.workspacePos.x, jsonObject.workspacePos.y);
        this.#connectionPoints = jsonObject.connectionPoints;

        if (Object.hasOwn(jsonObject, "stepRelationshipIDs")) {
            jsonObject.stepRelationshipIDs.step.forEach((id) => {
                this.#relationships.get(id).setStep();
            });
            jsonObject.stepRelationshipIDs.half.forEach((id) => {
                this.#relationships.get(id).setHalf();
            });
        }

        this.#div.style.setProperty("--pos-x", this.#transformPos.x);
        this.#div.style.setProperty("--pos-y", this.#transformPos.y);
    }

    static save(visiblePeople, visibleFamilies) {
        return visiblePeople.map((person) => person.toJSON(visiblePeople, visibleFamilies));
    }
    static fromJSON(string) {
        let jsonObject = JSON.parse(string);
        return new Person(jsonObject);
    }
    static setPEOPLE(newPeople) {
        PEOPLE = newPeople;
    }

    static resetAllTransforms(points=undefined) {
        PEOPLE.forEach((person) => {
            if (person.isHidden) {
                return;
            }
            person.resetTransform();
        });
        if (points) {
            points.forEach((point) => {
                point.onDrag({x: 0, y:0});
                point.transformPos = new Vec2();
            });
            return;
        }
        const workspace = document.getElementById("workspace");
        points = workspace.getElementsByClassName("point");
        points.forEach((point) => {
            point.onDrag({x: 0, y:0});
        });
    }

    static createPerson(addTo=undefined) {
        const graph = document.getElementById("graph");
        const newPerson = new Person();
        if (graph.childElementCount === 0) {
            Family.createFamily([newPerson]);
            return newPerson;
        }
        function getLastPerson() {
            for (let i = PEOPLE.length - 2; i >= 0; i --) {
                if (!PEOPLE[i].isHidden) {
                    return PEOPLE[i];
                }
            }
        }
        const lastPerson = addTo? addTo : getLastPerson();
        // lastPerson has parents and is single
        if (lastPerson.div.parentElement.className === "children") {
            lastPerson.groups[lastPerson.groups.length - 1].addChild(newPerson);
            return newPerson;
        }
        if (lastPerson.spouses.length === 0 || lastPerson.spouses.every((spouse) => spouse.isHidden)) {
            // lastPerson is single and an orphan
            if (lastPerson.div.parentElement.className === "parents") {
                lastPerson.groups.forEach((group) => {
                    group.addParent(newPerson);
                });
                return newPerson;
            }
        }
        // lastPerson is a married orphan
        lastPerson.groups[0].addChild(newPerson);
        return newPerson;
    }
}

function getIDs(array, visibleGlobal=undefined) {
    if (visibleGlobal) {
        return Array.from(array.filter((item) => !item.isHidden), (visibleItem) => visibleGlobal.indexOf(visibleItem));
    }
    const visibleArray = array.filter((item) => !item.isHidden);
    return Array.from(visibleArray, (visibleItem) => visibleArray.indexOf(visibleItem));
}
function fromIDs(ids, array) {
    return ids.map((id) => array[id]);
}
function focusName(e) {
    if (this.name === "Name") {
        e.target.textContent = "";
    }
    const selection = document.getSelection();
    const range = document.createRange();
    range.selectNodeContents(e.target);
    selection.removeAllRanges();
    selection.addRange(range);
}