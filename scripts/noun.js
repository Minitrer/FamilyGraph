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
                for (const [id, relationship] of from.relationships) 
                    switch (true) {
                    case (to.relationships.has(id) || id === to.id):
                        continue;

                    case isChild(relationship):
                        if (relationship().includes("Grand")) {
                            to.relationships.set(id, createRelationship(PEOPLE[id], "Nibling"));
                            PEOPLE[id].relationships.set(to.id, createRelationship(to, "Pibling"));
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
                    case isNibling(relationship):
                        to.relationships.set(id, createCousinRelationship(PEOPLE[id], "1st"));
                        PEOPLE[id].relationships.set(to.id, createCousinRelationship(PEOPLE[id], "1st"));
                        continue;
                    case isParent(relationship):
                        to.relationships.set(id, addGreat(relationship, "Parent", PEOPLE[id]));
                        PEOPLE[id].relationships.set(to.id, addGreat(PEOPLE[id].relationships.get(from.id), "Child", to));
                        continue;
                    case isCousin(relationship):
                        // TODO: In case of seperation: Look in the parents of PEOPLE[id] for a Cousin, if found no Cousin, PEOPLE[id] is higher, 
                        // if found cousin's seperation reduced, parent is higher, if increased, parent is lower 
                        continue;
                        // case isSpouce(relationship)):
                        //     continue;
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
                    
                    const toType = getType(relationship(), PEOPLE[id].gender);
                    const peopleType = getType(PEOPLE[id].relationships.get(from.id)(), from.gender);
                    to.relationships.set(id, addInLaw(relationship, toType, PEOPLE[id]));
                    PEOPLE[id].relationships.set(to.id, addInLaw(PEOPLE[id].relationships.get(from.id), peopleType, to))
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

function addGreat(relationship, type, person) {
    const relationshipText = relationship();
    const prefix = getPrefix(relationshipText);
    const suffix = getSuffix(relationshipText);
    if  (!relationshipText.includes("Grand")) {
        const newRelationship = function() { return `${prefix}Grand${Noun[type][this.gender]}${suffix}`; }.bind(person);
        return newRelationship;
    }
    const repetitions = relationshipText.matchAll("Great").length;
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
const cousinSeperationRE = /\w+(?=\sremoved)/;
function addCousinNumber(relationship, person) {
    const relationshipText = relationship();
    const ordinal = relationshipText.match(cousinNumberRE)[0];
    const match = relationshipText.match(cousinSeperationRE);
    const adverbial = match? match[0] : null;

    const number = Number(ordinal.match(numberRE)[0]);
    const newOrdinal = getOrdinal(number + 1);

    return createCousinRelationship(person, newOrdinal, relationshipText, adverbial);
}
function addCousinSeperation(relationship, person) {
    const relationshipText = relationship();
    const ordinal = relationshipText.match(cousinNumberRE)[0];
    const match = relationshipText.match(cousinSeperationRE);
    const adverbial = match? match[0] : null;

    let newAdverbial;
    if (adverbial) {
        const seperationNumber = getNumberFromAdverbial(adverbial);
        newAdverbial = getAdverbial(seperationNumber + 1);
    }
    else {
        newAdverbial = getAdverbial(1);
    }

    return createCousinRelationship(person, ordinal, relationshipText, newAdverbial);
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