import { PEOPLE } from "./person.js";

class Noun  {
    static Spouce = Object.freeze({
        male: "husband",
        neutral: "spouce",
        female: "wife",
    });
    static Child = Object.freeze({
        male: "son",
        neutral: "child",
        female: "daughter",
    });
    static Parent = Object.freeze({
        male: "father",
        neutral: "parent",
        female: "mother",
    });
    static Sibling = Object.freeze({
        male: "brother",
        neutral: "sibling",
        female: "sister",
    });
    // Pibling = Parent's siblings e.g. Aunts and Uncles
    static Pibling = Object.freeze({
        male: "uncle",
        neutral: "pibling",
        female: "aunt",
    });
    // Nibling = Sibling's children e.g. Nieces and Nephews
    static Nibling = Object.freeze({
        male: "nephew",
        neutral: "nibling",
        female: "niece",
    });
    // TODO: Add a way to calculate counsin numbers and degrees of seperation 
    static Cousin = Object.freeze({
        male: "cousin",
        neutral: "cousin",
        female: "cousin",
    });
}

export default class Relationship {
    #type;
    #person;
    #GCount;
    #prefix;
    #suffix;
    #text;

    #cousinNumber;
    #cousinSeperation;

    constructor (type, person, GCount=0, prefix="", suffix="", cousinNumber=0, cousinSeperation=0) {
        this.type = type;
        this.#person = person;
        this.GCount = GCount;
        this.#prefix = prefix;
        this.#suffix = suffix;
        
        this.#cousinNumber = cousinNumber;
        this.cousinSeperation = cousinSeperation;
        if (!this.#text) {
            this.#text = () => `${this.#prefix}${Noun[this.#type][this.#person.gender]}${this.#suffix}`;
        }
    }

    get text() {
        return this.#text();
    }
    get GCount() {
        return this.#GCount;
    }
    set GCount(count) {
        this.#GCount = count;

        if (count > 0) {
            this.#text = () => `${"Great ".repeat(this.#GCount - 1)}${this.#prefix}Grand${Noun[this.#type][this.#person.gender]}${this.#suffix}`;
        }
    }
    get type() {
        return this.#type;
    }
    set type(type) {
        this.#type = type;
        if (type !== "Cousin") {
            return;
        }

        if (this.#cousinSeperation > 0) {
            this.#text = () => `${getOrdinal(this.#cousinNumber)} ${this.#prefix}${Noun.Cousin[this.#person.gender]}${this.#suffix} ${getAdverbial(this.#cousinSeperation)} removed`;
            return;
        }
        this.#text = () => `${getOrdinal(this.#cousinNumber)} ${this.#prefix}${Noun.Cousin[this.#person.gender]}${this.#suffix}`;
    }
    get cousinSeperation() {
        return this.#cousinSeperation
    }
    set cousinSeperation(number) {
        this.#cousinSeperation = number;
        
        if (number > 0) {
            this.#text = () => `${getOrdinal(this.#cousinNumber)} ${this.#prefix}${Noun.Cousin[this.#person.gender]}${this.#suffix} ${getAdverbial(this.#cousinSeperation)} removed`;
            return;
        }
        if (this.#type === "Cousin") {
            this.#text = () => `${getOrdinal(this.#cousinNumber)} ${this.#prefix}${Noun.Cousin[this.#person.gender]}${this.#suffix}`;
        }
    }

    addGreat(addAmount=1) {
        this.GCount += addAmount;
        return this;
    }
    addCousinNumber(addAmount=1) {
        this.#cousinNumber += addAmount;
        return this;
    }
    addCousinSeperation(addAmount=1) {
        this.cousinSeperation += addAmount;
        return this;
    }
    setInLaw(isInLaw=true) {
        this.#suffix = isInLaw? "-in-law" : "";
        return this;
    }
    setStep(isStep=true) {
        this.#prefix = isStep? "Step-" : "";
        return this;
    }
    copy(type=this.#type, person=this.#person, GCount=this.#GCount, prefix=this.#prefix, suffix=this.#suffix, cousinNumber=this.#cousinNumber, cousinSeperation=this.#cousinSeperation) {
        return new Relationship(type, person, GCount, prefix, suffix, cousinNumber, cousinSeperation);
    }
    static setRelationships(from, to, type) {
        to.relationships.set(from.id, new Relationship(type, from));
        switch (type) {
            case "Parent":
                for (const [id, relationship] of from.relationships) {
                    if (to.relationships.has(id) || id === to.id) {
                        continue;
                    }

                    switch (relationship.type) {
                        case "Child":
                            if (relationship.GCount > 0) {
                                to.relationships.set(id, new Relationship("Nibling", PEOPLE[id], relationship.GCount - 1));
                                PEOPLE[id].relationships.set(to.id, new Relationship("Pibling", to, relationship.GCount - 1));
                                continue;    
                            }
                            to.relationships.set(id, new Relationship("Sibling", PEOPLE[id]));
                            PEOPLE[id].relationships.set(to.id, new Relationship("Sibling", to));
                            continue;
                        case "Sibling":
                            to.relationships.set(id, new Relationship("Pibling", PEOPLE[id]));
                            PEOPLE[id].relationships.set(to.id, new Relationship("Nibling", to)); 
                            continue;
                        case "Pibling":
                            to.relationships.set(id, relationship.copy("Pibling", PEOPLE[id], relationship.GCount + 1));
                            const otherRelationship = PEOPLE[id].relationships.get(from.id)
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Nibling", to));
                            continue;
                        case "Nibling": {
                            if (relationship.GCount > 0) {
                                const seperationAmount = relationship.GCount;
                                to.relationships.set(id, new Relationship("Cousin", PEOPLE[id], 0, "", "", 1, seperationAmount));
                                PEOPLE[id].relationships.set(to.id, new Relationship("Cousin", to, 0, "", "", 1, seperationAmount));
                                continue;
                            }
                            to.relationships.set(id, new Relationship("Cousin", PEOPLE[id], 0, "", "", 1));
                            PEOPLE[id].relationships.set(to.id, new Relationship("Cousin", to, 0, "", "", 1));
                            continue;
                        }
                        case "Parent": {
                            to.relationships.set(id, relationship.copy("Parent", PEOPLE[id], relationship.GCount + 1));
                            const otherRelationship = PEOPLE[id].relationships.get(from.id);
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Child", to, otherRelationship.GCount + 1));
                            continue;
                        }
                        case "Cousin":
                            if (relationship.cousinSeperation === 0) {
                                to.relationships.set(id, relationship.copy("Cousin", PEOPLE[id]).addCousinSeperation());
                                PEOPLE[id].relationships.set(to.id, relationship.copy("Cousin", to).addCousinSeperation());
                                continue;
                            }
                            // We can see whether the parent is in an older generation by checking the cousin's parents, seeing if one of them is also the parent's cousin 
                            // and comparing the seperations, or if there's no cousins to be found
                            let isParentHigher = false;
                            for (const parent of PEOPLE[id].parents) {
                                const parentRelationship = from.relationships.get(parent.id);
                                if (parentRelationship.type !== "Cousin") {
                                    continue;
                                }
                                
                                if (parentRelationship.cousinSeperation > relationship.cousinSeperation) {
                                    break;
                                }
                                isParentHigher = true;
                                break;
                            }
                            if (isParentHigher) {
                                to.relationships.set(id, relationship.copy("Cousin", PEOPLE[id])
                                    .addCousinSeperation(-1)
                                    .addCousinNumber());
                                PEOPLE[id].relationships.set(to.id, relationship.copy("Cousin", to)
                                    .addCousinSeperation(-1)
                                    .addCousinNumber());
                                continue;
                            }
                            // Cousin is higher
                            to.relationships.set(id, relationship.copy("Cousin", PEOPLE[id])
                                .addCousinSeperation());
                            PEOPLE[id].relationships.set(to.id, relationship.copy("Cousin", to)
                                .addCousinSeperation());
                            continue;
                    }
                }
                return;
            case "Child":
                for (const [id, relationship] of from.relationships) {
                    if (to.relationships.has(id) || id === to.id) {
                        continue;
                    }
                        
                    switch (relationship.type) {
                        case "Child":
                            to.relationships.set(id, relationship.copy("Child", PEOPLE[id]).addGreat());
                            PEOPLE[id].relationships.set(to.id, PEOPLE[id].relationships.get(from.id).copy("Parent", to).addGreat());
                            continue;
                        case "Spouce":
                            to.relationships.set(id, to.relationships.get(from.id).copy("Child", PEOPLE[id]).setInLaw());
                            PEOPLE[id].relationships.set(to.id, from.relationships.get(to.id).copy("Parent", to).setInLaw());
                            continue;
                        default:
                            continue;
                    }
                }
                return;
            case "Spouce":
                for (const [id, relationship] of from.relationships) {
                    if (to.relationships.has(id) || id === to.id) {
                        continue;
                    }
                    if (relationship.type === "Child") {
                        if (from.children.includes(PEOPLE[id])) {
                            continue;
                        }
                        to.relationships.set(id, relationship.copy());
                        const otherRelationship = PEOPLE[id].relationships.get(from.id);
                        PEOPLE[id].relationships.set(to.id, otherRelationship.copy(otherRelationship.type, to));
                        continue;
                    }
                    
                    to.relationships.set(id, relationship.copy(relationship.type, PEOPLE[id]).setInLaw());
                    const otherRelationship = PEOPLE[id].relationships.get(from.id);
                    PEOPLE[id].relationships.set(to.id, otherRelationship.copy(otherRelationship.type, to).setInLaw());
                }
                return;
            default:
                console.error(`invalid relationship type: ${type}`);
                return;
        }
    }
}

function getOrdinal(number) {
    switch (number) {
        case 1:
            return "1st";
        case 2:
            return "2nd";
        case 3:
            return "3rd";
        default:
            return `${number}th`
    }
}
function getAdverbial(number) {
    switch (number) {
        case 1:
            return "Once";
        case 2:
            return "Twice";
        case 3:
            return "Thrice";
        default:
            return `${number}-times`;
    }
}