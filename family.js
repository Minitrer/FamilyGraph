export default class Family {
    #parents = [];
    #children = [];
    #div;
    #parents_div;
    #children_div;

    constructor(parents=undefined, children=undefined) {
        if (parents) {
            this.#parents = parents;
        }
        if (children) {
            this.#children = children;
        }

        // Create divs
        this.#div = document.createElement("div");
        this.#div.setAttribute("class", "family");
        this.#parents_div = document.createElement("div");
        this.#parents_div.setAttribute("class", "parents");
        this.#children_div = document.createElement("div");
        this.#children_div.setAttribute("class", "children");

        // Add parents to parent div, Marry parents together and adopt children
        for (let i = 0, length = this.#parents.length(); i < length; i++) {
            this.#parents_div.appendChild(this.#parents[i]);
            this.#parents[i].Adopt(this.#children);
            if (i === length - 1) {
                break;
            }
            this.#parents[i].Marry(this.#parents.slice(i + 1));
        }
        // Add children to children div
        this.#children.forEach(child => {
            this.#children_div.appendChild(child.div);
        })
    }
}