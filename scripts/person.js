import Vec2 from "./vec2.js";
let personCount = 0;

export default class Person {
    #id;
    #family;
    #spouse = [];
    #parents = [];
    #children = [];
    #div;
    #transformPos = new Vec2();
    #workspacePos = new Vec2();
    #connectionPoints = {
        "up": new Vec2(),
        "down" : new Vec2(),
        "left" : new Vec2(),
        "right" : new Vec2()
    }

    constructor(name="Name", family=undefined, spouse=undefined, parents=undefined, children=undefined) {
        this.#id = personCount;
        personCount++;

        if (family) {
            this.#family = family;
        }
        if (spouse) {
            this.#spouse = spouse;
        }
        if (parents) {
            this.#parents = parents;
        }
        if (children) {
            this.#children = children;
        }

        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "person");

        const name_element = document.createElement("h1");
        name_element.textContent = name;
        name_element.setAttribute("class", "name")
        this.#div.appendChild(name_element);

        this.#div.addEventListener("mousedown", (e) => {
            e.preventDefault();
            return;
        });

        // Set up properties to make the div draggable
        this.#div.style.setProperty("--pos-x", 0);
        this.#div.style.setProperty("--pos-y", 0);

        this.#div.style.transform = "translate(calc(var(--pos-x) * 1px), calc(var(--pos-y) * 1px))";
        this.#div.person = this;

        // Position relative to the workspace, needed for connection creation
        this.#div.workspacePos = new Vec2(
            this.#div.offsetLeft,
            this.#div.offsetTop
        );
    }
    
    get name() {
        return this.#div.firstElementChild.textContent;
    }
    get family() {
        return this.#family;
    }
    get spouse() {
        return this.#spouse;
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

        this.#family.draw(this)
    }

    setFamily(family) {
        this.#family = family;
    }
    // Each of these methods update the instance's property
    // They also update the target's corresponding property if the method wasn't called internally
    adopt(child, internal=false) {
        if (this.#children.includes(child)) {
            return false;
        }

        if (Array.isArray(child)) {
            this.#children.push(...child);

            if (internal) {
                return true;
            }
            this.#children.forEach(_child => {
                _child.GetAdopted(this, true);
            });
            return true;
        }
        this.#children.push(child);

        if (internal) {
            return true;
        }
        child.GetAdopted(this, true);
        return true;
    }
    getAdopted(parent, internal=false) {
        if (this.#parents.includes(parent)) {
            return false;
        }

        if (Array.isArray(parent)) {
            this.#parents.push(...parent);

            if (internal) {
                return true;
            }
            this.#parents.forEach(_parent => {
                _parent.Adopt(this, true);
            });
            return true;
        }
        this.#parents.push(parent);

        if (internal) {
            return true;
        }
        parent.Adopt(this, true);
        return true;
    }
    orphan(child=undefined, internal=false) {
        if (child) {
            const index = this.#children.indexOf(child);
            if (index < 0) {
                return false;
            }

            this.#children.splice(index, 1);

            if (internal) {
                return true;
            }
            child.OrphanSelf(this, true);
            return true;
        }

        
        if (!internal) {
            this.#children.forEach(_child => {
                _child.OrphanSelf(this, true);
            });
        }
        
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

            if (internal) {
                return true;
            }
            parent.Orphan(this, true);
            return true;
        }

        
        if (!internal) {
            this.#parents.forEach(_parent => {
                _parent.Orphan(this, true);
            });
        }
        
        this.#parents = [];
        return true;
    }

    marry(spouse, internal=false) {
        if (this.#spouse.includes(spouse)) {
            return false;
        }
        if (Array.isArray(spouse)) {

            this.#spouse.push(...spouse);

            if (internal) {
                return true;
            }
            spouse.forEach(_spouse => {
                _spouse.marry(this, true);
            });
            return true;
        }

        this.#spouse.push(spouse);

        if (internal) {
            return true;
        }
        spouse.marry(this, true);
        return true;
    }
    divorce(spouse=undefined, internal=false) {
        if (spouse) {
            const index = this.#spouse.indexOf(spouse);
            if (index < 0) {
                return false;
            }

            this.#spouse.splice(index, 1);

            if (internal) {
                return true;
            }
            spouse.Divorce(this, true);
            return true;
        }

        
        if (!internal) {
            spouse.forEach(_spouse => {
                _spouse.Divorce(this, true);
            });
        }

        this.#spouse = [];
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
}