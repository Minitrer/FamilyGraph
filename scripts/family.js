import createConnection from "./connection.js";
import Person from "./person.js";
import Vec2 from "./vec2.js";

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
        person.groups.forEach((group, i) => {
            let type;
            let familyConnectionPoint;
            if (group.parents.includes(person)) {                
                type = `parents ${i}`;
                if (group.parents.length === 1) {
                    if (!group.parentsConnectionPoint) {
                        group.createParentConnectionPoint();
                        return;
                    }
                    group.parentsConnectionPoint.update();
                    return;
                }
                if (!group.parentsConnectionPoint) {
                    group.createParentConnectionPoint();
                }
                else if (group.parentsConnectionPoint.div.transformPos.x === 0 && group.parentsConnectionPoint.div.transformPos.y === 0) {
                    group.parentsConnectionPoint.update();
                }
                familyConnectionPoint = group.parentsConnectionPoint;
            }
            else {
                type = `children ${i}`;
                if (group.children.length === 1) {
                    if (!group.childrenConnectionPoint) {
                        group.createChildConnectionPoint();
                        return;
                    }
                    group.childrenConnectionPoint.update();
                    return;
                }
                if (!group.childrenConnectionPoint) {
                    group.createChildConnectionPoint();
                }
                // Check if recently added new child
                else if (!group.childrenConnectionPoint.div.transformPos) {
                    group.childrenConnectionPoint.inbetweenConnection.remove();
                    group.createChildConnectionPoint();
                }
                else if (group.childrenConnectionPoint.div.transformPos.x === 0 && group.childrenConnectionPoint.div.transformPos.y === 0) {
                    group.childrenConnectionPoint.update();
                }
                familyConnectionPoint = group.childrenConnectionPoint;
            }

            // Determine valid direction
            const direction = getPersonToPointDirection(person, familyConnectionPoint);
            const directionPoint = person.connectionPoints[direction];

            if (person.connections[type]) {
                createConnection(directionPoint, familyConnectionPoint, direction, connectionColor, false, person.connections[type]);
                return;
            }
            person.connections[type] = createConnection(directionPoint, familyConnectionPoint, direction, connectionColor, false);
        });
    }

    updateWorkspacePositions() {
        this.#groups.forEach((group) => {
            group.parents.forEach((parent) => {
                parent.updateWorkspacePos();
            });
        });
        this.#groups.forEach((group) => {
            group.children.forEach((child) => {
                if (child instanceof Person) {
                    child.updateWorkspacePos();
                    return;
                }
                child.updateWorkspacePositions();
            });
        });
    }

    addGroup(parents, children=undefined) {
        this.#groups.push(new ParentChildGroup(parents, children, this));
    }

    static createFamily(parents, children=undefined, source=undefined, subFamilyChild=undefined) {
        const family = new Family(parents, children, subFamilyChild);

        if (source) {
            source.div.parentNode.replaceChild(family, source.div);
            family.updateWorkspacePositions();
            return family;
        }

        const graph = document.getElementById("graph");
        graph.appendChild(family.div);
        family.updateWorkspacePositions();
        return family;
    }
}

const connectionPointGap = 30;
const connectionPointLength = 10;
const connectionColor = "rgb(204, 204, 204)";

class ParentChildGroup {
    #family
    parents = [];
    children = [];
    parentsConnectionPoint;
    childrenConnectionPoint;
    #inBetweenPoint;
    #subFamilyMap = [];
    
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
            this.children.forEach((child) => {
                family.childrenDiv.appendChild(child.div);
                if (child instanceof Person) {
                    child.setFamily(family);
                    child.addGroup(this);
                    return;
                }
                if (this.#family.subFamilyChild) {
                    this.#family.subFamilyChild.addGroup(this);
                    if (!this.#subFamilyMap[child]) {
                        this.#subFamilyMap[child] = []
                        this.#subFamilyMap[child].push(this.#family.subFamilyChild);
                        return;
                    }
                    this.#subFamilyMap[child].push(this.#family.subFamilyChild);
                    return;
                }
                console.error(`Warning: Sub-family ${child} added without specified subFamilyChild.`);
            });
        }
    }
    
    getInbetweenPoint() {
        if (this.children.length === 1) {
            if (this.parents.length === 1) {
                const parentCenter = this.parents[0].connectionPoints.up.add(this.parents[0].connectionPoints.down).div(2);
                const childCenter = this.children[0].connectionPoints.up.add(this.children[0].connectionPoints.down).div(2);
                this.#inBetweenPoint = parentCenter.add(childCenter).div(2);
                return;
            }

            const childDirection = getPersonToPointDirection(this.children[0], this.parentsConnectionPoint);
            if (childDirection === "left" || childDirection === "right") {
                this.#inBetweenPoint = new Vec2(
                    (this.parentsConnectionPoint.x + this.children[0].connectionPoints[childDirection].x) / 2,
                    this.children[0].connectionPoints[childDirection].y
                )
                return;
            }
            this.#inBetweenPoint = this.parentsConnectionPoint.add(this.children[0].connectionPoints[childDirection]).div(2);
            return;
        }
        if (this.parents.length === 1) {
            const parentDirection = getPersonToPointDirection(this.parents[0], this.childrenConnectionPoint);
            if (parentDirection === "left" || parentDirection === "right") {
                this.#inBetweenPoint = new Vec2(
                    (this.childrenConnectionPoint.x + this.parents[0].connectionPoints[parentDirection].x) / 2,
                    this.parents[0].connectionPoints[parentDirection].y
                )
                return;
            }
            this.#inBetweenPoint = this.childrenConnectionPoint.add(this.parents[0].connectionPoints[parentDirection]).div(2);
            return;
        }

        this.#inBetweenPoint = this.parentsConnectionPoint.add(this.childrenConnectionPoint).div(2);
    }

    createParentConnectionPoint() {
        if (this.parents.length === 1) {
            if (this.children.length === 0) {
                return;
            }
            this.parentsConnectionPoint = new Vec2();
            const direction = "down";
            this.parentsConnectionPoint = this.parents[0].connectionPoints[direction];

            if (this.children.length === 1) {
                this.parentsConnectionPoint.updatePos = () => {
                    const direction = getPersonToPersonDirection(this.parents[0], this.children[0]);
                    this.parentsConnectionPoint.x = this.parents[0].connectionPoints[direction].x;
                    this.parentsConnectionPoint.y = this.parents[0].connectionPoints[direction].y;
                }
            }
            else {
                this.parentsConnectionPoint.updatePos = () => {
                    const direction = getPersonToPointDirection(this.parents[0], this.childrenConnectionPoint);
                    this.parentsConnectionPoint.x = this.parents[0].connectionPoints[direction].x;
                    this.parentsConnectionPoint.y = this.parents[0].connectionPoints[direction].y;
                }
            }

            this.parentsConnectionPoint.update = () => {
                this.parentsConnectionPoint.updatePos();

                this.childrenConnectionPoint.draw();
                this.parentsConnectionPoint.draw();
            }

            this.parentsConnectionPoint.draw = () => {
                this.parentsConnectionPoint.updatePos();
                const direction = (this.children.length === 1)? getPersonToPersonDirection(this.parents[0], this.children[0]) : getPersonToPointDirection(this.parents[0], this.childrenConnectionPoint);
                this.getInbetweenPoint();

                if (!this.parentsConnectionPoint.inbetweenConnection) {
                    this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false);
                    return;
                }
                this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false, this.parentsConnectionPoint.inbetweenConnection);
            }
        }
        else {   
            const x = (this.parents[0].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetWidth) / 2;
            const y = this.parents.length === 2? this.parents[0].connectionPoints.right.y : this.parents[0].connectionPoints.down.y + connectionPointGap;
            this.parentsConnectionPoint = new Vec2(x, y);
            
            this.parentsConnectionPoint.div = createConnectionDiv(this.parentsConnectionPoint);

            this.parentsConnectionPoint.draw = () => {
                this.getInbetweenPoint();
                const direction = (this.parentsConnectionPoint.sub(this.childrenConnectionPoint).y > 0)? "up" : "down";
                if (!this.parentsConnectionPoint.inbetweenConnection) {
                    this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false);
                    return;
                }
                this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false, this.parentsConnectionPoint.inbetweenConnection);
            }

            this.parentsConnectionPoint.update = () => {
                const x = (this.parents[0].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetWidth) / 2;
                const y = this.parents.length === 2? this.parents[0].connectionPoints.right.y : this.parents[0].connectionPoints.down.y + connectionPointGap;
                this.parentsConnectionPoint.x = x;
                this.parentsConnectionPoint.y = y;

                this.parentsConnectionPoint.div.style.left = `${x - connectionPointLength / 2}px`;
                this.parentsConnectionPoint.div.style.top = `${y - connectionPointLength / 2}px`;
            }
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
    }

    createChildConnectionPoint() {
        if (this.children.length === 1) {
            this.childrenConnectionPoint = new Vec2();
            const direction = getPersonToPointDirection(this.children[0], this.parentsConnectionPoint);
            this.childrenConnectionPoint = this.children[0].connectionPoints[direction];

            if (this.parents.length === 1) {
                this.childrenConnectionPoint.updatePos = () => {
                    const direction = getPersonToPersonDirection(this.children[0], this.parents[0]);
                    this.childrenConnectionPoint.x = this.children[0].connectionPoints[direction].x;
                    this.childrenConnectionPoint.y = this.children[0].connectionPoints[direction].y;
                }
            }
            else {
                this.childrenConnectionPoint.updatePos = () => {
                    const direction = getPersonToPointDirection(this.children[0], this.parentsConnectionPoint);
                    this.childrenConnectionPoint.x = this.children[0].connectionPoints[direction].x;
                    this.childrenConnectionPoint.y = this.children[0].connectionPoints[direction].y;
                }
            }

            this.childrenConnectionPoint.update = () => {
                this.childrenConnectionPoint.updatePos();

                this.childrenConnectionPoint.draw();
                this.parentsConnectionPoint.draw();
            }

            this.childrenConnectionPoint.draw = () => {
                this.childrenConnectionPoint.updatePos();
                const direction = (this.parents.length === 1)? getPersonToPersonDirection(this.children[0], this.parents[0]) : getPersonToPointDirection(this.children[0], this.parentsConnectionPoint);
                this.getInbetweenPoint();

                if (!this.childrenConnectionPoint.inbetweenConnection) {
                    this.childrenConnectionPoint.inbetweenConnection = createConnection(this.childrenConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false);
                    return;
                }
                this.childrenConnectionPoint.inbetweenConnection = createConnection(this.childrenConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false, this.childrenConnectionPoint.inbetweenConnection);
            }
        }
        else {
            let sumOfCentersX = 0;
            let total = 0;
            this.children.forEach((child) => {
                if (child instanceof Person) {
                    sumOfCentersX += child.div.offsetLeft + (child.div.offsetWidth / 2);
                    total++;
                }
                else {   
                    this.#subFamilyMap[child].forEach((_child) => {
                        sumOfCentersX += _child.div.offsetLeft + (_child.div.offsetWidth / 2);
                        total++;
                    });
                }
            });

            const x = sumOfCentersX / total;
            const y = this.children[0].div.offsetTop - connectionPointGap;
            this.childrenConnectionPoint = new Vec2(x, y);
        
            this.childrenConnectionPoint.div = createConnectionDiv(this.childrenConnectionPoint);

            this.childrenConnectionPoint.draw = () => {
                const direction = (this.childrenConnectionPoint.sub(this.parentsConnectionPoint).y > 0)? "up" : "down";
                this.getInbetweenPoint();

                if (!this.childrenConnectionPoint.inbetweenConnection) {
                    this.childrenConnectionPoint.inbetweenConnection = createConnection(this.childrenConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false);
                    return;
                }
                this.childrenConnectionPoint.inbetweenConnection = createConnection(this.childrenConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false, this.childrenConnectionPoint.inbetweenConnection);
            }

            this.childrenConnectionPoint.update = () => {
                let sumOfCentersX = 0;
                let total = 0;
                this.children.forEach((child) => {
                    if (child instanceof Person) {
                        sumOfCentersX += child.div.offsetLeft + (child.div.offsetWidth / 2);
                        total++;
                    }
                    else {   
                        this.#subFamilyMap[child].forEach((_child) => {
                            sumOfCentersX += _child.div.offsetLeft + (_child.div.offsetWidth / 2);
                            total++;
                        });
                    }
                });

                const x = sumOfCentersX / total;
                const y = this.children[0].div.offsetTop - connectionPointGap;
                this.childrenConnectionPoint.x = x;
                this.childrenConnectionPoint.y = y;

                this.childrenConnectionPoint.div.style.left = `${x - connectionPointLength / 2}px`;
                this.childrenConnectionPoint.div.style.top = `${y - connectionPointLength / 2}px`;
            }
        }

        this.childrenConnectionPoint.updateConnected = () => {
            this.children.forEach((child) => {
                if (!(child instanceof Person)) {
                    this.#subFamilyMap[child].forEach((subChild) => {
                        child.draw(subChild);
                    });
                    return;
                }
                this.#family.draw(child);
            })
            this.childrenConnectionPoint.draw();
            this.parentsConnectionPoint.draw();
        }

        this.childrenConnectionPoint.draw();
        this.parentsConnectionPoint.draw();

    }

    addParent(parent) {
        parent.marry(this.parents);
        parent.setFamily(this.#family);
        parent.addGroup(this); 
        parent.adopt(this.children);
        this.parents.push(parent);

        this.#family.parentsDiv.appendChild(parent.div);

        this.parents.forEach((parent) => {
            parent.updateWorkspacePos();
        });
    }

    addChild(child, subFamilyChild=undefined) {
        this.children.push(child);
    
        // Set family, add child to children div
        this.#family.childrenDiv.appendChild(child.div);
        if (child instanceof Person) {
            child.setFamily(this.#family);
            child.addGroup(this);
            child.getAdopted(this.parents);
            if (this.children.length === 1) {
                this.#family.updateWorkspacePositions();
                return;
            }

            this.children.forEach((child) => {
                child.updateWorkspacePos();
            });
            return;
        }
        if (subFamilyChild) {
            subFamilyChild.addGroup(this);
            if (!this.#subFamilyMap[child]) {
                this.#subFamilyMap[child] = []
                this.#subFamilyMap[child].push(subFamilyChild);
                return;
            }
            this.#subFamilyMap[child].push(subFamilyChild);
            return;
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

function getPersonToPointDirection(person, point) {
    if (point.y < person.connectionPoints.up.y) {
        return "up";
    }
    if (point.y < person.connectionPoints.down.y) {
        if (point.x < person.connectionPoints.left.x) {
            return "left";
        }
        return "right";
    }
    return "down";
}
function getPersonToPersonDirection(personA, personB) {
    if ((personA.connectionPoints.down.y >= personB.connectionPoints.up.y && personA.connectionPoints.down.y  <= personB.connectionPoints.down.y) ||
        (personA.connectionPoints.up.y <= personB.connectionPoints.down.y && personA.connectionPoints.up.y >= personB.connectionPoints.up.y)) {
        return (personA.connectionPoints.left.x > personB.connectionPoints.left.x)? "left" : "right";
    }
    return (personA.connectionPoints.up.y > personB.connectionPoints.up.y)? "up" : "down";
}