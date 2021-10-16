#include <DHT.h>
#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <Adafruit_SGP30.h>

#include <SDS011.h>
// #include <SoftwareSerial.h>
#include <ESP8266WiFi.h>
#include "ThingSpeak.h"

WiFiClient client;
unsigned long myChannelNumber = 1519907;
const char * myWriteAPIKey = "F2YBHTZO9IZP34OO";



char * ssid  = "NANDU 3 FLOOR B";
char * password  = "9666699977";

SoftwareSerial SerialCom(D3, D4); // RX, TX


#define SDS_RX_PIN D5
#define SDS_TX_PIN D6
SDS011 my_sds;


#define SEALEVELPRESSURE_HPA (1013.25)
Adafruit_BME280 bme; // I2C

Adafruit_SGP30 sgp;


float pm10,pm25,temp,hum,tvoc,eco2,h2,ethanol,co2;
int delay_time=60000;

#define DHTPIN 13 
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);


void initsds()
{
  my_sds.begin(D5,D6);//rx,tx

}

void sdsout(){
    int sds_val = my_sds.read(&pm25,&pm10);
	if (! sds_val) {
    
		Serial.println("P2.5: "+String(pm25));
		Serial.println("P10:  "+String(pm10));
	}
  else{
    pm25=-1;pm10=-1;
    Serial.println("Sds Not working");
  }
}

void initbme()
{   unsigned  status = bme.begin(0x77);  
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
    tvoc=-1;eco2=-1;
    return;
  }
  tvoc=sgp.TVOC;
  eco2=sgp.eCO2;
  Serial.print("TVOC "); Serial.print(tvoc); Serial.print(" ppb\t");
  Serial.print("eCO2 "); Serial.print(eco2); Serial.println(" ppm");

  if (! sgp.IAQmeasureRaw()) {
    Serial.println("Raw Measurement failed");
    h2=-1;ethanol=-1;
    return;
  }
  h2=sgp.rawH2;
  ethanol=sgp.rawEthanol;
  Serial.print("Raw H2 "); Serial.print(sgp.rawH2); Serial.print(" \t");
  Serial.print("Raw Ethanol "); Serial.print(sgp.rawEthanol); Serial.println("");
 

  /* counter++;
  if (counter == 30) {
    counter = 0;

    uint16_t TVOC_base, eCO2_base;
    if (! sgp.getIAQBaseline(&eCO2_base, &TVOC_base)) {
      Serial.println("Failed to get baseline readings");
      return;
    }
    Serial.print("****Baseline values: eCO2: 0x"); Serial.print(eCO2_base, HEX);
    Serial.print(" & TVOC: 0x"); Serial.println(TVOC_base, HEX);
  }*/
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

co2=ppm_uart;
Serial.print(ppm_uart);
Serial.println("ppm");

}

void initdht22(){
  dht.begin();
}

void dht22out(){
    float h = dht.readHumidity();
    float t = dht.readTemperature();
  

  
  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    hum=-1;temp=-1;
    return;
  }

  // Compute heat index in Fahrenheit (the default)
  //float hif = dht.computeHeatIndex(f, h);
  // Compute heat index in Celsius (isFahreheit = false)
  //float hic = dht.computeHeatIndex(t, h, false);

  hum=h;temp=t;
  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.print(F("°C "));
 // Serial.print(f);
  //Serial.print(F("°F  Heat index: "));
  //Serial.print(hic);
  //Serial.print(F("°C "));
  //Serial.print(hif);
  //Serial.println(F("°F"));
}




void setup() {
	pinMode(D0,OUTPUT);
 
	
	Serial.begin(115200);
  
// WiFi.mode(WIFI_STA); 
 

 ThingSpeak.begin(client);
	// initbme();
 
 initsds();
initsgp30();
  initmhz14();
  initdht22();
}

void loop() {
   
     if(WiFi.status() != WL_CONNECTED){
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
      WiFi.begin(ssid, password);  // Connect to WPA/WPA2 network. Change this line if using open or WEP network

    while(WiFi.status() != WL_CONNECTED){
      Serial.print(".");
      delay(5000);     
    } 
    Serial.println("\nConnected.");
  }
  
	digitalWrite(D0,HIGH);
	delay(1000);
	digitalWrite(D0,LOW);

  
  
  dht22out();
  Serial.println();

   sdsout();
  Serial.println();


  sgpout();
  Serial.println();

  mhz14out();
  Serial.println(); 
  
  
  ThingSpeak.setField(1,temp);
  ThingSpeak.setField(2,hum);
  ThingSpeak.setField(3,pm25);
  ThingSpeak.setField(4,pm10);
  ThingSpeak.setField(5, co2);
  ThingSpeak.setField(6,tvoc);
  ThingSpeak.setField(7,eco2);
  ThingSpeak.setField(8,h2);

  int st= ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
  if(st == 200){
    Serial.println("Channel update successful.");
  }
  else{
    Serial.println("Problem updating channel. HTTP error code " + String(st));
  }
  
	delay(delay_time); //thingspeak limit
  
}
