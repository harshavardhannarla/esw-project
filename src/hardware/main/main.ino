#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_BME280.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <Adafruit_SGP30.h>
#include <SDS011.h>


#include <ESP8266WiFi.h>
#include "ThingSpeak.h"
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <WiFiClient.h>

#include "AES.h"
#include "base64.h"


  
#include "sha256.h"
#include <string>

AES aes;

byte key[] = { 0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6, 0xAB, 0xF7, 0x15, 0x88, 0x09, 0xCF, 0x4F, 0x3C };

byte my_iv[N_BLOCK] = { 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
String msg; //create message string
String iv4;


uint8_t getrnd() {
    uint8_t really_random = *(volatile uint8_t *)0x3FF20E44;
    return really_random;
}

// Generate a random initialization vector
void gen_iv(byte  *iv) {
    for (int i = 0 ; i < N_BLOCK ; i++ ) {
        iv[i]= (byte) getrnd();
    }
}

String testAES128()  {

    char b64data[200];
    byte cipher[1000];
    byte iv [N_BLOCK] ;
    
    //Serial.println("Let's encrypt:");
    
    aes.set_key( key , sizeof(key));  // Get the globally defined key
    gen_iv( my_iv );                  // Generate a random IV
    
    // Print the IV
    b64_encode( b64data, (char *)my_iv, N_BLOCK);
    //Serial.println(" IV b64: " + String(b64data));
    iv4 = String(b64data);
       
    //Serial.println(" Mensagem: " + msg );
 
    int b64len = b64_encode(b64data, (char *)msg.c_str(),msg.length());
    //Serial.println (" Message in B64: " + String(b64data) );
    //Serial.println (" The lenght is:  " + String(b64len) );
    
    // For sanity check purpose
    //b64_decode( decoded , b64data , b64len );
    //Serial.println("Decoded: " + String(decoded));
    
    // Encrypt! With AES128, our key and IV, CBC and pkcs7 padding    
    aes.do_aes_encrypt((byte *)b64data, b64len , cipher, key, 128, my_iv);
    
    //Serial.println("Encryption done!");
    
    //Serial.println("Cipher size: " + String(aes.get_size()));
    
    b64_encode(b64data, (char *)cipher, aes.get_size() );
    //Serial.println ("Encrypted data in b64: " + String(b64data) );
      
    //Serial.println("Done...");

    return String(b64data);
}

WiFiClient client;
unsigned long myChannelNumber = 1519907;
const char * myWriteAPIKey = "F2YBHTZO9IZP34OO";


char * ssid  = "NANDU 3RD FLOOR-B-4G";
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

#define DHTPIN 10
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);





String serverName = "http://3.23.18.168:5000/records/";


//oneM2M variables
//String CSE_IP      = "esw-onem2m.iiit.ac.in";  
const char *host = "esw-onem2m.iiit.ac.in";

int WIFI_DELAY  = 100; //ms

// oneM2M : CSE params
int   CSE_HTTP_PORT = 443;
String CSE_NAME    = "in-name";
String CSE_M2M_ORIGIN  = "r6QdGr7YEB:laM0VCTe6P";


const char fingerprint[] PROGMEM = "10 3D D5 4E B1 47 DB 4B 5C B0 89 08 41 A7 A4 14 87 10 7F E8";

// oneM2M : resources' params
int TY_AE  = 2;
int TY_CNT = 3;
int TY_CI  = 4;
int TY_SUB = 23;

// HTTP constants
int LOCAL_PORT = 9999;
char* HTTP_CREATED = "HTTP/1.1 201 Created";
char* HTTP_OK    = "HTTP/1.1 200 OK\r\n";
int REQUEST_TIME_OUT = 5000; //ms

int SERIAL_SPEED  = 9600;

String doPOST(String url, int ty, String rep) {
  

  /* Serial.println(url);
  Serial.println(ty);
  Serial.println(rep); */
  //return "p";  
  String postRequest = String() + "POST " + url + " HTTP/1.1\r\n" +
                       "Host: " + host + ":" + CSE_HTTP_PORT + "\r\n" +
                       "X-M2M-Origin: " + CSE_M2M_ORIGIN + "\r\n" +
                       "Content-Type: application/json;ty=" + ty + "\r\n" +
                       "Content-Length: " + rep.length() + "\r\n"
                       "Connection: close\r\n\n" +
                       rep;

  // Connect to the CSE address

 // Serial.println("connecting to " + CSE_IP + ":" + CSE_HTTP_PORT + " ...");
  // Get a client
  WiFiClientSecure httpsClient;
  
  httpsClient.setFingerprint(fingerprint);
  //httpsClient.setTimeout(15000);
  delay(1000);
  //httpsClient.setInsecure();
  Serial.print("HTTPS Connecting");
  int r=0; //retry counter
  while((!httpsClient.connect(host, CSE_HTTP_PORT)) && (r < 30)){
      delay(100);
      Serial.print(".");
      r++;
  }
  if(r==30) {
    Serial.println("Connection failed");
  }
  else {
    Serial.println("Connected to web");
  }
  
  // if connection succeeds, we show the request to be send

  //Serial.println(postRequest);


  // Send the HTTP POST request
  httpsClient.print(postRequest);


  Serial.println("request sent");  
  
  while (httpsClient.connected()) {
    String line = httpsClient.readStringUntil('\n');
    if (line == "\r") {
      Serial.println("headers received");
      break;
    }
  }

  //Serial.println("reply was:");
  //Serial.println("==========");
  String line;
  while(httpsClient.available()){        
    line = httpsClient.readStringUntil('\n');  //Read Line by Line
    //Serial.println(line); //Print response
  }
  //Serial.println("==========");
  //Serial.println("closing connection");
    String stp = "nothing";
  return stp;
  
}


String createCI(String ae, String cnt1, String cnt2, String ciContent) {
  String ciRepresentation =
    "{\"m2m:cin\": {"
    "\"con\":\"" + ciContent + "\""
    "}}";
  
  return doPOST("/" + CSE_NAME + "/" + ae + "/" + cnt1 + "/" + cnt2, TY_CI, ciRepresentation);
}


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
 
  Serial.println("started");
  Serial.begin(115200);
  
// WiFi.mode(WIFI_STA); 
 

 ThingSpeak.begin(client);
  // initbme();
 
 initsds();
initsgp30();
  initmhz14();
  initdht22();

  WiFi.begin(ssid, password);     //Connect to your WiFi router
  Serial.println("");

  Serial.print("Connecting");
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  //If connection successful show IP address in serial monitor
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
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

   HTTPClient http;
   http.begin(client, serverName);
   http.addHeader("Content-Type", "application/json");

   DynamicJsonDocument doc(1024);

   doc["location"]="Hyd";
   doc["temp"]=temp;
   doc["humidity"]=hum;
   doc["pm25"]=pm25;
   doc["pm10"]=pm10;
   doc["co2"]=co2;
   doc["tvoc"]=tvoc;
   doc["eco2"]=eco2;
   doc["h2"]=h2;

   String requestBody;

    serializeJson(doc,requestBody);
    msg = requestBody;
    requestBody = testAES128();
    
    DynamicJsonDocument poc(1024);
    poc["payLoad"]=requestBody;
    poc["iv4"]=iv4;

    uint8_t *hash;

    Sha256.init();
    Sha256.print(requestBody);
    hash = Sha256.result();
  

  
  poc["shaVal"]=String((char*)hash);

    String paystr;
    serializeJson(poc,paystr);
       
  int httpResponseCode = http.POST(paystr);
  if(httpResponseCode>0){
      String response = http.getString();                       
      Serial.println(httpResponseCode);   
      Serial.println(response); 
    }
  else if(httpResponseCode == -11)
  {

  }
  else {
    Serial.println(httpResponseCode);
     Serial.printf("Error occurred while sending HTTP POST: %s\n", http.getString());
     Serial.println(paystr.length());
  } 


  int st= ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
  if(st == 200){
    Serial.println("Channel update successful.");
  }
  else{
    Serial.println("Problem updating channel. HTTP error code " + String(st));
  }

  String str = String("Hyd")+String(temp)
              +String(",")+String(hum)
              +String(",")+String(pm25)
              +String(",")+String(pm10)
              +String(",")+String(co2)
              +String(",")+String(tvoc)
              +String(",")+String(eco2)
              +String(",")+String(h2);


  createCI("Team-30","Node-1","Data",str);
  delay(delay_time); //thingspeak limit
  
}