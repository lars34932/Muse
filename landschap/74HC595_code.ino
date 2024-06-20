int dataPin1 = 2;
int clockPin1 = 3;
int latchPin1 = 4;

int dataPin2 = 8;
int clockPin2 = 9;
int latchPin2 = 10;

byte leds[2] = {0xFF, 0xFF};

void setup() {
  pinMode(dataPin1, OUTPUT);
  pinMode(clockPin1, OUTPUT);
  pinMode(latchPin1, OUTPUT);

  pinMode(dataPin2, OUTPUT);
  pinMode(clockPin2, OUTPUT);
  pinMode(latchPin2, OUTPUT);

  updateShiftRegisters();
  delay(1000);
}

void loop() {
  for (int i = 0; i < 16; i++) {
    clearLED(i);
    updateShiftRegisters();
    delay(1000);
  }
  for (int i = 0; i < 2; i++) {
    leds[i] = 0xFF;
  }
  updateShiftRegisters();
  delay(1000);
}

void clearLED(int ledNumber) {
  int byteIndex = ledNumber / 8;
  int bitIndex = ledNumber % 8;
  bitClear(leds[byteIndex], bitIndex);
}

void updateShiftRegisters() {
  digitalWrite(latchPin1, LOW);
  shiftOut(dataPin1, clockPin1, MSBFIRST, leds[0]);
  digitalWrite(latchPin1, HIGH);

  digitalWrite(latchPin2, LOW);
  shiftOut(dataPin2, clockPin2, MSBFIRST, leds[1]);
  digitalWrite(latchPin2, HIGH);
}
