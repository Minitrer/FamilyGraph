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
    get prefix() {
        return this.#prefix;
    }
    get suffix() {
        return this.#suffix;
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
    setHalf(isHalf=true) {
        this.#prefix = isHalf? "Half-" : "";
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

                    const otherRelationship = PEOPLE[id].relationships.get(from.id);
                    switch (relationship.type) {
                        case "Child":
                            if (relationship.GCount > 0) {
                                to.relationships.set(id, relationship.copy("Nibling", PEOPLE[id], relationship.GCount - 1));
                                PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Pibling", to, relationship.GCount - 1));
                                break;    
                            }
                            to.relationships.set(id, relationship.copy("Sibling", PEOPLE[id]));
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Sibling", to));
                            break;
                        case "Sibling":
                            to.relationships.set(id, relationship.copy("Pibling", PEOPLE[id]));
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Nibling", to)); 
                            break;
                        case "Pibling":
                            to.relationships.set(id, relationship.copy("Pibling", PEOPLE[id], relationship.GCount + 1));
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Nibling", to, otherRelationship.GCount + 1));
                            break;
                        case "Nibling": 
                            if (relationship.GCount > 0) {
                                const seperationAmount = relationship.GCount;
                                to.relationships.set(id, relationship.copy("Cousin", PEOPLE[id], 0, relationship.prefix, relationship.suffix, 1, seperationAmount));
                                PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Cousin", to, 0, otherRelationship.prefix, otherRelationship.suffix, 1, seperationAmount));
                                break;
                            }
                            to.relationships.set(id, relationship.copy("Cousin", PEOPLE[id], 0, relationship.prefix, relationship.suffix, 1));
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Cousin", to, 0, otherRelationship.prefix, otherRelationship.suffix, 1));
                            break;
                        case "Parent": 
                            to.relationships.set(id, relationship.copy("Parent", PEOPLE[id], relationship.GCount + 1));
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Child", to, otherRelationship.GCount + 1));
                            break;
                        case "Cousin":
                            if (relationship.cousinSeperation === 0) {
                                to.relationships.set(id, relationship.copy("Cousin", PEOPLE[id]).addCousinSeperation());
                                PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Cousin", to).addCousinSeperation());
                                break;
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
                                PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Cousin", to)
                                    .addCousinSeperation(-1)
                                    .addCousinNumber());
                                break;
                            }
                            // Cousin is higher
                            to.relationships.set(id, relationship.copy("Cousin", PEOPLE[id])
                                .addCousinSeperation());
                            PEOPLE[id].relationships.set(to.id, otherRelationship.copy("Cousin", to)
                                .addCousinSeperation());
                            break;
                        default:
                            continue;
                    }

                    // Confirm if all parents share the "-in-law" relationship
                    const toRelationship = to.relationships.get(id);
                    if (toRelationship.suffix === "") {
                        continue;
                    }
                    for (const parent of from.spouses) {
                        if (parent.relationships.get(id).suffix === "") {
                            toRelationship.setInLaw(false);
                            PEOPLE[id].get(to.id).setInLaw(false);
                            break;
                        }
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

                    const otherRelationship = PEOPLE[id].relationships.get(from.id);
                    if (relationship.type === "Child") {
                        if (from.children.includes(PEOPLE[id])) {
                            continue;
                        }
                        to.relationships.set(id, relationship.copy());
                        PEOPLE[id].relationships.set(to.id, otherRelationship.copy(otherRelationship.type, to));
                        continue;
                    }
                    
                    to.relationships.set(id, relationship.copy(relationship.type, PEOPLE[id]).setInLaw());
                    PEOPLE[id].relationships.set(to.id, otherRelationship.copy(otherRelationship.type, to).setInLaw());
                }
                return;
            default:
                console.error(`invalid relationship type: ${type}`);
                return;
        }
    }

    static setStepRelationships(from, to, type, toggle=true) {
        to.relationships.get(from.id).setStep(toggle);
        switch (type) {
            case "Parent":
                const toID = to.id;
                for (const [id, relationship] of from.relationships) {
                    if (id === to.id) {
                        continue;
                    }
                    switch (relationship.type) {
                        case "Spouce":
                            continue;
                        case "Child":
                            const toRelationship = to.relationships.get(id);
                            if (toRelationship.type === "Spouce" || toRelationship.type === "Child") {
                                continue;
                            } 
                            
                            const sibling = PEOPLE[id];
                            function setBothStep(isStep=true) {
                                toRelationship.setStep(isStep);
                                sibling.relationships.get(to.id).setStep(isStep);
                            }
                            function setBothHalf(isHalf=true) {
                                toRelationship.setHalf(isHalf);
                                sibling.relationships.get(to.id).setHalf(isHalf);
                            }

                            const biologicalParentsA = to.parents.filter((parent) => {
                                const relationship = parent.relationships.get(toID);
                                return relationship.type === "Child" && relationship.prefix === "";
                            });
                            if (biologicalParentsA.length === 0) {
                                setBothStep();
                                continue;
                            }

                            const biologicalParentsB = sibling.parents.filter((parent) => {
                                const relationship = parent.relationships.get(id);
                                return relationship.type === "Child" && relationship.prefix === "";
                            });
                            if (biologicalParentsB === 0) {
                                setBothStep();
                                continue;
                            }

                            let shareCount = 0;
                            let differs = false;
                            for (const parentA of biologicalParentsA) {
                                if (biologicalParentsB.includes(parentA)) {
                                    shareCount++;
                                    continue;
                                }
                                differs = true;
                            }

                            if (shareCount === 0) {
                                setBothStep();
                                continue;
                            }
                            if (differs || biologicalParentsA.length !== biologicalParentsB.length) {
                                setBothHalf();
                                continue;
                            }

                            setBothStep(false);
                            continue;
                        default:
                            to.relationships.get(id).setStep(toggle);
                            PEOPLE[id].relationships.get(to.id).setStep(toggle);
                            continue;
                    }
                }
                return;
            case "Child":
                for (const [id, relationship] of from.relationships) {
                    if (id === to.id) {
                        continue;
                    }
                    if (relationship.type === "Spouce" || relationship.type === "Child") {
                        to.relationships.get(id).setStep(toggle);
                        PEOPLE[id].relationships.get(to.id).setStep(toggle);
                        continue;
                    }
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