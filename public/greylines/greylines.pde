/**
 * mondrianizer 2
 * Press spacebar to pause / continue
 */
int mWidth;
float mCanvas;
color bgC;
color lineC;
color canvasC;
color frameC;
int gridW;
int lineW;
boolean myLoop;

void setup() {
    mWidth = 600;
    mCanvas = 0.5 * mWidth;

    size(482, 482);
    smooth();
    
    gridW = 2;
    lineW = 6;
    
    bgC = color(143);
    lineC = color(46);
    canvasC = color(147);
    frameC = color(230);

    myLoop = true;
}

void draw() {
    frameRate(1);
    background(255);

    translate(240, 30);
    rotate(PI/4);
    stroke(canvasC);
    strokeCap(SQUARE);
    strokeWeight(1);
    fill(bgC);
    rect(0, 0, mCanvas, mCanvas);

    for (float x = 0; x < mCanvas; x += (mCanvas / 8)) {
        stroke(lineC);
        strokeWeight(gridW);
        line(x, 0, x, mCanvas);
        line(0, x, mCanvas, x);
        for (float y = 0; y < mCanvas; y += (mCanvas / 8) ) {
            boolean flag1 = boolean(round(random(1)));
            float weight1 = flag1 == false ? gridW : lineW;

            strokeWeight(weight1);
            line(x, y, (x + (mCanvas / 8)), (y + (mCanvas / 8)));

            boolean flag2 = boolean(round(random(1)));
            float weight2 = flag2 == false ? gridW : lineW;

            strokeWeight(weight2);
            line((x + (mCanvas / 8)), y, x, (y + (mCanvas / 8)));
        }
    }

    float myStrokeWeight = 20;
    strokeWeight(myStrokeWeight);
    stroke(frameC);
    noFill();
    rect(- myStrokeWeight / 2, - myStrokeWeight / 2,
         mCanvas + myStrokeWeight,
         mCanvas + myStrokeWeight
        );
}

void keyPressed() {
    if (keyCode == 32) {
        if (myLoop == true) {
            myLoop = false;
            noLoop();
        } else {
            myLoop = true;
            loop();
        }
    }
}




