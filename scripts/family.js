import createConnection from "./connection.js";
import Person from "./person.js";
import Vec2 from "./vec2.js";

const connectionPointGap = 50;

export default class Family {
    #parents = [];
    #children = [];
    #div;
    #parentsDiv;
    #childrenDiv;
    #parentConnectionPoint = undefined;
    #childrenConnectionPoint = undefined;

    constructor(parents, children=undefined) {
        
        // Create divs
        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "family");
        this.#parentsDiv = document.createElement("div");
        this.#parentsDiv.setAttribute("class", "parents");
        this.#childrenDiv = document.createElement("div");
        this.#childrenDiv.setAttribute("class", "children");
        
        this.#parents = parents;

        // Set family, add parents to parent div, marry parents together and adopt children
        for (let i = 0, length = this.#parents.length; i < length; i++) {
            this.#parents[i].setFamily(this);
            this.#parentsDiv.appendChild(this.#parents[i].div);
            this.#parents[i].adopt(this.#children);
            if (i >= length - 1) {
                continue;
            }
            this.#parents[i].marry(this.#parents.slice(i + 1));
        }

        if (children) {
            this.#children = children;

            // Set family, add children to children div
            this.#children.forEach(child => {
                this.#childrenDiv.appendChild(child.div);
                if (child instanceof Person) {
                    child.setFamily(this);
                }
            });
        }

        // Append divs
        this.#div.appendChild(this.#parentsDiv);
        this.#div.appendChild(this.#childrenDiv);
    }

    get parents() {
        return this.#parents
    }
    get children() {
        return this.#children
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
        let type;
        let familyConnectionPoint;
        if (this.#parents.includes(person)) {
            type = "parents";
            if (!this.#parentConnectionPoint) {
                if (this.#parents.length === 1) {
                    this.#parentConnectionPoint = person.connectionPoints.down;
                }
                const x = this.#div.offsetLeft  + (this.#div.offsetWidth / 2);
                const y = this.#parents.length === 2? person.connectionPoints.right.y : person.connectionPoints.right.y + connectionPointGap;
                this.#parentConnectionPoint = new Vec2(x, y);
            }
            familyConnectionPoint = this.#parentConnectionPoint;
        }
        else {
            type = "children";
            if (!this.#childrenConnectionPoint) {
                if (this.#children.length === 1) {
                    this.#childrenConnectionPoint = person.connectionPoints.down;
                }
                const x = this.#div.offsetLeft  + (this.#div.offsetWidth / 2);
                const y = person.connectionPoints.right.y - connectionPointGap;
                this.#childrenConnectionPoint = new Vec2(x, y);
            }
            familyConnectionPoint = this.#childrenConnectionPoint;
        }

        // Determine closest valid connection point
        let closestPoint = undefined;
        let closestSide = "";
        if (familyConnectionPoint.y < person.connectionPoints.up.y) {
            closestPoint = person.connectionPoints.up;
            closestSide = "up";
        }
        else if (familyConnectionPoint.y < person.connectionPoints.down.y) {
            if (familyConnectionPoint.x < person.connectionPoints.left.x) {
                closestPoint = person.connectionPoints.left;
                closestSide = "left";
            }
            else {
                closestPoint = person.connectionPoints.right;
                closestSide = "right";
            }
        }
        else {
            closestPoint = person.connectionPoints.down;
            closestSide = "down";
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
            createConnection(closestPoint, familyConnectionPoint, closestSide, "white", false, person.connections[type]);
            return;
        }
        person.connections[type] = createConnection(closestPoint, familyConnectionPoint, closestSide, "white", false);
    }

    updateWorkspacePositions() {
        if (this.#parents) {
            this.#parents.forEach((parent) => {
                parent.updateWorkspacePos();
            });
        }
        if (this.#children) {
            this.#children.forEach((child) => {
                if (child instanceof Person) {
                    child.updateWorkspacePos();
                    return;
                }
                child.updateWorkspacePositions();
            });
        }
    }
}