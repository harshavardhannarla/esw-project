/* ESP8266 MOD
BH1750- Light Sensor
SDS011- PM2.5,PM10
GY-BM E/P 280 - Temperature and Atmospheric pressure
SGP30 - VOC and eco2 sensor
Bread Board , Jumper Wires and Solder Gun */




#include <Wire.h>         // adds I2C library 
#include <BH1750.h>       // adds BH1750 library file 

 
BH1750 lightMeter;
 
void setup()
{
  Wire.begin();
// Wire.begin (SDA pin, SCL pin);
  Serial.begin(9600);
  
  lightMeter.begin();
 
}
void loop() 
{
  
  float lux = lightMeter.readLightLevel();
  Serial.print("Light Meter: ");
  Serial.print(lux);
  Serial.println(" lx");
  
  delay(1000);
}