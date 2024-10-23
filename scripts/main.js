import Family from './family.js';
import Node from './node.js';

document.addEventListener("DOMContentLoaded", () => {
    const graph = document.getElementsByClassName("graph")[0];
    const parents = [
        new Node("Parent G0"),
        new Node("Parent G0")
    ];
    const children = [
        new Family([   
                new Node("Parent G1"),
                new Node("Parent G1")
            ],[
                new Node("Child G2"),
                new Node("Child G2"),
                new Node("Child G2")
            ]
        ),
        new Node("Child G1"),
        new Node("Child G1")
    ];
    const family = new Family(parents, children);
    graph.appendChild(family.div);

    
    let clickedPos = {
        x: 0,
        y: 0
    }
    let transformPos = {
        x: 0,
        y: 0
    }

    function pan(event) {
        graph.style.transform = `translate(${transformPos.x + event.pageX - clickedPos.x}px, ${transformPos.y + event.pageY - clickedPos.y}px)`;
    }

    document.addEventListener("mousedown", (event) => {
        if (event.target.classList.contains("node") || event.target.parentElement.classList.contains("node")) {
            return;
        }
        clickedPos.x = event.pageX;
        clickedPos.y = event.pageY;

        document.addEventListener("mousemove", pan);

        document.addEventListener("mouseup", (event) => {
            transformPos.x += event.pageX - clickedPos.x;
            transformPos.y += event.pageY - clickedPos.y; 
            document.removeEventListener("mousemove", pan);
        }, {once: true});
    });
});