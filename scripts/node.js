export default class Node {
    #name;
    #family;
    #spouse = [];
    #parents = [];
    #children = [];
    #element;

    constructor(family, name="Name", spouse=undefined, parents=undefined, children=undefined) {
        this.#name = name;
        this.#family = family;
        if (spouse) {
            this.#spouse = spouse;
        }
        if (parents) {
            this.#parents = parents;
        }
        if (children) {
            this.#children = children;
        }

        this.#element = document.createElement("div");
        this.#element.setAttribute("class", "node");

        const name_element = document.createElement("h1");
        name_element.appendChild(document.createTextNode(this.#name));
        name_element.setAttribute("class", "name")
        this.#element.appendChild(name_element);
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
    get element() {
        return this.#element;
    }

    AddParent(parent) {
        if (this.#parents.includes(parent)) {
            return false;
        }
        this.#parents.push(parent);
        return true;
    }
    OrphanSelf(parent=undefined) {
        if (parent) {
            const index = this.#parents.indexOf(parent);
            if (index < 0) {
                return false;
            }
            this.#parents.splice(index, 1);
            return true;
        }
        this.#parents = [];
        return true;
    }
    Orphan(child=undefined) {
        if (child) {
            const index = this.#children.indexOf(child);
            if (index < 0) {
                return false;
            }
            this.#children.splice(index, 1);
            return true;
        }
        this.#children = [];
        return true;
    }
    Marry(spouse) {
        if (this.#spouse.includes(spouse)) {
            return false;
        }
        this.#spouse.push(spouse);
        return true;
    }
    Divorce(spouse=undefined) {
        if (spouse) {
            const index = this.#spouse.indexOf(spouse);
            if (index < 0) {
                return false;
            }
            this.#spouse.splice(index, 1);
            return true;
        }
        this.#spouse = [];
    }
}