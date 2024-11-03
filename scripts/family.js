import createConnection from "./connection.js";
import Person from "./person.js";
import Vec2 from "./vec2.js";

const connectionPointGap = 30;
const connectionPointLength = 10;

class ParentChildGroup {
    #family
    parents = [];
    children = [];
    parentsConnectionPoint;
    childrenConnectionPoint;
    parentsToChildrenInbetweenPoint = new Vec2();
    
    constructor(parents, children, family) {
        this.parents = parents;
        this.#family = family;

        // Set family, add parents to parent div, marry parents together and adopt children
        for (let i = 0, length = this.parents.length; i < length; i++) {
            this.parents[i].setFamily(family);
            this.parents[i].addGroup(this); 
            family.parentsDiv.appendChild(this.parents[i].div);
            if (children) {
                if (children instanceof Person) {
                    this.parents[i].adopt(children);
                }
                else if (this.#family.subFamilyChild) {
                    this.parents[i].adopt(this.#family.subFamilyChild);
                }
            } 
            if (i >= length - 1) {
                continue;
            }
            this.parents[i].marry(this.parents.slice(i + 1));
        }

        if (children) {
            this.children = children;
    
            // Set family, add children to children div
            this.children.forEach(child => {
                family.childrenDiv.appendChild(child.div);
                if (child instanceof Person) {
                    child.setFamily(family);
                    child.addGroup(this);
                }
                else if (this.#family.subFamilyChild) {
                    this.#family.subFamilyChild.addGroup(this);
                }
                else {
                    console.error(`Warning: Sub-family ${child} added without specified subFamilyChild.`);
                }
            });
        }
    }

    createParentConnectionPoint() {
        if (this.parents.length === 1) {
            this.parentsConnectionPoint = this.parents[0].connectionPoints.down;
        }
        else {
            const x = this.#family.div.offsetLeft  + (this.#family.div.offsetWidth / 2);
            const y = this.parents.length === 2? this.parents[0].connectionPoints.right.y : this.parents[0].connectionPoints.down.y + connectionPointGap;
            this.parentsConnectionPoint = new Vec2(x, y);
        }
        this.parentsConnectionPoint.updateConnected = () => {
            this.parents.forEach((parent) => {
                this.#family.draw(parent);
            })
            if (this.childrenConnectionPoint) {
                this.parentsConnectionPoint.draw();
                this.childrenConnectionPoint.draw();
            }
        }

        this.parentsConnectionPoint.draw = () => {
            const inbetweenPoint = this.parentsConnectionPoint.add(this.childrenConnectionPoint).div(2);
            const direction = (this.parentsConnectionPoint.sub(this.childrenConnectionPoint).y > 0)? "up" : "down";
            if (!this.parentsConnectionPoint.inbetweenConnection) {
                this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, inbetweenPoint, direction, "white", false);
                return;
            }
            this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, inbetweenPoint, direction, "white", false, this.parentsConnectionPoint.inbetweenConnection);
        }

        this.parentsConnectionPoint.div = createConnectionDiv(this.parentsConnectionPoint);
    }

    createChildConnectionPoint() {
        if (this.children.length === 1 && this.children[0] instanceof Person) {
            this.childrenConnectionPoint = this.children[0].connectionPoints.up;
        }
        else {
            const x = this.#family.div.offsetLeft  + (this.#family.div.offsetWidth / 2);
            const y = this.children[0].div.offsetTop - connectionPointGap;
            this.childrenConnectionPoint = new Vec2(x, y);
        }
        this.childrenConnectionPoint.updateConnected = () => {
            this.children.forEach((child) => {
                if (!(child instanceof Person)) {
                    return;
                }
                this.#family.draw(child);
            })
            this.childrenConnectionPoint.draw();
            this.parentsConnectionPoint.draw();
        }

        this.childrenConnectionPoint.draw = () => {
            const inbetweenPoint = this.childrenConnectionPoint.add(this.parentsConnectionPoint).div(2);
            const direction = (this.childrenConnectionPoint.sub(this.parentsConnectionPoint).y > 0)? "up" : "down";
            if (!this.childrenConnectionPoint.inbetweenConnection) {
                this.childrenConnectionPoint.inbetweenConnection = createConnection(this.childrenConnectionPoint, inbetweenPoint, direction, "white", false);
                return;
            }
            this.childrenConnectionPoint.inbetweenConnection = createConnection(this.childrenConnectionPoint, inbetweenPoint, direction, "white", false, this.childrenConnectionPoint.inbetweenConnection);
        }

        this.childrenConnectionPoint.draw();
        this.parentsConnectionPoint.draw();
        this.childrenConnectionPoint.div = createConnectionDiv(this.childrenConnectionPoint);
    }

    addParent(parent) {
        this.parents.push(parent);
        parent.setFamily(family);
        parent.addGroup(this); 
        family.parentsDiv.appendChild(parent.div);
        this.children.forEach((child) => {
            if (child && child instanceof Person) {
                parent.adopt(child);
            }
        })
        for (let i = 0, length = this.parents.length - 1; i < length; i++) {
            parent.marry(this.parents[i]);
        }
    }

    addChild(child, subFamilyChild=undefined) {
        this.children.push(child);
    
        // Set family, add child to children div
        this.#family.childrenDiv.appendChild(child.div);
        if (child instanceof Person) {
            child.setFamily(family);
            child.addGroup(this);
            return;
        }
        if (subFamilyChild) {
            subFamilyChild.addGroup(this);
            return
        }
        console.error(`Warning: Sub-family ${child} added without specified subFamilyChild.`);
    }
}

function createConnectionDiv(p) {
    const workspace = document.getElementById("workspace");
    const div = document.createElement("div")
    div.setAttribute("class", "point");
    div.style.width = `${connectionPointLength}px`;
    div.style.height = `${connectionPointLength}px`;

    div.style.position = "absolute";
    div.style.left = `${p.x - connectionPointLength / 2}px`;
    div.style.top = `${p.y - connectionPointLength / 2}px`;

    div.transformPos = new Vec2();
    div.onDrag = (dragAmount) => {
        div.style.setProperty("--pos-x", dragAmount.x);
        div.style.setProperty("--pos-y", dragAmount.y);

        p.x = div.offsetLeft + dragAmount.x + connectionPointLength / 2;
        p.y = div.offsetTop + dragAmount.y + connectionPointLength / 2;

        p.updateConnected();
    }

    workspace.appendChild(div);
    return div;
}

export default class Family {
    #groups = [];
    #div;
    #parentsDiv;
    #childrenDiv;

    constructor(parents, children=undefined, subFamilyChild=undefined) {
        // subFamilyChild determines which parent of a subfamily in the constructor children is a child of the constructor parents
        if (subFamilyChild) {
            this.subFamilyChild = subFamilyChild;
        }
        
        // Create divs
        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "family");
        this.#parentsDiv = document.createElement("div");
        this.#parentsDiv.setAttribute("class", "parents");
        this.#childrenDiv = document.createElement("div");
        this.#childrenDiv.setAttribute("class", "children");
        
        this.#groups[0] = new ParentChildGroup(parents, children, this);

        // Append divs
        this.#div.appendChild(this.#parentsDiv);
        this.#div.appendChild(this.#childrenDiv);
    }

    get groups() {
        return this.#groups
    }
    get div() {
        return this.#div
    }
    get parentsDiv() {
        return this.#parentsDiv
    }
    get childrenDiv() {
        return this.#childrenDiv
    }
    

    draw(person) {
        person.groups.forEach((group) => {
            let type;
            let familyConnectionPoint;
            if (group.parents.includes(person)) {
                type = "parents";
                if (!group.parentsConnectionPoint) {
                    group.createParentConnectionPoint();
                }
                familyConnectionPoint = group.parentsConnectionPoint;
            }
            else {
                type = "children";
                if (!group.childrenConnectionPoint) {
                    group.createChildConnectionPoint();
                }
                familyConnectionPoint = group.childrenConnectionPoint;
            }
    
            // Determine facing valid connection point
            let facingPoint = undefined;
            let facingSide = "";
            if (familyConnectionPoint.y < person.connectionPoints.up.y) {
                facingPoint = person.connectionPoints.up;
                facingSide = "up";
            }
            else if (familyConnectionPoint.y < person.connectionPoints.down.y) {
                if (familyConnectionPoint.x < person.connectionPoints.left.x) {
                    facingPoint = person.connectionPoints.left;
                    facingSide = "left";
                }
                else {
                    facingPoint = person.connectionPoints.right;
                    facingSide = "right";
                }
            }
            else {
                facingPoint = person.connectionPoints.down;
                facingSide = "down";
            }

            if (person.connections[type]) {
                createConnection(facingPoint, familyConnectionPoint, facingSide, "white", false, person.connections[type]);
                return;
            }
            person.connections[type] = createConnection(facingPoint, familyConnectionPoint, facingSide, "white", false);
        });
    }

    updateWorkspacePositions() {
        for (let i = 0, length = this.#groups.length; i < length; i++) {
            this.#groups[i].parents.forEach((parent) => {
                parent.updateWorkspacePos();
            });
            this.#groups[i].children.forEach((child) => {
                if (child instanceof Person) {
                    child.updateWorkspacePos();
                    return;
                }
                child.updateWorkspacePositions();
            });
        }
    }

    addGroup(parents, children=undefined) {
        this.#groups.push(new ParentChildGroup(parents, children, this));
    }
}