export default class Family {
    #parents = [];
    #children = [];
    #div;
    #parentsDiv;
    #childrenDiv;
    #parent

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
                if (child instanceof Node) {
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
        // TODO:
        // Get person connection points
        // Calculate relationship point
        // Create connection
        // Assign person's connection
    }
}