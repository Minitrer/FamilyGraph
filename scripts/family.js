import createConnection from "./connection.js";
import Person from "./person.js";
import Vec2 from "./vec2.js";

export default class Family {
    #parents = [];
    #children = [];
    #div;
    #parentsDiv;
    #childrenDiv;
    #parentConnectionPoint = undefined;
    #childrenConnectionPoint = undefined;

    constructor(parents=undefined, children=undefined) {
        
        // Create divs
        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "family");
        this.#parentsDiv = document.createElement("div");
        this.#parentsDiv.setAttribute("class", "parents");
        this.#childrenDiv = document.createElement("div");
        this.#childrenDiv.setAttribute("class", "children");
        
        if (parents) {
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
        if (!this.#parents.includes(person)) {
            return;
        }
        if (!this.#parentConnectionPoint) {
            const x = this.#div.offsetLeft  + (this.#div.offsetWidth / 2);
            const y = this.#parents.length === 2? person.connectionPoints.right.y : person.connectionPoints.right.y + 10;
            this.#parentConnectionPoint = new Vec2(x, y);
        }
        // Determine closest valid connection point
        let closestPoint = undefined;
        let closestSide = "";
        for (const side in person.connectionPoints) {
            if (!closestPoint) {
                closestPoint = person.connectionPoints[side];
                closestSide = side;
                continue;
            }
            const lengthCurrentMin = closestPoint.sub(this.#parentConnectionPoint).magnitude();
            const lengthCurrentSide = person.connectionPoints[side].sub(this.#parentConnectionPoint).magnitude();
            if (lengthCurrentSide >= lengthCurrentMin) {
                continue;
            }
            // Check if path goes through the person
            switch (side) {
                case "up":
                    if (person.connectionPoints.up.y < this.#parentConnectionPoint.y) {
                        continue;
                    }
                    break;
                case "down":
                    if (person.connectionPoints.down.y > this.#parentConnectionPoint.y) {
                        continue;
                    }
                    break;
                case "left":
                    if (person.connectionPoints.left.x < this.#parentConnectionPoint.x) {
                        continue;
                    }
                    break;
                case "right":
                    if (person.connectionPoints.right.x > this.#parentConnectionPoint.x) {
                        continue;
                    }
                    break;
            }
            closestPoint = person.connectionPoints[side];
            closestSide = side;
        }
        if (person.connections["parent"]) {
            console.debug(person.connections["parent"]);
            createConnection(closestPoint, this.#parentConnectionPoint, closestSide, "white", false, person.connections["parent"]);
            return;
        }
        person.connections["parent"] = createConnection(closestPoint, this.#parentConnectionPoint, closestSide, "white", false);
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