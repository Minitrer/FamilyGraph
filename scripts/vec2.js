export default class Vec2 {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    div(k) {
        return new Vec2(this.x / k, this.y / k);
    }
    mult(k) {
        return new Vec2(this.x * k, this.y * k);
    }
    magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    normalized() {
        return this.div(this.magnitude());
    }
}