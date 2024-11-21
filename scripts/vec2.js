export default class Vec2 {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    subtract(v) {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    divide(k) {
        return new Vec2(this.x / k, this.y / k);
    }
    multiply(k) {
        return new Vec2(this.x * k, this.y * k);
    }
    magnitude() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    normalized() {
        return this.divide(this.magnitude());
    }
    dot(v) {
        return this.x * v.x + this.y * v.y
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    angleTo(v) {
        return Math.asin(this.dot(v) / (this.magnitude() * v.magnitude()))
    }
}