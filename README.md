# FamilyGraph
#### Video Demo:  https://youtu.be/czbC_4a77j8
#### Description:
This is a static web application made for CS50x 2025's Final Project that allows you to create a family tree and visualize the relationships between family members. It was programmed in Javascript, HTML and CSS with no external frameworks or libraries.
#### How to use:
- Host `index.html` locally using something like `http-server` or [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
- The controls for the app can be viewed at anytime by hovering over the help icon on the top left, mobile controls are also supported, at least on Firefox and Chrome.
- The bottom right icons are Save As, and Open File. Opening a file ***will delete the current graph***.
> [!CAUTION]
> This app does not autosave, nor does it prompt the user to save when loading a new graph. You should save frequently and either replace the file each time or keep multiple versions.
#### Implementation Details:
Whenever a new person is created, data of the person's relationships, position and connections are created and maintained. The person can be connected directly to their spouse, their parents or to connection points that indicate a group of people in the same family (i.e siblings or spouses). Clicking and dragging is done by updating a CSS variable with JS and animated using the [`transform`](https://developer.mozilla.org/en-US/docs/Web/CSS/transform) CSS property.

Since the position of elements is animated using CSS, the DOM structure is used to organize the elements instead. Each family has a `<div>` with a parent `<div>` and a children `<div>`, the parent `<div>`s can contain person `<div>`s, the children `<div>`s can contain both person `<div>`s and nested family `<div>`s. The graph is structured to expand vertically with each generation on the same height and horizontally for people in the same generation.

The connections are drawn using SVGs, they get updated everytime an element is dragged or when their group changes. A group's purpose is to keep track of the connections and connection points of a small family, consisting only of parents and their children, hence the name of `ParentChildGroup`. A family can contain multiple groups and a person can be in many different groups, this allows for the distinction of different families that are seperated because of a change in marriage, like stepfamilies.

Relationships are created when a person is created and uses existing relationships of the directly related family member (spouse, parent or child). For example, when a child is added to a family, they look at their parents relationships to copy and vice versa, their parent's parents are their Grandparents, their parent's siblings are their aunts and uncles, etc. When a person is selected, all of their relationships generate a text to display using data like the gender, whether they're an "in-law" or "step-" family member or cousin data like degrees of seperations.

Any interaction that can be Undone or Redone are Actions, each action has an undo function and a redo function and gets stored on the undo/redo stack, the stack has a max size of 20. This uses the [Command pattern](https://en.wikipedia.org/wiki/Command_pattern) in OOP, a different pattern like saving the entire state of the program was not chosen because of the use of private fields in classes.

When the graph is saved, only what is necessary to recreate the graph is stored in the downloaded `.json`, when a graph is loaded, the current graph gets wiped and the loaded graph gets recreated.

There are some example graphs included for you to load and play with.

#### **JS Scripts:**
- `actions.js`: Contains every action and handles undo/redo-ing.
- `connection.js`: Has the function to create the connection svgs.
- `controls.js`: Contains most of the controls for using the app, the context-menu and rendering the relationship texts when a person is selected.
- `family.js`: Contains the `Family` and `ParentChildGroup` classes. The `Family` class keep tracks of the `<div>`s, the groups and is responsible for drawing a given person's connections. The `ParentChildGroup` handles the connections and connection points of its members, each group can have a parents connection point and a children connnection point.
- `pan-zoom-and-drag.js`: Most of the logic for panning the graph, zooming in and out and dragging certain elements.
- `person.js`: Contains the `Person` class responsible for keeping the data of a person's relationships, position, connections and interacts with larger encompassing classes like `ParentChildGroup`s and `Family`s.
- `relationship.js`: Creates the relationships between family members whenever a new person is added, using data to create an up-to-date relationship text. Also has the logic for figuring out complex relationships like cousin numbers and seperations.
- `save-and-load.js`: When saving, generates the JSON objects needed to recreate the graph and downloads it, when downloading, deletes the current graph and recreate the loaded graph from the JSON data.
- `vec2.js`: Helper class for 2D vector calculations.
#### Limitations:
- Marriages between different generations aren't supported so situations like [I'm My Own Grandpa](https://www.youtube.com/watch?v=vDrsiGw1FIw) can't exist.
- Incestual marriages aren't supported.
- Co-parent relationships (a parent's child's parent-in-law or the relationship between stepfamilies's seperated parents) aren't supported.
- Any relationship that doesn't have an established term is left empty instead of including the relationship of a relative (E.g. Sister-in-law's brother).
- I've only tested the app on Firefox and Chrome so other browsers like Edge or Safari may be buggy or not work entirely.
- Does not support light-mode.
