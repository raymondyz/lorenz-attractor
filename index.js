// =================================================================================================
// ==== Classes ====================================================================================
// =================================================================================================
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.getDist = function (vec1, vec2) {
        return Math.sqrt(Math.pow((vec1.x - vec2.x), 2) + Math.pow((vec1.y - vec2.y), 2));
    };
    Utils.getRandFloat = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    // Random integer from min to max inclusive
    Utils.getRandInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    Utils.bound = function (value, bound1, bound2) {
        var max = Math.max(bound1, bound2);
        var min = Math.min(bound1, bound2);
        return Math.max(Math.min(value, max), min);
    };
    return Utils;
}());
var Vector3 = /** @class */ (function () {
    function Vector3(x, y, z) {
        this.x = x !== null && x !== void 0 ? x : 1;
        this.y = y !== null && y !== void 0 ? y : 1;
        this.z = z !== null && z !== void 0 ? z : 1;
    }
    Vector3.prototype.getCopy = function () {
        return new Vector3(this.x, this.y, this.z);
    };
    Vector3.prototype.getScaled = function (scaler) {
        return new Vector3(scaler * this.x, scaler * this.y, scaler * this.z);
    };
    Vector3.prototype.scale = function (scaler) {
        this.x *= scaler;
        this.y *= scaler;
        this.z *= scaler;
    };
    Vector3.prototype.getNeg = function () {
        return this.getScaled(-1);
    };
    Vector3.prototype.getMagnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
    };
    Vector3.prototype.getAddition = function (other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
    };
    Vector3.prototype.add = function (other) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
    };
    // self.diff(other) = other - self
    // self + self.diff(other) = other
    Vector3.prototype.getDifference = function (other) {
        return new Vector3(other.x - this.x, other.y - this.y, other.z - this.z);
    };
    // !!! Ignores zero vectors
    Vector3.prototype.getNormalized = function () {
        var mag = this.getMagnitude();
        // Return <0,0> if input is zero vector
        if (mag === 0) {
            return new Vector3(0, 0, 0);
        }
        return this.getScaled(1 / mag);
    };
    // !!! Ignores zero vectors
    Vector3.prototype.normalize = function () {
        var mag = this.getMagnitude();
        // Do nothing if zero vector
        if (mag === 0) {
            return;
        }
        this.scale(1 / mag);
    };
    Vector3.prototype.getDotProduct = function (other) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    };
    // Returns current vector projected onto a basis vector
    // (basis vector does not need to be unit length)
    Vector3.prototype.getProjection = function (basis) {
        if (basis.getMagnitude() === 0) {
            console.error("Cannot project onto a zero basis vector");
        }
        var newMag = this.getDotProduct(basis) / Math.pow(basis.getMagnitude(), 2);
        return basis.getScaled(newMag);
    };
    // Rotate around the X-axis
    Vector3.prototype.getRotatedX = function (theta, axis) {
        if (axis === void 0) { axis = new Vector3(0, 0, 0); }
        var dx = this.x - axis.x;
        var dy = this.y - axis.y;
        var dz = this.z - axis.z;
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var y = dy * cos - dz * sin;
        var z = dy * sin + dz * cos;
        return new Vector3(axis.x + dx, axis.y + y, axis.z + z);
    };
    // Rotate around the Y-axis
    Vector3.prototype.getRotatedY = function (theta, axis) {
        if (axis === void 0) { axis = new Vector3(0, 0, 0); }
        var dx = this.x - axis.x;
        var dy = this.y - axis.y;
        var dz = this.z - axis.z;
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var x = dx * cos + dz * sin;
        var z = -dx * sin + dz * cos;
        return new Vector3(axis.x + x, axis.y + dy, axis.z + z);
    };
    // Rotate around the Z-axis
    Vector3.prototype.getRotatedZ = function (theta, axis) {
        if (axis === void 0) { axis = new Vector3(0, 0, 0); }
        var dx = this.x - axis.x;
        var dy = this.y - axis.y;
        var dz = this.z - axis.z;
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var x = dx * cos - dy * sin;
        var y = dx * sin + dy * cos;
        return new Vector3(axis.x + x, axis.y + y, axis.z + dz);
    };
    return Vector3;
}());
var Tracer = /** @class */ (function () {
    function Tracer(pos, color, maxTailLength) {
        if (pos === void 0) { pos = new Vector3(0, 0, 0); }
        if (color === void 0) { color = "black"; }
        if (maxTailLength === void 0) { maxTailLength = 5000; }
        this.tail = [pos];
        this.color = color;
        this.maxTailLength = maxTailLength;
    }
    // Draws 
    Tracer.prototype.draw = function (ctx, offsetX, offsetY) {
        if (offsetX === void 0) { offsetX = 0; }
        if (offsetY === void 0) { offsetY = 0; }
        var headRadius = 2;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        // Draw head
        var headPos = this.getPos();
        ctx.beginPath();
        ctx.arc.apply(ctx, __spreadArray(__spreadArray([], getScreenPos(headPos), false), [headRadius, 0, 2 * Math.PI], false));
        ctx.fill();
        // Draw tail
        ctx.beginPath();
        ctx.moveTo.apply(ctx, getScreenPos(this.tail[0]));
        for (var _i = 0, _a = this.tail; _i < _a.length; _i++) {
            var tailPos = _a[_i];
            ctx.lineTo.apply(ctx, getScreenPos(tailPos));
        }
        ctx.stroke();
    };
    Tracer.prototype.addSegment = function (pos) {
        this.tail.push(pos);
        if (this.tail.length > this.maxTailLength) {
            this.tail.shift();
        }
    };
    Tracer.prototype.getPos = function () {
        return this.tail[this.tail.length - 1].getCopy();
    };
    Tracer.prototype.update = function (iteratorFunc) {
        this.addSegment(iteratorFunc(this.getPos()));
    };
    return Tracer;
}());
function getScreenPos(pos) {
    var OFFSET_X = 0.5 * CANVAS_RECT.width;
    var OFFSET_Y = 100;
    var SCALE = 1;
    pos = pos.getRotatedZ(angleZ);
    return [SCALE * pos.x + OFFSET_X, CANVAS_RECT.height - (SCALE * pos.z + OFFSET_Y)];
}
// =================================================================================================
// ==== Main Code ==================================================================================
// =================================================================================================
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
// Consts
var CANVAS_RECT = canvas.getBoundingClientRect();
var FPS = 100;
var angleZ = 0;
var prevMousePos = undefined;
var tracerList = [];
tracerList.push(new Tracer(new Vector3(-5, 5, 0), "purple", 1000));
tracerList.push(new Tracer(new Vector3(-4, 0, 5), "blue", 1000));
// Set frame rate
setInterval(updateFrame, 1000 / FPS);
function updateFrame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var _i = 0, tracerList_1 = tracerList; _i < tracerList_1.length; _i++) {
        var tracer = tracerList_1[_i];
        tracer.update(lorenzIterator);
        tracer.draw(ctx);
        console.log(tracer.getPos());
    }
}
function getLorenzGradientVec(_a) {
    var x = _a.x, y = _a.y, z = _a.z;
    var RHO = 28;
    var SIGMA = 10;
    var BETA = 8 / 3;
    var dx = SIGMA * (y - x);
    var dy = x * (RHO - z) - y;
    var dz = (x * y) - (BETA * z);
    return new Vector3(dx, dy, dz);
}
function lorenzIterator(pos) {
    var STEP_SIZE = 0.05;
    var gradientVec = getLorenzGradientVec(pos.getScaled(0.1));
    return pos.getAddition(gradientVec.getScaled(STEP_SIZE));
}
window.addEventListener("mousemove", function (event) {
    if (prevMousePos === undefined) {
        return;
    }
    var d_mouseX = event.clientX - prevMousePos[0];
    angleZ += d_mouseX / 100;
    prevMousePos = [event.clientX, event.clientY];
});
window.addEventListener("mousedown", function (event) {
    prevMousePos = [event.clientX, event.clientY];
});
window.addEventListener("mouseup", function (event) {
    prevMousePos = undefined;
});
window.addEventListener("mouseleave", function (event) {
    prevMousePos = undefined;
});
