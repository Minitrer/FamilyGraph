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
    
    constructor(parents, children, family) {
        this.parents = parents;
        this.#family = family;

        // Set family, add parents to parent div, marry parents together and adopt children
        for (let i = 0, length = this.parents.length; i < length; i++) {
            this.parents[i].setFamily(family);
            this.parents[i].addGroup(this); 
            family.parentsDiv.appendChild(this.parents[i].div);
            if (children && children instanceof Person) {
                this.parents[i].adopt(children);
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
                this.draw(parent);
            })
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
        }
        this.childrenConnectionPoint.div = createConnectionDiv(this.childrenConnectionPoint);
    }
}

function createConnectionDiv(p) {
    const workspace = document.getElementById("workspace");
    const div = document.createElement("div")
    div.setAttribute("class", "point");
    div.style.width = `${connectionPointLength}px`;
    div.style.height = `${connectionPointLength}px`;
    div.style.backgroundColor = "green";

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

    constructor(parents, children=undefined) {
        
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
                if (!group.parentConnectionPoint) {
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
            // const divCenter = new Vec2(
            //     person.connectionPoints.up.x,
            //     person.connectionPoints.left.y
            // );
            // const dirTo = familyConnectionPoint.sub(divCenter);
            // switch (dirTo.angle() < 0) {
            //     case true:
            //         const topLeftAngle = new Vec2(person.connectionPoints.left.x, person.connectionPoints.up.y + 20).sub(divCenter).angle();
            //         if (dirTo.angle() < topLeftAngle) {
            //             closestPoint = person.connectionPoints.left;
            //             closestSide = "left";
            //             break;
            //         } 
            //         const topRightAngle = new Vec2(person.connectionPoints.right.x, person.connectionPoints.up.y + 20).sub(divCenter).angle();
            //         if (dirTo.angle() < topRightAngle) {
            //             closestPoint = person.connectionPoints.up;
            //             closestSide = "up";
            //             break;
            //         }
            //         closestPoint = person.connectionPoints.right;
            //         closestSide = "right";
            //         break;
            //     case false:
            //         const bottomLeftAngle = new Vec2(person.connectionPoints.left.x, person.connectionPoints.down.y - 20).sub(divCenter).angle();
            //         if (dirTo.angle() > bottomLeftAngle) {
            //             closestPoint = person.connectionPoints.left;
            //             closestSide = "left";
            //             break;
            //         } 
            //         const bottomRightAngle = new Vec2(person.connectionPoints.right.x, person.connectionPoints.down.y - 20).sub(divCenter).angle();
            //         if (dirTo.angle() > bottomRightAngle) {
            //             closestPoint = person.connectionPoints.down;
            //             closestSide = "down";
            //             break;
            //         }
            //         closestPoint = person.connectionPoints.right;
            //         closestSide = "right";
            //         break;
            // }
    
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
}