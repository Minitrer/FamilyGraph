# FamilyGraph
#### Video Demo:  <URL HERE>
#### Description:
This is a static web application made for CS50x 2025's Final Project that allows you to create a family tree and visualize the relationships between family members. It was programmed in Javascript, HTML and CSS with no external frameworks or libraries.
#### How to use:
- Host `index.html` locally using something like `http-server` or [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
- The controls for the app can be viewed at anytime by hovering over the help icon on the top left, mobile controls are also supported, at least on Firefox and Chrome.
#### Implementation Details:
Whenever a new person is created, data of the person's relationships, position and connections are created and maintained. The person can be connected directly to their spouce, their parents or to connection points that indicate a group of people in the same family (i.e siblings or spouces). Clicking and dragging is done by updating a CSS variable with JS and animated using the `transform` [CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/transform).

Since the position of elements is animated using CSS, the DOM structure is used to organize the elements instead. Each family has a `div` with a parent `div` and a children `div`, the parent `div`s can contain person `div`s, the children `div`s can contain both person `div`s and nested family `div`s. The graph is structured to expand vertically with each generation on the same height and horizontally for people in the same generation.

