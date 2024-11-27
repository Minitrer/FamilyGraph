import { PEOPLE } from "./person.js";

export default class Noun {
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

    static setRelationships(from, to, type) {
        to.relationships.set(from.id, createRelationship(from, type));
        switch (type) {
            case "Parent":
                for (const [id, relationship] of from.relationships) {
                    switch (true) {
                    case (to.relationships.has(id) || id === to.id):
                        continue;

                    case isChild(relationship):
                        if (relationship().includes("Grand")) {
                            const amount = getGreatAmount(relationship());
                            if (amount === 0) {
                                to.relationships.set(id, createRelationship(PEOPLE[id], "Nibling"));
                                PEOPLE[id].relationships.set(to.id, createRelationship(to, "Pibling"));
                                continue;    
                            }
                            to.relationships.set(id, addGreat(createRelationship(PEOPLE[id], "Nibling"), "Nibling", PEOPLE[id], amount));
                            PEOPLE[id].relationships.set(to.id, addGreat(createRelationship(to, "Pibling"), "Pibling", to, amount));
                            continue;
                        }
                        to.relationships.set(id, createRelationship(PEOPLE[id], "Sibling"));
                        PEOPLE[id].relationships.set(to.id, createRelationship(to, "Sibling"));
                        continue;
                    case isSibling(relationship):
                        to.relationships.set(id, createRelationship(PEOPLE[id], "Pibling"));
                        PEOPLE[id].relationships.set(to.id, createRelationship(to, "Nibling")); 
                        continue;
                    case isPibling(relationship):
                        to.relationships.set(id, addGreat(relationship, "Pibling", PEOPLE[id]));
                        PEOPLE[id].relationships.set(to.id, addGreat(PEOPLE[id].relationships.get(from.id), "Nibling", to));
                        continue;
                    case isNibling(relationship): {
                        const relationshipText = relationship();
                        if (relationshipText.includes("Grand")) {
                            const amount = getGreatAmount(relationshipText) + 1;
                            const seperation = getAdverbial(amount)
                            to.relationships.set(id, createCousinRelationship(PEOPLE[id], "1st", "", seperation));
                            PEOPLE[id].relationships.set(to.id, createCousinRelationship(to, "1st", "", seperation));
                            continue;
                        }
                        to.relationships.set(id, createCousinRelationship(PEOPLE[id], "1st"));
                        PEOPLE[id].relationships.set(to.id, createCousinRelationship(to, "1st"));
                        continue;
                    }
                    case isParent(relationship):
                        to.relationships.set(id, addGreat(relationship, "Parent", PEOPLE[id]));
                        PEOPLE[id].relationships.set(to.id, addGreat(PEOPLE[id].relationships.get(from.id), "Child", to));
                        continue;
                    // case isSpouce(relationship)):
                    //     continue;
                    case isCousin(relationship):
                        
                        const relationshipText = relationship();
                        if (!relationshipText.includes("removed")) {
                            to.relationships.set(id, addCousinSeperation(relationship, PEOPLE[id]));
                            PEOPLE[id].relationships.set(to.id, addCousinSeperation(relationship, to));
                            continue;
                        }
                        // We can see whether the parent is a generation older by checking the cousin's parents, seeing if one of them is also the parent's cousin 
                        // and comparing the seperations, or if there's no cousins to be found
                        let isParentHigher = false;
                        for (const parent of PEOPLE[id].parents) {
                            const parentRelationship = from.relationships.get(parent.id);
                            if (!isCousin(parentRelationship)) {
                                continue;
                            }
                            
                            const parentRelationshipText = parentRelationship();
                            const parentSeperationAmount = getSeperationAmount(parentRelationshipText);

                            const seperationAmount = getSeperationAmount(relationshipText);
                            if (parentSeperationAmount > seperationAmount) {
                                break;
                            }
                            isParentHigher = true;
                            break;
                        }
                        if (isParentHigher) {
                            to.relationships.set(id, addCousinNumber(addCousinSeperation(relationship, PEOPLE[id], -1), PEOPLE[id]));
                            PEOPLE[id].relationships.set(to.id, addCousinNumber(addCousinSeperation(relationship, to, -1), to));
                            continue;
                        }
                        // Cousin is higher
                        to.relationships.set(id, addCousinSeperation(relationship, PEOPLE[id]));
                        PEOPLE[id].relationships.set(to.id, addCousinSeperation(relationship, to));
                        continue;
                    }
                }
                return;
            case "Child":
                for (const [id, relationship] of from.relationships) 
                    switch (true) {
                    case (to.relationships.has(id) || id === to.id):
                        continue;

                    case isChild(relationship):
                        to.relationships.set(id, addGreat(relationship, "Child", PEOPLE[id]));
                        PEOPLE[id].relationships.set(to.id, addGreat(PEOPLE[id].relationships.get(from.id), "Parent", to));
                        continue;
                    
                    // case isSibling(relationship)):
                    //     continue;
                    // case isPibling(relationship)):
                    //     continue;
                    // case isNibling(relationship)):
                    //     continue;
                    // case isParent(relationship)):
                    //     continue;

                    case isSpouce(relationship):
                        to.relationships.set(id, addInLaw(to.relationships.get(from.id), "Child", PEOPLE[id]));
                        PEOPLE[id].relationships.set(to.id, addInLaw(from.relationships.get(to.id), "Parent", to));
                        continue;
                }
                return;
            case "Spouce":
                for (const [id, relationship] of from.relationships) {
                    if (to.relationships.has(id) || id === to.id) {
                        continue;
                    }
                    if (isChild(relationship)) {
                        continue;
                    }
                    
                    const typeA = getType(relationship(), PEOPLE[id].gender);
                    const typeB = getType(PEOPLE[id].relationships.get(from.id)(), from.gender);
                    to.relationships.set(id, addInLaw(relationship, typeA, PEOPLE[id]));
                    PEOPLE[id].relationships.set(to.id, addInLaw(PEOPLE[id].relationships.get(from.id), typeB, to));
                }
                return;
            default:
                console.error(`invalid relationship type: ${type}`);
                return;
        }
    }
}


function createRelationship(person, type) {
    const relationship = function() { return `${Noun[type][this.gender]}`; }.bind(person);
    return relationship;
}

function isParent(relationship) {
    return isType(relationship, "Parent");
}
function isSpouce(relationship) {
    return isType(relationship, "Spouce");
}
function isChild(relationship) {
    return isType(relationship, "Child");
}
function isSibling(relationship) {
    return isType(relationship, "Sibling");
}
function isPibling(relationship) {
    return isType(relationship, "Pibling");
}
function isNibling(relationship) {
    return isType(relationship, "Nibling");
}
function isCousin(relationship) {
    return isType(relationship, "Cousin");
}
function isType(relationship, type) {
    return (relationship().includes(Noun[type].male) ||
            relationship().includes(Noun[type].neutral) ||
            relationship().includes(Noun[type].female));
}
function getType(relationshipText, gender) {
    switch (true) {
        case relationshipText.includes(Noun.Child[gender]):
            return "Child";
        case relationshipText.includes(Noun.Parent[gender]):
            return "Parent";
        case relationshipText.includes(Noun.Sibling[gender]):
            return "Sibling";
        case relationshipText.includes(Noun.Nibling[gender]):
            return "Nibling";
        case relationshipText.includes(Noun.Pibling[gender]):
            return "Pibling";
        case relationshipText.includes(Noun.Spouce[gender]):
            return "Spouce";
        case relationshipText.includes(Noun.Cousin[gender]):
            return "Cousin";
    }
}
function getPrefix(relationship) {
    if (relationship.includes("Step-")) {
        return "Step-";
    }
    return "";
}
function getSuffix(relationshipText) {
    if (relationshipText.includes("-in-law")) {
        return "-in-law";
    }
    return "";
}
function getGreatAmount(relationshipText) {
    return Array.from(relationshipText.matchAll("Great"), (m) => m[0]).length;
}

function addGreat(relationship, type, person, addAmount=1) {
    const relationshipText = relationship();
    const prefix = getPrefix(relationshipText);
    const suffix = getSuffix(relationshipText);
    if  (!relationshipText.includes("Grand")) {
        if (addAmount === 1) {
            const newRelationship = function() { return `${prefix}Grand${Noun[type][this.gender]}${suffix}`; }.bind(person);
            return newRelationship;
        }
        const newRelationship = function() { return `${"Great ".repeat(addAmount - 1)}${prefix}Grand${Noun[type][this.gender]}${suffix}` }.bind(person);
        return newRelationship;
    }
    const repetitions = getGreatAmount(relationshipText) + addAmount;
    const newRelationship = function() { return `${"Great ".repeat(repetitions)}${prefix}Grand${Noun[type][this.gender]}${suffix}` }.bind(person);
    return newRelationship;
}
function addInLaw(relationship, type, person) {
    const relationshipText = relationship();
    const prefix = getPrefix(relationshipText);
    const suffix = "-in-law";
    if (relationshipText.includes("Grand")) {
        const repetitions = relationshipText.matchAll("Great").length;
        const newRelationship = function() { return `${"Great ".repeat(repetitions)}${prefix}Grand${Noun[type][this.gender]}${suffix}` }.bind(person);
        return newRelationship;
    }
    const newRelationship = function() { return `${prefix}${Noun[type][this.gender]}${suffix}`; }.bind(person);
    return newRelationship;
}
function addStep(relationship, type, person) {
    const relationshipText = relationship();
    const prefix = "Step-";
    const suffix = getSuffix(relationshipText);
    if (relationshipText.includes("Grand")) {
        const repetitions = relationshipText.matchAll("Great").length;
        const newRelationship = function() { return `${"Great ".repeat(repetitions)}${prefix}Grand${Noun[type][this.gender]}${suffix}` }.bind(person);
        return newRelationship;
    }
    const newRelationship = function() { return `${prefix}${Noun[type][this.gender]}${suffix}`; }.bind(person);
    return newRelationship;
}

const cousinNumberRE = /\d\w+/;
const numberRE = /\d+/;
const cousinSeperationRE = /\S+(?=\sremoved)/;
function addCousinNumber(relationship, person) {
    const relationshipText = relationship();
    const number = getCousinNumber(relationshipText);
    const match = relationshipText.match(cousinSeperationRE);
    const adverbial = match? match[0] : null;

    const newOrdinal = getOrdinal(number + 1);

    return createCousinRelationship(person, newOrdinal, relationshipText, adverbial);
}
function addCousinSeperation(relationship, person, addAmount=1) {
    const relationshipText = relationship();
    const ordinal = relationshipText.match(cousinNumberRE)[0];
    const seperationNumber = getSeperationAmount(relationshipText);

    if (seperationNumber + addAmount !== 0) {
        const newAdverbial = getAdverbial(seperationNumber + addAmount);
        return createCousinRelationship(person, ordinal, relationshipText, newAdverbial);
    }
    return createCousinRelationship(person, ordinal, relationshipText);
}

function createCousinRelationship(person, number, relationshipText="", seperation=null) {
    const prefix = getPrefix(relationshipText);
    const suffix = getSuffix(relationshipText);

    if (seperation) {
        const newRelationship = function() { return `${number} ${prefix}${Noun.Cousin[this.gender]}${suffix} ${seperation} removed`}.bind(person);
        return newRelationship;
    }
    const newRelationship = function() { return `${number} ${prefix}${Noun.Cousin[this.gender]}${suffix}`}.bind(person);
    return newRelationship;
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
function getNumberFromAdverbial(adverbial) {
    switch (adverbial) {
        case "Once":
            return 1;
        case "Twice":
            return 2;
        case "Thrice":
            return 3;
        default:
            return Number(adverbial.match(numberRE)[0]);
    }
}
function getSeperationAmount(relationshipText) {
    const match = relationshipText.match(cousinSeperationRE);
    if (!match) {
        return 0;
    }
    return getNumberFromAdverbial(match[0]);
}
function getCousinNumber(relationshipText) {
    return Number(relationshipText.match(cousinNumberRE)[0].match(numberRE)[0]);
}