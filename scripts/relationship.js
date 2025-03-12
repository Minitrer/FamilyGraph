import { PEOPLE } from "./person.js";
import { RELATIONSHIPTEXTS, SELECTED, updateRelationshipText } from "./controls.js";

class Noun  {
    static Spouce = Object.freeze({
        male: "husband",
        agender: "spouce",
        female: "wife",
    });
    static Child = Object.freeze({
        male: "son",
        agender: "child",
        female: "daughter",
    });
    static Parent = Object.freeze({
        male: "father",
        agender: "parent",
        female: "mother",
    });
    static Sibling = Object.freeze({
        male: "brother",
        agender: "sibling",
        female: "sister",
    });
    // Pibling = Parent's siblings e.g. Aunts and Uncles
    static Pibling = Object.freeze({
        male: "uncle",
        agender: "pibling",
        female: "aunt",
    });
    // Nibling = Sibling's children e.g. Nieces and Nephews
    static Nibling = Object.freeze({
        male: "nephew",
        agender: "nibling",
        female: "niece",
    });
    static Cousin = Object.freeze({
        male: "cousin",
        agender: "cousin",
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
    setInLaw(isInLaw=true, id=null) {
        this.#suffix = isInLaw? "-in-law" : "";
        if (id === null) {
            return this;
        }
        updateText(id, this);
        return this;
    }
    setStep(isStep=true, id=null) {
        this.#prefix = isStep? "Step-" : "";
        if (id === null) {
            return this;
        }
        updateText(id, this);   
        return this;
    }
    setHalf(isHalf=true, id=null) {
        this.#prefix = isHalf? "Half-" : "";
        if (id === null) {
            return this;
        }
        updateText(id, this);
        return this;
    }
    copy(type=this.#type, person=this.#person, GCount=this.#GCount, prefix=this.#prefix, suffix=this.#suffix, cousinNumber=this.#cousinNumber, cousinSeperation=this.#cousinSeperation) {
        return new Relationship(type, person, GCount, prefix, suffix, cousinNumber, cousinSeperation);
    }
    
    static setRelationships(from, to, type) {
        set(to.relationships, from.id, new Relationship(type, from));
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
                                set(to.relationships, id, relationship.copy("Nibling", PEOPLE[id], relationship.GCount - 1));
                                set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Pibling", to, relationship.GCount - 1));
                                break;    
                            }
                            set(to.relationships, id, relationship.copy("Sibling", PEOPLE[id]));
                            set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Sibling", to));
                            break;
                        case "Sibling":
                            set(to.relationships, id, relationship.copy("Pibling", PEOPLE[id]));
                            set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Nibling", to)); 
                            break;
                        case "Pibling":
                            set(to.relationships, id, relationship.copy("Pibling", PEOPLE[id], relationship.GCount + 1));
                            set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Nibling", to, otherRelationship.GCount + 1));
                            break;
                        case "Nibling": 
                            if (relationship.GCount > 0) {
                                const seperationAmount = relationship.GCount;
                                set(to.relationships, id, relationship.copy("Cousin", PEOPLE[id], 0, relationship.prefix, relationship.suffix, 1, seperationAmount));
                                set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Cousin", to, 0, otherRelationship.prefix, otherRelationship.suffix, 1, seperationAmount));
                                break;
                            }
                            set(to.relationships, id, relationship.copy("Cousin", PEOPLE[id], 0, relationship.prefix, relationship.suffix, 1));
                            set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Cousin", to, 0, otherRelationship.prefix, otherRelationship.suffix, 1));
                            break;
                        case "Parent": 
                            set(to.relationships, id, relationship.copy("Parent", PEOPLE[id], relationship.GCount + 1));
                            set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Child", to, otherRelationship.GCount + 1));
                            break;
                        case "Cousin":
                            if (relationship.cousinSeperation === 0) {
                                set(to.relationships, id, relationship.copy("Cousin", PEOPLE[id]).addCousinSeperation());
                                set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Cousin", to).addCousinSeperation());
                                break;
                            }
                            // We can see whether the parent is in an older generation by checking the cousin's parents, seeing if one of them is also the parent's cousin 
                            // and comparing the seperations, or if there's no cousins to be found
                            let isParentHigher = false;
                            // othersParents includes the parents of the spouces
                            const othersParents = PEOPLE[id].parents.concat(PEOPLE[id].spouses.map((spouce) => spouce.parents).flat());
                            for (const parent of othersParents) {
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
                                set(to.relationships, id, relationship.copy("Cousin", PEOPLE[id])
                                    .addCousinSeperation(-1)
                                    .addCousinNumber());
                                set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Cousin", to)
                                    .addCousinSeperation(-1)
                                    .addCousinNumber());
                                break;
                            }
                            // Cousin is higher
                            set(to.relationships, id, relationship.copy("Cousin", PEOPLE[id])
                                .addCousinSeperation());
                            set(PEOPLE[id].relationships, to.id, otherRelationship.copy("Cousin", to)
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
                            toRelationship.setInLaw(false, id);
                            PEOPLE[id].relationships.get(to.id).setInLaw(false, to.id);
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
                            set(to.relationships, id, relationship.copy("Child", PEOPLE[id]).addGreat());
                            set(PEOPLE[id].relationships, to.id, PEOPLE[id].relationships.get(from.id).copy("Parent", to).addGreat());
                            continue;
                        case "Spouce":
                            set(to.relationships, id, to.relationships.get(from.id).copy("Child", PEOPLE[id]).setInLaw());
                            set(PEOPLE[id].relationships, to.id, from.relationships.get(to.id).copy("Parent", to).setInLaw());
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
                        set(to.relationships, id, relationship.copy());
                        set(PEOPLE[id].relationships, to.id, otherRelationship.copy(otherRelationship.type, to));
                        continue;
                    }
                    
                    set(to.relationships, id, relationship.copy(relationship.type, PEOPLE[id]).setInLaw());
                    set(PEOPLE[id].relationships, to.id, otherRelationship.copy(otherRelationship.type, to).setInLaw());
                }
                return;
            default:
                console.error(`invalid relationship type: ${type}`);
                return;
        }
    }

    static setStepRelationships(from, to, type, toggle=true) {
        to.relationships.get(from.id).setStep(toggle, from.id);
        const toID = to.id;
        switch (type) {
            case "Parent":
                const tosDescendants = [];
                to.relationships.forEach((relationship, id) => {
                    if (relationship.type === "Child") {
                        tosDescendants.push({
                            person: PEOPLE[id],
                            id: id
                        });
                    }
                });

                for (const [otherId, relationship] of from.relationships) {
                    if (otherId === toID) {
                        continue;
                    }
                    switch (relationship.type) {
                        case "Spouce":
                            continue;
                        case "Child":
                            const toRelationship = to.relationships.get(otherId);
                            
                            if (toRelationship.type === "Spouce" || toRelationship.type === "Child") {
                                continue;
                            } 
                            
                            // Other could be sibling or nibling
                            const other = PEOPLE[otherId];
                            function setBothStep(isStep=true) {
                                toRelationship.setStep(isStep, otherId);
                                other.relationships.get(toID).setStep(isStep, toID);
                                tosDescendants.forEach((descendant) => {
                                    descendant.person.relationships.get(otherId).setStep(isStep, otherId);
                                    other.relationships.get(descendant.id).setStep(isStep, descendant.id);
                                });
                            }
                            function setBothHalf(isHalf=true) {
                                toRelationship.setHalf(isHalf, otherId);
                                other.relationships.get(toID).setHalf(isHalf, toID);
                                tosDescendants.forEach((descendant) => {
                                    descendant.person.relationships.get(otherId).setHalf(isHalf, otherId);
                                    other.relationships.get(descendant.id).setHalf(isHalf, descendant.id);
                                });
                            }

                            let isntStep = false;
                            let isntNeither = false;
                            for (const parent of to.parents) {
                                const toRelationship = parent.relationships.get(toID);
                                const otherRelationship = parent.relationships.get(otherId);
                                if (!otherRelationship || toRelationship.prefix !== otherRelationship.prefix) {
                                    isntNeither = true;
                                    if (isntStep) {
                                        setBothHalf();
                                        break;
                                    }
                                    continue;
                                }
                                if (toRelationship.prefix === "" && otherRelationship.prefix === "") {
                                    isntStep = true;
                                    if (isntNeither) {
                                        setBothHalf();
                                        break;
                                    }
                                    continue;
                                }
                            }
                            //  isHalf = isntStep && isntNeither;
                            if (isntStep && isntNeither) {
                                continue;
                            }
                            // isntHalf = true;
                            if (isntNeither) {
                                setBothStep()
                                continue;
                            }
                            // isntHalf and isntStep
                            setBothStep(false);
                            continue;
                        default:
                            to.relationships.get(otherId).setStep(toggle, otherId);
                            PEOPLE[otherId].relationships.get(toID).setStep(toggle, toID);
                            continue;
                    }
                }
                return;
            case "Child":
                for (const [id, relationship] of from.relationships) {
                    if (id === toID) {
                        continue;
                    }
                    if (relationship.type === "Spouce" || relationship.type === "Child") {
                        to.relationships.get(id).setStep(toggle, id);
                        PEOPLE[id].relationships.get(toID).setStep(toggle, toID);
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

function set(map, id, relationship) {
    map.set(id, relationship);
    updateText(id, relationship);
}
function updateText(id, relationship) {
    if (!SELECTED[0]) {
        return;
    }
    const selectedRelationship = SELECTED[0].person.relationships.get(id);
    if (!selectedRelationship || selectedRelationship !== relationship) {
        return;
    }
    const text = RELATIONSHIPTEXTS.get(id);
    if (text && text.parentElement) {
        updateRelationshipText(text, id, relationship);
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