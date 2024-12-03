import Family from "./family.js";
import Vec2 from "./vec2.js";
import Relationship from "./relationship.js";

export let PEOPLE = [];
const observer = new ResizeObserver(() => {
    Family.updateAll();
});

export default class Person {
    #family;
    #groups = [];
    #spouses = [];
    #parents = [];
    #children = [];
    #gender = "neutral";
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
    connections = {};

    constructor(name="Name", family=undefined, spouse=undefined, parents=undefined, children=undefined) {
        PEOPLE.push(this);

        if (family) {
            this.#family = family;
        }
        if (spouse) {
            this.#spouses = spouse;
        }
        if (parents) {
            this.#parents = parents;
        }
        if (children) {
            this.#children = children;
        }

        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "person");

        const nameElement = document.createElement("h1");
        nameElement.textContent = name;
        nameElement.setAttribute("placeholder", "Name");
        nameElement.className = "name";
        nameElement.contentEditable = true;
        nameElement.spellcheck = false;
        nameElement.autofocus = true;
        nameElement.addEventListener("focus", (e) => {
            if (this.name === "Name") {
                nameElement.textContent = "";
            }
            let selection = document.getSelection();
            let range = document.createRange();
            range.selectNodeContents(nameElement);
            selection.removeAllRanges();
            selection.addRange(range);
        });
        this.#div.appendChild(nameElement);

        this.#div.addEventListener("mousedown", (e) => {
            e.preventDefault();
            return;
        });

        // Set up properties to make the div draggable
        this.#div.style.setProperty("--pos-x", 0);
        this.#div.style.setProperty("--pos-y", 0);

        this.#div.style.transform = "translate(calc(var(--pos-x) * 1px), calc(var(--pos-y) * 1px))";
        this.#div.person = this;

        observer.observe(this.#div);
    }
    
    get id() {
        return PEOPLE.indexOf(this);
    }
    get name() {
        return this.#div.firstElementChild.textContent;
    }
    get family() {
        return this.#family;
    }
    get gender() {
        return this.#gender;
    }
    set gender(value) {
        this.#gender = value;
    }
    get relationships() {
        return this.#relationships;
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
    get transformPos() {
        return this.#transformPos;
    }
    set transformPos(value) {
        this.#transformPos = value;
        this.workspacePos = new Vec2(
            this.#div.offsetLeft + this.#transformPos.x,
            this.#div.offsetTop + this.#transformPos.y
        )
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
            this.#family.draw(this)
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

            parents.forEach(parent => {
                Relationship.setRelationships(parent, this, "Parent");
            });

            if (internal) {
                return true;
            }
            this.#parents.forEach(parent => {
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
        this.#div.style.setProperty("--pos-x", dragAmount.x);
        this.#div.style.setProperty("--pos-y", dragAmount.y);

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

    delete() {
         // Correct relationships
         for (const id of this.relationships.keys()) {
            const higherIds = Array.from(PEOPLE[id].relationships.keys().filter(_id => _id > id), (x) => x - 1).sort();

            higherIds.forEach(i => {
                PEOPLE[id].relationships.set(i, PEOPLE[id].relationships.get(i + 1));
            });
            PEOPLE[id].relationships.delete(higherIds[higherIds.length - 1] + 1);
        }
        this.#relationships.clear();
        this.#relationships = null;
        
        this.divorce();
        this.orphanSelf();
        this.orphan();

        Object.values(this.connections).forEach((connection) => {
            connection.remove();
        });
        this.connections = null;
        
        PEOPLE.splice(PEOPLE.indexOf(this), 1);
        
        observer.unobserve(this.#div);

        this.#div.remove();
        this.#div = null;
        
        this.#groups.forEach((group) => {
            group.remove(this);
        });
        this.#groups = null;
                
        if (PEOPLE.length === 0) {
            return;
        }
        Family.updateAll();
    }

    static resetAllTransforms() {
        PEOPLE.forEach((person) => {
            person.resetTransform();
        });
    }

    static createPerson() {
        const graph = document.getElementById("graph");
        const newPerson = new Person();
        if (graph.childElementCount === 0) {
            Family.createFamily([newPerson]);
            newPerson.div.firstElementChild.focus();
            return;
        }
        const lastPerson = PEOPLE[PEOPLE.length - 2];
        // lastPerson has parents and is single
        if (lastPerson.div.parentElement.className === "children") {
            lastPerson.groups[lastPerson.groups.length - 1].addChild(newPerson);
            newPerson.div.firstElementChild.focus();
            return;
        }
        if (lastPerson.spouses.length === 0) {
            // lastPerson is single and an orphan
            if (lastPerson.div.parentElement.className === "parents") {
                lastPerson.groups.forEach((group) => {
                    group.addParent(newPerson);
                    newPerson.div.firstElementChild.focus();
                });
                return;
            }
        }
        // lastPerson is a married orphan
        lastPerson.groups[0].addChild(newPerson);
        newPerson.div.firstElementChild.focus();
    }
}
