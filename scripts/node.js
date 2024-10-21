export default class Node {
    #name;
    #family;
    #spouse = [];
    #parents = [];
    #children = [];
    #div;

    constructor(name="Name", family=undefined, spouse=undefined, parents=undefined, children=undefined) {
        this.#name = name;
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
        this.#div.setAttribute("class", "node");

        const name_element = document.createElement("h1");
        name_element.appendChild(document.createTextNode(this.#name));
        name_element.setAttribute("class", "name")
        this.#div.appendChild(name_element);
    }
    
    get name() {
        return this.#name;
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

    SetFamily(family) {
        this.#family = family;
    }
    // Each of these methods update the instance's property
    // They also update the target's corresponding property if the method wasn't called internally
    Adopt(child, internal=false) {
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
    GetAdopted(parent, internal=false) {
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
    Orphan(child=undefined, internal=false) {
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
    OrphanSelf(parent=undefined, internal=false) {
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

    Marry(spouse, internal=false) {
        if (this.#spouse.includes(spouse)) {
            return false;
        }
        if (Array.isArray(spouse)) {

            this.#spouse.push(...spouse);

            if (internal) {
                return true;
            }
            spouse.forEach(_spouse => {
                _spouse.Marry(this, true);
            });
            return true;
        }

        this.#spouse.push(spouse);

        if (internal) {
            return true;
        }
        spouse.Marry(this, true);
        return true;
    }
    Divorce(spouse=undefined, internal=false) {
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
}