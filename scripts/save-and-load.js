import Family, { FAMILIES } from "./family.js";
import Person, { PEOPLE } from "./person.js";
import { forget } from "./actions.js";

const saveDiv = document.getElementById("save");
const input = document.getElementById("import");

saveDiv.addEventListener("click", (event) => {
    if (PEOPLE.length === 0) {
        return;
    }
    event.preventDefault();

    const blobContent = PEOPLE.filter((person) => !person.isHidden);
    const familiesData = FAMILIES.filter((family) => !family.isHidden);
    const domStructure = createStructureObject();
    blobContent.push(familiesData);
    blobContent.push(domStructure);

    const file = new Blob([JSON.stringify(blobContent, null, 4)], { type: "text/plain" });
    
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "family.json";
    a.click();
});

input.addEventListener("change", (event) => {
    if (!event.target.files[0]) {
        return;
    }
    const file = event.target.files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length) || file.name;
    // https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/1203361#1203361

    if (extension !== "json") {
        console.error(`File type: ${extension} is not supported, use .json`);
    }

    const reader = new FileReader();
    reader.addEventListener("error", () => {
        console.error(`Failed to read file: ${file.name}`);
    }, { once: true });
    reader.addEventListener("load", () => {
        const peopleData = JSON.parse(reader.result);
        const domStructure = peopleData.pop();
        const familiesData = peopleData.pop();

        for (let i = 0, length = PEOPLE.length; i < length; i++) {
            PEOPLE[0].delete();
        }
        forget();

        Person.setPEOPLE(Array.from(peopleData, () => new Person()));
        
        Family.load(familiesData);
        PEOPLE.forEach((person, i) => person.load(peopleData[i]));

        const firstFamily = FAMILIES[domStructure.familyID];
        function appendFamilyDivs(family, domObject) {
            domObject.parents.forEach((parentID) => {
                family.parentsDiv.append(PEOPLE[parentID].div);
            });

            domObject.children.forEach((child) => {
                if (typeof child === "number") {
                    family.childrenDiv.append(PEOPLE[child].div);
                    return;
                }
                family.childrenDiv.append(FAMILIES[child.familyID].div);
                appendFamilyDivs(FAMILIES[child.familyID], child);
            })
        }
        appendFamilyDivs(firstFamily, domStructure);

        const graph = document.getElementById("graph");
        graph.append(firstFamily.div);

        Family.updateAll();
    }, { once: true });

    reader.readAsText(file);
});

function createStructureObject(from=document.getElementById("graph")) {
    if (from.id === "graph") {
        return createStructureObject(from.children[0]);
    }
    if (from.id.includes("family")) {
        const ID = Family.getIDFromDiv(from);
        return {
            familyID: ID,
            parents: Array.from(from.children[0].children, (parent) => createStructureObject(parent)),
            children: Array.from(from.children[1].children, (child) => createStructureObject(child)),
        }
    }
    if (from.classList.contains("person")) {
        return from.person.id;
    }
}
