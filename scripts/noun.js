import { PEOPLE } from "./person";

export default class Noun {
    static Spouce = Object.freeze({
        male: "Husband",
        neutral: "Spouce",
        female: "Wife",
    });
    static Child = Object.freeze({
        male: "Son",
        neutral: "Child",
        female: "Daughter",
    });
    static Parent = Object.freeze({
        male: "Father",
        neutral: "Parent",
        female: "Mother",
    });
    static Sibling = Object.freeze({
        male: "Brother",
        neutral: "Sibling",
        female: "Sister",
    });
    // Pibling = Parent's siblings e.g. Aunts and Uncles
    static Pibling = Object.freeze({
        male: "Uncle",
        neutral: "Pibling",
        female: "Aunt",
    });
    // Nibling = Sibling's children e.g. Nieces and Nephews
    static Nibling = Object.freeze({
        male: "Nephew",
        neutral: "Nibling",
        female: "Niece",
    });
    // TODO: Add a way to calculate counsin numbers and degrees of seperation 
    static Cousin = Object.freeze({
        male: "Cousin",
        neutral: "Cousin",
        female: "Cousin",
    });

    static setRelationships(from, to, type) {
        switch (type) {
            case "Parent":
                to.relationships.set(from.id, createRelationships(from, "Parent"));
                for (const [id, relationship] of from.relationships) {
                    if (id === to.id) {
                        continue;
                    }

                    if (isParent(relationship)) {
                        to.relationships.set(id, addGreat(relationship));
                        PEOPLE[id].relationships.set(to.id, 
                            addGreat(
                            changeGender(PEOPLE[id].relationships.get(from.id), to)));
                        continue;
                    }
                    if (isChild(relationship)) {
                        to.relationships.set(id, createRelationships(PEOPLE[id], "Sibling"));
                        PEOPLE[id].relationships.set(to.id, createRelationships(to, "Sibling"));
                        continue;
                    }
                    if (isSpouce(relationship)) {
                        continue;
                    }
                    if (isSibling(relationship)) {
                        to.relationships.set(id, createRelationships(PEOPLE[id], "Pibling"));
                        PEOPLE[id].relationships.set(to.id, createRelationships(to, "Nibling"));
                        continue;
                    }
                    if (isPibling(relationship)) {
                        to.relationships.set(id, addGreat(relationship));
                        PEOPLE[id].relationships.set(to.id, 
                            addGreat(
                            changeGender(PEOPLE[id].relationships.get(from.id), to)));
                        continue;
                    }
                    if (isNibling(relationship)) {
                        to.relationships.set(id, createRelationships(PEOPLE[id], "Cousin"));
                        PEOPLE[id].relationships.set(to.id, createRelationships(to, "Cousin"));
                        continue;
                    }
                }
                return;
            case "Child":
                return;
            case "Spouce":
                return;
            default:
                console.error(`invalid relationship type: ${type}`);
                return;
        }
    }

    // static setParentRelationships(person, parent) {
    //     const parentOptions = {
    //         Noun: "Parent",
    //         Group: "parents",
    //     }
    //     Noun.setGroupRelationships(person, parent, {
    //         subOptions: parentOptions,
    //         superGroup: "children",
    //     });
    // }
    // static setChildRelationships(person, child) {
    //     const childOptions = {
    //         Noun: "Child",
    //         Group: "children",
    //     }
    //     Noun.setGroupRelationships(person, child, {
    //         subOptions: childOptions,
    //         superGroup: "parents",
    //     });
    // }
    // static setGroupRelationships(person, subPerson, options) {
    //     Noun.setGrandRelationships(person, subPerson, 0, options.subOptions);

    //     function updateSuperGroup(superPerson, current, index=1) {
    //         Noun.setGrandRelationships(superPerson, current, index, options.subOptions);
    //         superPerson[options.superGroup].forEach(superPerson => {
    //             updateSuperGroup(superPerson, current, index + 1, options.subOptions);
    //         });
    //     }
    //     person[options.superGroup].forEach(superPerson => {
    //         updateSuperGroup(superPerson, subPerson);
    //     });
    // }
    // static setGrandRelationships(person=current, current, index=0, options) {
    //     switch (index) {
    //         case 0:
    //             person.relationships.set(current.id, () => { return Noun[options.Noun][current.gender] });
    //             break;
    //         case 1:
    //             person.relationships.set(current.id, () => { return `grand ${Noun[options.Noun][current.gender]}` });
    //             break;
    //         default:
    //             person.relationships.set(current.id, () => { return `${"great ".repeat(index - 1)}grand ${Noun[options.Noun][current.gender]}`});
    //             break;
    //         }
    //     current[options.Group].forEach(subPerson => {
    //         Noun.setGrandRelationships(person, subPerson, index + 1, options);
    //     });
    // }
}

function createRelationships(person, type, repetitions=0) {
    switch (repetitions) {
        case 0: {
            const relationship = () => { return Noun[type][this.Person.gender]; };
            relationship.Person = person;
            return relationship;
        }
        case 1: {
            const relationship = () => { return `Grand ${Noun[type][this.Person.gender]}`};
            relationship.Person = person;
            return relationship;
        }
        default: {
            const relationship = () => { return `${"Great ".repeat(repetitions - 1)}Grand ${Noun[type][this.Person.gender]}`};
            relationship.Person = person;
            return relationship;
        }
    }
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
function isType(relationship, type) {
    switch (true) {
        case relationship().includes(Noun[type].male):
        case relationship().includes(Noun[type].neutral):
        case relationship().includes(Noun[type].female):
            return true;
        default:
            return false;
    } 
}

function addGreat(relationship, type, person) {
    const relationshipText = relationship();
    if  (!relationshipText.includes("grand")) {
        return () => { 
            let Person = person;
            return `Grand ${Noun[type][Person.gender]}`; 
        };
    }
    const repetitions = relationshipText.matchAll("Great").length;
    return () => {
        let Person = person;
        return `${"Great ".repeat(repetitions)}Grand ${Noun[type][Person.gender]}`
    };
}

function changeGender(relationship, person) {
    const newRelationship = relationship;
    newRelationship.Person = person;
    return newRelationship;
}