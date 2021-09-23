#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <Adafruit_SGP30.h>

#include <SDS011.h>
#include <SoftwareSerial.h>
SoftwareSerial SerialCom(D5, D6); // RX, TX


#define SDS_RX_PIN D5
#define SDS_TX_PIN D6
SDS011 my_sds;


#define SEALEVELPRESSURE_HPA (1013.25)
Adafruit_BME280 bme; // I2C

Adafruit_SGP30 sgp;


float p10,p25,temp,hum;
int delay_time=15000;


void initsds()
{my_sds.begin(D5,D6);//rx,tx

}

void sdsout(){
    int sds_val = my_sds.read(&p25,&p10);
	if (! sds_val) {
		Serial.println("P2.5: "+String(p25));
		Serial.println("P10:  "+String(p10));
	}
}

void initbme()
{ unsigned  status = bme.begin(0x77);  
    // You can also pass in a Wire library object like &Wire2
    // status = bme.begin(0x76, &Wire2)
    if (!status) {
        Serial.println("Could not find a valid BME280 sensor, check wiring, address, sensor ID!");
        Serial.print("SensorID was: 0x"); Serial.println(bme.sensorID(),16);
        Serial.print("        ID of 0xFF probably means a bad address, a BMP 180 or BMP 085\n");
        Serial.print("   ID of 0x56-0x58 represents a BMP 280,\n");
        Serial.print("        ID of 0x60 represents a BME 280.\n");
        Serial.print("        ID of 0x61 represents a BME 680.\n");
        while (1) {delay(1000);   Serial.println("SensorID was: 0x"); Serial.println(bme.sensorID(),16);}
    }
    
    Serial.println("-- Default Test --");


    Serial.println();
	
}

void initsgp30()
{if (! sgp.begin()){
    Serial.println("Sensor not found :(");
    while (1);
  }
  Serial.print("Found SGP30 serial #");
  Serial.print(sgp.serialnumber[0], HEX);
  Serial.print(sgp.serialnumber[1], HEX);
  Serial.println(sgp.serialnumber[2], HEX);
}
int counter = 0;
void sgpout(){
     // If you have a temperature / humidity sensor, you can set the absolute humidity to enable the humditiy compensation for the air quality signals
  //float temperature = 22.1; // [°C]
  //float humidity = 45.2; // [%RH]
  //sgp.setHumidity(getAbsoluteHumidity(temperature, humidity));

  if (! sgp.IAQmeasure()) {
    Serial.println("Measurement failed");
    return;
  }
  Serial.print("TVOC "); Serial.print(sgp.TVOC); Serial.print(" ppb\t");
  Serial.print("eCO2 "); Serial.print(sgp.eCO2); Serial.println(" ppm");

  if (! sgp.IAQmeasureRaw()) {
    Serial.println("Raw Measurement failed");
    return;
  }
  Serial.print("Raw H2 "); Serial.print(sgp.rawH2); Serial.print(" \t");
  Serial.print("Raw Ethanol "); Serial.print(sgp.rawEthanol); Serial.println("");
 

  counter++;
  if (counter == 30) {
    counter = 0;

    uint16_t TVOC_base, eCO2_base;
    if (! sgp.getIAQBaseline(&eCO2_base, &TVOC_base)) {
      Serial.println("Failed to get baseline readings");
      return;
    }
    Serial.print("****Baseline values: eCO2: 0x"); Serial.print(eCO2_base, HEX);
    Serial.print(" & TVOC: 0x"); Serial.println(TVOC_base, HEX);
  }
}

void bmeout(){
    	Serial.print("Temperature = ");
    Serial.print(bme.readTemperature());
    Serial.println(" °C");

    Serial.print("Pressure = ");

    Serial.print(bme.readPressure() / 100.0F);
    Serial.println(" hPa");

    Serial.print("Approx. Altitude = ");
    Serial.print(bme.readAltitude(SEALEVELPRESSURE_HPA));
    Serial.println(" m");

    Serial.print("Humidity = ");
    Serial.print(bme.readHumidity());
    Serial.println(" %");

    Serial.println();  
	
}

void initmhz14(){
  SerialCom.begin(9600);
  delay(10000);

}


void mhz14out(){
  
   

  


  byte addArray[] = {0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79};
  char dataValue[9];
  
  SerialCom.write(addArray, 9);
  SerialCom.readBytes(dataValue, 9);

  int resHigh = (int) dataValue[2];
  int resLow  = (int) dataValue[3];
  int ppm_uart = (resHigh*256)+resLow;

Serial.print(ppm_uart);

}






void setup() {
	pinMode(D0,OUTPUT);
 
	//initsds();
	Serial.begin(115200);

	//initbme();
	//initsgp30();
  initmhz14();
}

void loop() {
	digitalWrite(D0,HIGH);
	delay(1000);
	digitalWrite(D0,LOW);

  //sgpout();
  mhz14out();


  
	delay(delay_time); //thingspeak limit
  
} 




/***************************************************************************
  This is a library for the BME280 humidity, temperature & pressure sensor
  Designed specifically to work with the Adafruit BME280 Breakout
  ----> http://www.adafruit.com/products/2650
  These sensors use I2C or SPI to communicate, 2 or 4 pins are required
  to interface. The device's I2C address is either 0x76 or 0x77.
  Adafruit invests time and resources providing this open source code,
  please support Adafruit andopen-source hardware by purchasing products
  from Adafruit!
  Written by Limor Fried & Kevin Townsend for Adafruit Industries.
  BSD license, all text above must be included in any redistribution
  See the LICENSE file for details.
 ***************************************************************************/

/* #include <Wire.h>
#include <SPI.h>


#define BME_SCK 13
#define BME_MISO 12
#define BME_MOSI 11
#define BME_CS 10


//Adafruit_BME280 bme(BME_CS); // hardware SPI
//Adafruit_BME280 bme(BME_CS, BME_MOSI, BME_MISO, BME_SCK); // software SPI



void setup() {
    Serial.begin(9600);
    while(!Serial);    // time to get serial running
    Serial.println(F("BME280 test"));

    unsigned status;
    
    // default settings
    
}


void loop() { 
    printValues();
    delay(delayTime);
}


void printValues() {
    
} */
