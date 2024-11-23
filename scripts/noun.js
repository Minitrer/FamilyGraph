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

    static setParentRelationships(person, parent) {
        const parentOptions = {
            Noun: "Parent",
            Group: "parents",
        }
        // Noun.setGrandRelationships(person, parent, 0, parentOptions);

        // function updateChildren(child, current, index=1, options=parentOptions) {
        //     Noun.setGrandRelationships(child, current, index, parentOptions);
        //     person.children.forEach(child => {
        //         updateChildren(child, current, index + 1, options);
        //     });
        // }
        // person.children.forEach(child => {
        //     updateChildren(child, parent);
        // });
        Noun.setGroupRelationships(person, parent, {
            subOptions: parentOptions,
            superGroup: "children",
        });
    }
    static setChildRelationships(person, child) {
        const childOptions = {
            Noun: "Child",
            Group: "children",
        }
        // Noun.setGrandRelationships(person, child, 0, childOptions);

        // function updateParents(parent, current, index=1, options=childOptions) {
        //     Noun.setGrandRelationships(parent, current, index, childOptions);
        //     person.parents.forEach(parent => {
        //         updateParents(parent, current, index + 1, options);
        //     });
        // }
        // person.parents.forEach(parent => {
        //     updateParents(parent, child);
        // });
        Noun.setGroupRelationships(person, child, {
            subOptions: childOptions,
            superGroup: "parents",
        });
    }
    static setGroupRelationships(person, subPerson, options) {
        Noun.setGrandRelationships(person, subPerson, 0, options.subOptions);

        function updateSuperGroup(superPerson, current, index=1) {
            Noun.setGrandRelationships(superPerson, current, index, options.subOptions);
            superPerson[options.superGroup].forEach(superPerson => {
                updateSuperGroup(superPerson, current, index + 1, options.subOptions);
            });
        }
        person[options.superGroup].forEach(superPerson => {
            updateSuperGroup(superPerson, subPerson);
        });
    }
    static setGrandRelationships(person=current, current, index=0, options) {
        switch (index) {
            case 0:
                person.relationships.set(current.id, () => { return Noun[options.Noun][current.gender] });
                break;
            case 1:
                person.relationships.set(current.id, () => { return `grand ${Noun[options.Noun][current.gender]}` });
                break;
            default:
                person.relationships.set(current.id, () => { return `${"great ".repeat(index - 1)}grand ${Noun[options.Noun][current.gender]}`});
                break;
            }
        current[options.Group].forEach(subPerson => {
            Noun.setGrandRelationships(person, subPerson, index + 1, options);
        });
    }
}