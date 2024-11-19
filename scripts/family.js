import createConnection from "./connection.js";
import Person from "./person.js";
import Vec2 from "./vec2.js";

export let FAMILIES = [];

export default class Family {
    #groups = [];
    #div;
    #parentsDiv;
    #childrenDiv;

    constructor(parents, children=undefined, subFamilyMap=undefined) {
        // subFamilyMap is a dictionary with subfamilies's ids as keys and one of their parents as values

        FAMILIES.push(this);
        
        // Create divs
        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "family");
        this.#div.id = `family ${this.id}`;
        this.#parentsDiv = document.createElement("div");
        this.#parentsDiv.setAttribute("class", "parents");
        this.#childrenDiv = document.createElement("div");
        this.#childrenDiv.setAttribute("class", "children");
        
        this.#groups[0] = new ParentChildGroup(parents, children, this, subFamilyMap);

        // Append divs
        this.#div.appendChild(this.#parentsDiv);
        this.#div.appendChild(this.#childrenDiv);
    }

    get id() {
        return FAMILIES.indexOf(this);
    }
    get groups() {
        return this.#groups;
    }
    get div() {
        return this.#div;
    }
    get parentsDiv() {
        return this.#parentsDiv;
    }
    get childrenDiv() {
        return this.#childrenDiv;
    }
    

    draw(person) {
        person.groups.forEach((group, i) => {
            let type;
            function drawConnections(parameters) {
                if (parameters.partyA.length === 1) {
                    if (!parameters.connectionPointA) {
                        parameters.createConnectionPointA();
                        return;
                    }
                    parameters.connectionPointA.update();
                    return;
                }
                if (!parameters.connectionPointA) {
                    parameters.createConnectionPointA();
                }
                // Check if recently added new person
                else if (!parameters.connectionPointA.div.transformPos) {
                    parameters.connectionPointA.inbetweenConnection.remove();
                    parameters.connectionPointA.inbetweenConnection = undefined;
                    parameters.createConnectionPointA();
                    parameters.connectionPointB.update();
                    if (parameters.partyB.length === 2 && parameters.partyA.length === 1) {
                        parameters.connectionPointB.inbetweenConnection.remove();
                        parameters.connectionPointB.inbetweenConnection = undefined;
                        parameters.createConnectionPointB();
                    }
                }
                const familyConnectionPoint = parameters.connectionPointA;
                // Determine valid direction
                const direction = getPersonToPointDirection(person, familyConnectionPoint);
                const directionPoint = person.connectionPoints[direction];

                if (person.connections[type]) {
                    createConnection(directionPoint, familyConnectionPoint, direction, connectionColor, false, person.connections[type]);
                    return;
                }
                person.connections[type] = createConnection(directionPoint, familyConnectionPoint, direction, connectionColor, false);
            }
            if (group.parents.includes(person)) {                
                type = `parents ${i}`;
                const parentParameters = {
                    get partyA() {
                        return group.parents;
                    },
                    get partyB() {
                        return group.children;
                    },

                    get connectionPointA() {
                        return group.parentsConnectionPoint;
                    },
                    get connectionPointB() {
                        return group.childrenConnectionPoint;
                    },

                    createConnectionPointA() { group.createParentConnectionPoint() },
                    createConnectionPointB() { group.createChildConnectionPoint() },
                }
                drawConnections(parentParameters);
                return;
            }
            type = `children ${i}`;
            const childParameters = {
                get partyA() {
                    return group.children;
                },
                get partyB() {
                    return group.parents;
                },

                get connectionPointA() {
                    return group.childrenConnectionPoint;
                },
                get connectionPointB() {
                    return group.parentsConnectionPoint;
                },

                createConnectionPointA() { group.createChildConnectionPoint() },
                createConnectionPointB() { group.createParentConnectionPoint() },
            }
            drawConnections(childParameters);
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
            });
        });
        // Update subfamilies
        const subFamiliesDivs = this.#childrenDiv.getElementsByClassName("family");
        for (const familyDiv of subFamiliesDivs) {
            const index = Family.getIDFromDiv(familyDiv);
            FAMILIES[index].updateWorkspacePositions();
        }
    }

    updateConnectionPoints() {
        this.#groups.forEach((group) => {
            if (group.parentsConnectionPoint) {
                group.parentsConnectionPoint.update();
            }
            if (group.childrenConnectionPoint) {
                group.childrenConnectionPoint.update();
            }
        });
    }

    addGroup(parents, children=undefined, subFamilyChildren=undefined) {
        this.#groups.push(new ParentChildGroup(parents, children, this, subFamilyChildren));
        Family.updateAll();
    }

    delete() {
        for (let i = this.id + 1, length = FAMILIES.length; i < length; i++) {
            FAMILIES[i].div.id = `family ${i - 1}`;

            // Correct SubFamilyMaps
            if (FAMILIES[i].div.parentElement.className === "children") {
                const largerFamilyID = Family.getIDFromDiv(FAMILIES[i].div.parentElement.parentElement);
                if (largerFamilyID === this.id) {
                    continue;
                }
                FAMILIES[largerFamilyID].groups.forEach((group) => {
                    if (group.subFamilyMap[`${FAMILIES[i].id}`]) {
                        group.subFamilyMap[`${FAMILIES[i].id - 1}`] = group.subFamilyMap[`${FAMILIES[i].id}`];
                        delete group.subFamilyMap[`${FAMILIES[i].id}`];
                    }
                });
            }
        }
        FAMILIES.splice(this.id, 1);

        this.#parentsDiv.remove();
        this.#childrenDiv.remove();
        if (this.#childrenDiv.childElementCount === 1 && this.#childrenDiv.firstElementChild.className === "family") {
            this.#div.replaceWith(this.#childrenDiv.firstElementChild);
        }
        else {
            this.#div.remove();
        }
        
        Family.updateAll();
    }

    static updateAll() {
        const largestFamilyIndex = Family.getIDFromDiv(graph.firstElementChild);
        FAMILIES[largestFamilyIndex].updateWorkspacePositions();
        FAMILIES.forEach((_family) => {
            _family.updateConnectionPoints();
        });
    }

    static createFamily(parents, children=undefined, source=undefined, subFamilyMap=undefined) {
        const graph = document.getElementById("graph");
        let _parentElement;
        let family;
        if (!source) {
            _parentElement = graph;
            family = new Family(parents, children, subFamilyMap);
        }
        else {
            _parentElement = source.div.parentElement;
            family = new Family(parents, children, subFamilyMap);
            source.groups.forEach((group) => {
                if (group.children.includes(source)) {
                    group.convertChildToFamily(source, family);
                }
            });
        }
        
        _parentElement.appendChild(family.div);
        Family.updateAll();
        return family;
    }

    static getIDFromDiv(div) {
        return Number(div.id.substring(7));
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
    #subFamilyMap = {};
    
    constructor(parents, children, family, subFamilyMap=undefined) {
        this.parents = parents;
        this.#family = family;

        // Set family, add parents to parent div, marry parents together and adopt children
        for (let i = 0, length = this.parents.length; i < length; i++) {
            this.parents[i].setFamily(family);
            this.parents[i].addGroup(this); 
            family.parentsDiv.appendChild(this.parents[i].div);
            if (i >= length - 1) {
                continue;
            }
            this.parents[i].marry(this.parents.slice(i + 1));
        }

        if (children) {
            this.children = children;
            this.#subFamilyMap = subFamilyMap;
    
            // Set family, add children to children div
            this.children.forEach((child) => {
                family.childrenDiv.appendChild(child.div);
                if (child instanceof Person) {
                    child.getAdopted(parents);
                    child.setFamily(family);
                    child.addGroup(this);
                    return;
                }
                if (subFamilyMap[`${child.id}`]) {
                    subFamilyMap[`${child.id}`].getAdopted(parents);
                    subFamilyMap[`${child.id}`].addGroup(this);
                    return;
                }
                console.error(`Warning: Sub-family ${child} added without specified subFamilyChild.`);
            });
        }
    }

    get subFamilyMap() {
        return this.#subFamilyMap;
    }
    
    getInbetweenPoint() {
        if (this.children.length === 1 && (this.children[0] instanceof Person || this.#subFamilyMap[`${this.children[0].id}`])) {
            const singleChild = (this.children[0] instanceof Person)? this.children[0] : this.#subFamilyMap[`${this.children[0].id}`];
            if (this.parents.length === 1) {
                const parentCenter = this.parents[0].connectionPoints.up.add(this.parents[0].connectionPoints.down).div(2);
                const childCenter = singleChild.connectionPoints.up.add(singleChild.connectionPoints.down).div(2);
                this.#inBetweenPoint = parentCenter.add(childCenter).div(2);
                return;
            }

            const childDirection = getPersonToPointDirection(singleChild, this.parentsConnectionPoint);
            if (childDirection === "left" || childDirection === "right") {
                this.#inBetweenPoint = new Vec2(
                    (this.parentsConnectionPoint.x + singleChild.connectionPoints[childDirection].x) / 2,
                    singleChild.connectionPoints[childDirection].y
                )
                return;
            }
            this.#inBetweenPoint = this.parentsConnectionPoint.add(singleChild.connectionPoints[childDirection]).div(2);
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

            if (this.children.length === 1 && (this.children[0] instanceof Person || this.#subFamilyMap[`${this.children[0].id}`])) {
                const singleChild = (this.children[0] instanceof Person)? this.children[0] : this.#subFamilyMap[`${this.children[0].id}`];
                this.parentsConnectionPoint.updatePos = () => {
                    const direction = getPersonToPersonDirection(this.parents[0], singleChild);
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
                let direction;
                if (this.children.length === 1 && (this.children[0] instanceof Person || this.#subFamilyMap[`${this.children[0].id}`])) {
                    const singleChild = (this.children[0] instanceof Person)? this.children[0] : this.#subFamilyMap[`${this.children[0].id}`];
                    direction = getPersonToPersonDirection(this.parents[0], singleChild);
                }
                else {
                    direction = getPersonToPointDirection(this.parents[0], this.childrenConnectionPoint);
                }
                this.getInbetweenPoint();

                if (!this.parentsConnectionPoint.inbetweenConnection) {
                    this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false);
                    return;
                }
                this.parentsConnectionPoint.inbetweenConnection = createConnection(this.parentsConnectionPoint, this.#inBetweenPoint, direction, connectionColor, false, this.parentsConnectionPoint.inbetweenConnection);
            }
        }
        else {   
            let x;
            if (this.parents.length === 2) {
                x = (this.parents[0].div.offsetLeft + this.parents[0].div.offsetWidth + this.parents[1].div.offsetLeft) / 2;
            }
            else {
                x = (this.parents[0].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetWidth) / 2;
            }
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
                let x;
                if (this.parents.length === 2) {
                    x = (this.parents[0].div.offsetLeft + this.parents[0].div.offsetWidth + this.parents[1].div.offsetLeft) / 2;
                }
                else {
                    x = (this.parents[0].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetLeft + this.parents[(this.parents.length - 1)].div.offsetWidth) / 2;
                }
                const y = this.parents.length === 2? this.parents[0].connectionPoints.right.y : this.parents[0].connectionPoints.down.y + connectionPointGap;

                this.parentsConnectionPoint.x = x + this.parentsConnectionPoint.div.transformPos.x;
                this.parentsConnectionPoint.y = y + this.parentsConnectionPoint.div.transformPos.y;

                this.parentsConnectionPoint.div.style.left = `${x - connectionPointLength / 2}px`;
                this.parentsConnectionPoint.div.style.top = `${y - connectionPointLength / 2}px`;

                this.parentsConnectionPoint.updateConnected();
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
        if (this.children.length === 1 && (this.children[0] instanceof Person || this.#subFamilyMap[`${this.children[0].id}`])) {
            if (this.parents.length === 0) {
                return;
            }
            const singleChild = (this.children[0] instanceof Person)? this.children[0] : this.#subFamilyMap[`${this.children[0].id}`];

            this.childrenConnectionPoint = new Vec2();

            const direction = getPersonToPointDirection(singleChild, this.parentsConnectionPoint);
            this.childrenConnectionPoint = singleChild.connectionPoints[direction];

            if (this.parents.length === 1) {
                this.childrenConnectionPoint.updatePos = () => {
                    const direction = getPersonToPersonDirection(singleChild, this.parents[0]);
                    this.childrenConnectionPoint.x = singleChild.connectionPoints[direction].x;
                    this.childrenConnectionPoint.y = singleChild.connectionPoints[direction].y;
                }
            }
            else {
                this.childrenConnectionPoint.updatePos = () => {
                    const direction = getPersonToPointDirection(singleChild, this.parentsConnectionPoint);
                    this.childrenConnectionPoint.x = singleChild.connectionPoints[direction].x;
                    this.childrenConnectionPoint.y = singleChild.connectionPoints[direction].y;
                }
            }

            this.childrenConnectionPoint.update = () => {
                this.childrenConnectionPoint.updatePos();

                this.childrenConnectionPoint.draw();
                this.parentsConnectionPoint.draw();
            }

            this.childrenConnectionPoint.draw = () => {
                this.childrenConnectionPoint.updatePos();
                const direction = (this.parents.length === 1)? getPersonToPersonDirection(singleChild, this.parents[0]) : getPersonToPointDirection(singleChild, this.parentsConnectionPoint);
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
                    const subFamilyChild = this.#subFamilyMap[`${child.id}`]
                    sumOfCentersX += subFamilyChild.div.offsetLeft + (subFamilyChild.div.offsetWidth / 2);
                    total++;
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
                this.children.forEach((_child) => {
                    if (_child instanceof Person) {
                        sumOfCentersX += _child.div.offsetLeft + (_child.div.offsetWidth / 2);
                        total++;
                    }
                    else {   
                        const subFamilyChild = this.#subFamilyMap[`${_child.id}`]
                        sumOfCentersX += subFamilyChild.div.offsetLeft + (subFamilyChild.div.offsetWidth / 2);
                        total++;
                    }
                });

                const x = sumOfCentersX / total;
                const y = this.children[0].div.offsetTop - connectionPointGap;
                this.childrenConnectionPoint.x = x + this.childrenConnectionPoint.div.transformPos.x;
                this.childrenConnectionPoint.y = y + this.childrenConnectionPoint.div.transformPos.y;

                this.childrenConnectionPoint.div.style.left = `${x - connectionPointLength / 2}px`;
                this.childrenConnectionPoint.div.style.top = `${y - connectionPointLength / 2}px`;

                this.childrenConnectionPoint.updateConnected();
            }
        }

        this.childrenConnectionPoint.updateConnected = () => {
            this.children.forEach((child) => {
                if (!(child instanceof Person)) {
                    child.draw(this.#subFamilyMap[`${child.id}`]);
                    return;
                }
                this.#family.draw(child);
            })
            if (this.parents.length > 0) {
                this.childrenConnectionPoint.draw();
                this.parentsConnectionPoint.draw();
            }
        }

        if (this.parents.length > 0) {
            this.childrenConnectionPoint.draw();
            this.parentsConnectionPoint.draw();
        }
    }

    addParent(parent) {
        parent.marry(this.parents);
        parent.setFamily(this.#family);
        parent.addGroup(this); 

        this.children.forEach((child) => {
            if (child instanceof Person) {
                parent.adopt(child);
                return;
            }
            parent.adopt(this.#subFamilyMap[`${child.id}`]);
        });
        this.parents.push(parent);

        if (this.parents.length !== 1) {
            this.parents[this.parents.length - 2].div.after(parent.div);
        }
        else {
            this.#family.parentsDiv.appendChild(parent.div);
        }

        Family.updateAll();
    }

    addChild(child, subFamilyChild=undefined) {
        this.children.push(child);
    
        // Set family, add child to children div
        this.#family.childrenDiv.appendChild(child.div);
        
        if (child instanceof Person) {
            child.setFamily(this.#family);
            child.addGroup(this);
            child.getAdopted(this.parents);

            Family.updateAll();
            return;
        }
        if (subFamilyChild) {
            subFamilyChild.addGroup(this);
            subFamilyChild.getAdopted(this.parents);
            this.#subFamilyMap[`${child.id}`] = subFamilyChild;

            Family.updateAll();

            return;
        }
        console.error(`Warning: Sub-family ${child} added without specified subFamilyChild.`);
    }

    remove(person) {
        const parentIndex = this.parents.indexOf(person);
        if (parentIndex > -1) {
            this.parents.splice(parentIndex, 1);

            if (this.parents.length === 0 && (this.children.length === 0 || (this.children.length === 1 && this.children[0] instanceof Family))) {
                this.delete();
                return;
            }
            if (this.parents.length < 3) {
                this.parentsConnectionPoint = deleteConnectionPoint(this.parentsConnectionPoint);

                this.parents.forEach((parent) => {
                    const index = parent.groups.indexOf(this)
                    parent.connections[`parents ${index}`].remove();
                    delete parent.connections[`parents ${index}`];
                });

                if (this.parents.length > 0) {
                    this.createParentConnectionPoint();
                }
                else {
                    this.childrenConnectionPoint = deleteConnectionPoint(this.childrenConnectionPoint);
                }
            }
            return;
        }
        const childIndex = (this.children.indexOf(person) > -1)? this.children.indexOf(person) : this.children.indexOf(person.family);
        this.children.splice(childIndex, 1);

        if (this.parents.length === 0 && this.children.length === 0) {
            this.delete();
            return;
        }
        if (this.children.length < 2) {
            this.childrenConnectionPoint = deleteConnectionPoint(this.childrenConnectionPoint);

            if (this.children.length > 0) {
                const singleChild = (this.children[0] instanceof Person)? this.children[0] : this.#subFamilyMap[`${this.children[0].id}`];
                const index = singleChild.groups.indexOf(this);
                singleChild.connections[`children ${index}`].remove();
                delete singleChild.connections[`children ${index}`];

                this.createChildConnectionPoint();
            }
            else {
                this.parentsConnectionPoint = deleteConnectionPoint(this.parentsConnectionPoint);
            }
        }
    }

    delete() {
        this.children.forEach((child) => {
            if (child instanceof Family) {
                const subChild = this.#subFamilyMap[`${child.id}`];
                const index = subChild.groups.indexOf(this);
                if (subChild.connections[`children ${index}`]) {
                    subChild.connections[`children ${index}`].remove();
                    delete subChild.connections[`children ${index}`];
                }
                subChild.groups.splice(index, 1);
                return;
            }

            const index = child.groups.indexOf(this);
            if (child.connections[`children ${index}`]) {
                child.connections[`children ${index}`].remove();
                delete child.connections[`children ${index}`];
            }
            child.groups.splice(index, 1);
        });

        if (this.parentsConnectionPoint) {
            this.parentsConnectionPoint = deleteConnectionPoint(this.parentsConnectionPoint);
        }

        if (this.childrenConnectionPoint) {
            this.childrenConnectionPoint = deleteConnectionPoint(this.childrenConnectionPoint);
        }

        this.#family.groups.splice(this.#family.groups.indexOf(this), 1);

        const replaceCondition = this.#family.parentsDiv.childElementCount === 0 && this.#family.childrenDiv.childElementCount === 1 && this.#family.childrenDiv.firstElementChild.className === "family";
        if (replaceCondition || this.#family.groups.length === 0) {
            this.#family.delete();
            return;
        }
        Family.updateAll();
    }

    convertChildToFamily(child, family) {
        const index = this.children.indexOf(child);

        this.children[index] = family;

        if (!this.#subFamilyMap) {
            this.#subFamilyMap = {}
            this.#subFamilyMap[`${family.id}`] = child;
            return;
        }
        this.#subFamilyMap[`${family.id}`] = child;
        return;
    }
}

function deleteConnectionPoint(point) {
    if (point.inbetweenConnection) {
        point.inbetweenConnection.remove();
        delete point.inbetweenConnection;
    }
    if (point.div.transformPos) {
        point.div.remove();
    }
    return undefined;
}

function createConnectionDiv(p) {
    const workspace = document.getElementById("workspace");
    const div = document.createElement("div");
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
    if (point.y >= person.connectionPoints.down.y) {
        return "down";
    }
    if (point.x < person.connectionPoints.left.x) {
        return "left";
    }
    return "right";
}
function getPersonToPersonDirection(personA, personB) {
    if ((personA.connectionPoints.down.y >= personB.connectionPoints.up.y && personA.connectionPoints.down.y  <= personB.connectionPoints.down.y) ||
        (personA.connectionPoints.up.y <= personB.connectionPoints.down.y && personA.connectionPoints.up.y >= personB.connectionPoints.up.y)) {
        return (personA.connectionPoints.left.x > personB.connectionPoints.left.x)? "left" : "right";
    }
    return (personA.connectionPoints.up.y > personB.connectionPoints.up.y)? "up" : "down";
}