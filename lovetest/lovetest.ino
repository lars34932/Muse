#include "DHT.h"
#define DHTTYPE DHT11       // DHT 11 sensor
const int DHTPin = A0;        // DHT Sensor data input
DHT dht(DHTPin, DHTTYPE);   // Initialize DHT sensor. 
const float Temperature;          // temperature 

void setup() {
    uint8_t Led1 = D1;
  
    pinMode(Led1, OUTPUT);
    pinMode(Led2, OUTPUT);
    pinMode(Led3, OUTPUT);

    digitalWrite(Led1, LOW);
    digitalWrite(Led2, LOW);
    digitalWrite(Led3, LOW);

}

void loop() {
  float temperature =  round(dht.readTemperature()*10)/10; // Gets the values of the temperature
  if(isnan(temperature) || isnan(humidity) || isnan(heatindex)){
        // sensor error
        Serial.println("DHT11 sensor error");
    }
    else{
        // the DHT11 readings look ok 
        Temperature = temperature;
        // show in Serial Monitor
        Serial.print("Temp. ");
        Serial.print(Temperature);
      }
    Serial.begin(115200);      //  Start de serial monitor

}
