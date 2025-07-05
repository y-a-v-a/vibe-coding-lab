// binary clock
void setup() {
  size(480,280);
  smooth();
}

void draw() {
  background(0,0,30);
  stroke(0,0,255);

  float s = second();
  drawBinaryLine(s, 40);
  
  float m = minute();
  drawBinaryLine(m, 80);
  
  float h = hour();
  drawBinaryLine(h, 120);
  
  float d = day();
  drawBinaryLine(d, 160);
  
  float mn = month();
  drawBinaryLine(mn, 200);
  
  float y = year();
  drawBinaryLine(y, 240);
}

void drawBinaryLine(float s, int p) {
  for (int i = 10; i >= 0; i-=1) {
    // 59
    // 0 0 0 0 0 1 1 1 1 0 0
    if (pow(2, i) <= s) { // 32 lower than 59?
      s = s - pow(2,i); // 59 - 32 = 28
      fill(0,0,255);
      ellipse(440 - (i * 40), p, 20, 20);
    } else {
      noFill();
      ellipse(440 - (i * 40), p, 20, 20);
    }
  }
}

