import createConnection from './connection.js';
import Vec2 from './vec2.js';

document.addEventListener("DOMContentLoaded", () => {

    const from = new Vec2(200, 200);
    const upleft =  new Vec2(150, 100);
    const upright = new Vec2(250, 100);
    const leftup = new Vec2(100, 150);
    const leftdown = new Vec2(100, 250);
    const downleft = new Vec2(150, 300);
    const downright = new Vec2(250, 300);
    const rightup = new Vec2(300, 150);
    const rightdown = new Vec2(300, 250);

    createConnection(from, upleft, "up", "red");
    createConnection(from, upright, "up", "orange");
    createConnection(from, leftup, "left", "yellow");
    createConnection(from, leftdown, "left", "green");
    createConnection(from, downleft, "down", "blue");
    createConnection(from, downright, "down", "cyan");
    createConnection(from, rightup, "right", "purple");
    createConnection(from, rightdown, "right", "pink");
    
    const fromStraight = new Vec2(400, 200);
    const toUp = fromStraight.add(new Vec2(0, -50));
    const toDown = fromStraight.add(new Vec2(0, 50));
    const toLeft = fromStraight.add(new Vec2(-50));
    const toRight = fromStraight.add(new Vec2(50));

    createConnection(fromStraight, toUp, "up");
    createConnection(fromStraight, toDown, "down");
    createConnection(fromStraight, toLeft, "left");
    createConnection(fromStraight, toRight, "right");
});