/**
 * mondrianizer 2
 * Press spacebar to pause / continue
 */
let mWidth;
let mCanvas;
let bgC;
let lineC;
let canvasC;
let frameC;
let gridW;
let lineW;
let myLoop;

function setup() {
    mWidth = 600;
    mCanvas = 0.5 * mWidth;

    createCanvas(482, 482);
    
    gridW = 2;
    lineW = 6;
    
    bgC = color(143);
    lineC = color(46);
    canvasC = color(147);
    frameC = color(230);

    myLoop = true;
}

function draw() {
    frameRate(1);
    background(255);

    translate(240, 30);
    rotate(PI/4);
    stroke(canvasC);
    strokeCap(SQUARE);
    strokeWeight(1);
    fill(bgC);
    rect(0, 0, mCanvas, mCanvas);

    for (let x = 0; x < mCanvas; x += (mCanvas / 8)) {
        stroke(lineC);
        strokeWeight(gridW);
        line(x, 0, x, mCanvas);
        line(0, x, mCanvas, x);
        for (let y = 0; y < mCanvas; y += (mCanvas / 8)) {
            let flag1 = boolean(round(random(1)));
            let weight1 = flag1 == false ? gridW : lineW;

            strokeWeight(weight1);
            line(x, y, (x + (mCanvas / 8)), (y + (mCanvas / 8)));

            let flag2 = boolean(round(random(1)));
            let weight2 = flag2 == false ? gridW : lineW;

            strokeWeight(weight2);
            line((x + (mCanvas / 8)), y, x, (y + (mCanvas / 8)));
        }
    }

    let myStrokeWeight = 20;
    strokeWeight(myStrokeWeight);
    stroke(frameC);
    noFill();
    rect(- myStrokeWeight / 2, - myStrokeWeight / 2,
         mCanvas + myStrokeWeight,
         mCanvas + myStrokeWeight
        );
}

function keyPressed() {
    if (keyCode === 32) {
        if (myLoop === true) {
            myLoop = false;
            noLoop();
        } else {
            myLoop = true;
            loop();
        }
    }
}