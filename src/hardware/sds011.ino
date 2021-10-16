#include <Arduino.h>
#include <SdsDustSensor.h>

/* SDS011 Dust Sensor */
const int SDS_RX_PIN = D5; // D3 -> SDS011 TX pin
const int SDS_TX_PIN = D6; // D4 -> SDS011 TX pin
SoftwareSerial softwareSerial(SDS_RX_PIN, SDS_TX_PIN);
SdsDustSensor sds(softwareSerial); //  additional parameters: retryDelayMs and maxRetriesNotAvailable
const int MINUTE = 60000;
const int WAKEUP_WORKING_TIME = 30000; // 30 seconds.
const int MEASUREMENT_INTERVAL = 5 * MINUTE;

void setup() {
Serial.begin(115200);
Serial.println("SDS011 dust sensor");
delay(500);
/* SDS011 Dust Sensor */
sds.begin();
// Prints SDS011 firmware version:
Serial.print("SDS011 ");
Serial.println(sds.queryFirmwareVersion().toString());
// Ensures SDS011 is in 'query' reporting mode:
Serial.println(sds.setQueryReportingMode().toString());
}

void loop() {
// Wake up SDS011
sds.wakeup();
delay(WAKEUP_WORKING_TIME);
// Get data from SDS011
PmResult pm = sds.queryPm();
if (pm.isOk()) {
Serial.print("PM2.5 = ");
Serial.print(pm.pm25); // float, μg/m3
Serial.print(", PM10 = ");
Serial.println(pm.pm10);
} else {
Serial.print("Could not read values from sensor, reason: ");
Serial.println(pm.statusToString());
}
// Put SDS011 back to sleep
WorkingStateResult state = sds.sleep();
if (state.isWorking()) {
Serial.println("Problem with sleeping the SDS011 sensor.");
} else {
Serial.println("SDS011 sensor is sleeping");
delay(MEASUREMENT_INTERVAL);
}
}




// SDS011 dust sensor example
// -----------------------------
//
// By R. Zschiegner (rz@madavi.de).
// April 2016

#include <SDS011.h>

float p10,p25;
int error;

SDS011 my_sds;

void setup() {
	my_sds.begin(2,14);//tx,rx)
	Serial.begin(9600);
}

void loop() {
	error = my_sds.read(&p25,&p10);
	if (! error) {
		Serial.println("P2.5: "+String(p25));
		Serial.println("P10:  "+String(p10));
	}
	delay(100);
}