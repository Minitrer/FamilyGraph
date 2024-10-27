import Family from './family.js';
import Node from './node.js';
import createConnection from './connection.js';

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

    const from = {
        x: 10,
        y: 10,
    }
    const to = {
        x: 200,
        y: 500,
    }
    const connection = createConnection(from, to, "right")
});