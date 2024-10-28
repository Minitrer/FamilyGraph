import Family from './family.js';
import Node from './node.js';
import createConnection from './connection.js';
import Vec2 from './vec2.js';

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

    const from = new Vec2(200, 200);
    const upleft =  new Vec2(150, 100);
    const upright = new Vec2(250, 100);
    const leftup = new Vec2(100, 150);
    const leftdown = new Vec2(100, 250);
    const downleft = new Vec2(150, 300);
    const downright = new Vec2(250, 300);
    const rightup = new Vec2(300, 150);
    const rightdown = new Vec2(300, 250);

    createConnection(from, upleft, "up", "red", false);
    createConnection(from, upright, "up", "orange", false);
    createConnection(from, leftup, "left", "yellow", false);
    createConnection(from, leftdown, "left", "green", false);
    createConnection(from, downleft, "down", "blue", false);
    createConnection(from, downright, "down", "cyan", false);
    createConnection(from, rightup, "right", "purple", false);
    createConnection(from, rightdown, "right", "pink", false);
    
    const fromStraight = new Vec2(400, 200);
    const toUp = fromStraight.add(new Vec2(0, -50));
    const toDown = fromStraight.add(new Vec2(0, 50));
    const toLeft = fromStraight.add(new Vec2(-50));
    const toRight = fromStraight.add(new Vec2(50));

    createConnection(fromStraight, toUp, "up", "white", false);
    createConnection(fromStraight, toDown, "down", "white", false);
    createConnection(fromStraight, toLeft, "left", "white", false);
    createConnection(fromStraight, toRight, "right", "white", false);
});