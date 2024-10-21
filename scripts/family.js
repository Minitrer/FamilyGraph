export default class Family {
    #parents = [];
    #children = [];
    #div;
    #parents_div;
    #children_div;

    constructor(parents=undefined, children=undefined) {
        
        // Create divs
        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "family");
        this.#parents_div = document.createElement("div");
        this.#parents_div.setAttribute("class", "parents");
        this.#children_div = document.createElement("div");
        this.#children_div.setAttribute("class", "children");
        
        if (parents) {
            this.#parents = parents;

            // Set family, add parents to parent div, marry parents together and adopt children
            for (let i = 0, length = this.#parents.length; i < length; i++) {
                this.#parents[i].SetFamily(this);
                this.#parents_div.appendChild(this.#parents[i].div);
                this.#parents[i].Adopt(this.#children);
                if (i === length - 1) {
                    break;
                }
                this.#parents[i].Marry(this.#parents.slice(i + 1));
            }
        }
        if (children) {
            this.#children = children;

            // Set family, add children to children div
            this.#children.forEach(child => {
                this.#children_div.appendChild(child.div);
                if (typeof child === "Node") {
                    child.SetFamily(this);
                }
            });
        }

        // Append divs
        this.#div.appendChild(this.#parents_div);
        this.#div.appendChild(this.#children_div);
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
    get parents_div() {
        return this.#parents_div
    }
    get children_div() {
        return this.#children_div
    }
}