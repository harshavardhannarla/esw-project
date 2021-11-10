#include <DHT.h>
#include "Adafruit_SGP40.h"
#include "Adafruit_SHT31.h"
#include <SDS011.h>
#include <SoftwareSerial.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "ThingSpeak.h"
#include <ArduinoJson.h>
#define CO2_RX_PIN 8
#define CO2_TX_PIN 9
#define DHTPIN 4
#define DHTTYPE DHT22
#include <WiFiClientSecure.h>

Adafruit_SGP40 sgp;
Adafruit_SHT31 sht31;

WiFiClient client;
unsigned long myChannelNumber = 1539610;
const char * myWriteAPIKey = "RJIPZ28OH56UTX6F";
char * ssid  = "DK502";
char * password  = "Hello@335";
String serverName = "http://3.23.18.168:5000/records/";

SoftwareSerial SerialCom(CO2_RX_PIN, CO2_TX_PIN); // RX, TX

SDS011 my_sds;

HardwareSerial port(2);

float pm10,pm25,temp=23,hum=96,voc_index,co2;
int delay_time=60000;
DHT dht(DHTPIN, DHTTYPE);


//////



//String serverName = "http://3.23.18.168:5000/records/";


//oneM2M variables
//String CSE_IP      = "esw-onem2m.iiit.ac.in";  
const char *host = "esw-onem2m.iiit.ac.in";

int WIFI_DELAY  = 100; //ms

// oneM2M : CSE params
int   CSE_HTTP_PORT = 443;
String CSE_NAME    = "in-name";
String CSE_M2M_ORIGIN  = "r6QdGr7YEB:laM0VCTe6P";


//const char fingerprint[] PROGMEM = "10 3D D5 4E B1 47 DB 4B 5C B0 89 08 41 A7 A4 14 87 10 7F E8";

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
  
//  httpsClient.setFingerprint(fingerprint);
  httpsClient.setInsecure();
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




////





void initsds()
{
  my_sds.begin(&port);

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
void initsgp40()
{
  while (!Serial) { delay(10); } // Wait for serial console to open!

  Serial.println("SGP40 test");

  if (! sgp.begin()){
    Serial.println("SGP40 sensor not found :(");
    while (1);
  }

  Serial.print("Found SHT3x");
  Serial.print(sgp.serialnumber[0], HEX);
  Serial.print(sgp.serialnumber[1], HEX);
  Serial.println(sgp.serialnumber[2], HEX);
}
void sgp40out(){
  uint16_t sraw;
  
  sraw = sgp.measureRaw(temp, hum);
  Serial.print("Raw measurement: ");
  Serial.println(sraw);

  voc_index = sgp.measureVocIndex(temp, hum);
  Serial.print("Voc Index: ");
  Serial.println(voc_index);
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
Serial.print("Co2: ");
Serial.print(ppm_uart);
Serial.println("ppm");

}
//
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

 //  Compute heat index in Fahrenheit (the default)
  float hif = dht.computeHeatIndex(t, h);
//   Compute heat index in Celsius (isFahreheit = false)
  float hic = dht.computeHeatIndex(t, h, false);

  hum=h;temp=t;
  Serial.print(F("Humidity: "));
  Serial.print(h);
  Serial.print(F("%  Temperature: "));
  Serial.print(t);
  Serial.print(F("°C "));
  Serial.print(F("°F  Heat index: "));
  Serial.print(hic);
  Serial.print(F("°C "));
  Serial.print(hif);
  Serial.println(F("°F"));
}
void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA); 
 ThingSpeak.begin(client); 
  initsds();
  initsgp40();
  initmhz14();
  initdht22();
}

void loop() {
   
     if(WiFi.status() != WL_CONNECTED){
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
      WiFi.begin(ssid, password);  // Connect to WPA/WPA2 network. Change this line if using open or WEP network

    while(WiFi.status() != WL_CONNECTED){
      WiFi.begin(ssid,password);
      Serial.print(".");
      delay(5000);     
    } 
    Serial.println("\nConnected.");
  }
 
  dht22out();
  Serial.println();

   sdsout();
  Serial.println();

  mhz14out();
  Serial.println(); 

   sgp40out();
   Serial.println();
  
  ThingSpeak.setField(1,temp);
  ThingSpeak.setField(2,hum);
  ThingSpeak.setField(3,pm25);
  ThingSpeak.setField(4,pm10);
  ThingSpeak.setField(5, co2);
  ThingSpeak.setField(6,voc_index);

   HTTPClient http;
   http.begin(client, serverName);
   http.addHeader("Content-Type", "application/json");

   DynamicJsonDocument doc(1024);

   doc["location"]="Del";
   doc["temp"]=temp;
   doc["humidity"]=hum;
   doc["pm25"]=pm25;
   doc["pm10"]=pm10;
   doc["co2"]=co2;
   doc["tvoc"]=voc_index;
   doc["eco2"]=-1;
   doc["h2"]=-1;

   String requestBody;

    serializeJson(doc,requestBody);
  int httpResponseCode = http.POST(requestBody);
  if(httpResponseCode>0){
      String response = http.getString();                       
      Serial.println(httpResponseCode);   
      Serial.println(response); 
    }
  else {
     Serial.printf("Error occurred while sending HTTP POST: %s\n", http.getString());
  }




  int st= ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
  if(st == 200){
    Serial.println("Channel update successful.");
  }
  else{
    Serial.println("Problem updating channel. HTTP error code " + String(st));
  }



  ////

   // onem2m code 


    String str = String("Hyd")+String(temp)
              +String(",")+String(hum)
              +String(",")+String(pm25)
              +String(",")+String(pm10)
              +String(",")+String(co2)
              +String(",")+String(voc_index)
              +String(",")+String(-1)
              +String(",")+String(-1);


  createCI("Team-30","Node-2","Data",str);
    
  ///
  delay(delay_time); //thingspeak limit
  
}
