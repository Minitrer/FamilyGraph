import Family from "./family.js";
import { PEOPLE } from "./person.js";
import Person from "./person.js";

const saveDiv = document.getElementById("save");
const input = document.getElementById("import");

saveDiv.addEventListener("click", (event) => {
    if (PEOPLE.length === 0) {
        return;
    }
    event.preventDefault();

    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(PEOPLE, null, 4)], { type: "text/plain" });
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
        const newPeople = JSON.parse(reader.result);
        console.debug(newPeople);

        // TODO: Make loop to recreate saved state
        // Person.setPEOPLE(Array.from(newPeople, (object) => new Person()));
        // PEOPLE.forEach((person, i) => person.load(newPeople[i]));
        
        console.debug(PEOPLE);
    }, { once: true });

    reader.readAsText(file);
});
