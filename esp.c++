#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define esp_led 2

#define steamLED    12   //B6
#define oneCupLED   39   //B2  //VN
#define twoCupsLED  32   //B2  //VN
#define waterLED    34   //B11
#define trashLED    35   //B12
#define alarmLED    16   //B13
//#define rinsingLED  33   //B15
#define ecoLED      4    //B17

#define turnOnBTN   27  //B1
#define oneCupBTN   14  //B3
#define twoCupsBTN  13  //B5
#define steamBTN    21  //B7
#define rinsingBTN  19  //B14
#define ecoBTN      18  //B16

int ledPins[] = {steamLED, oneCupLED, twoCupsLED, waterLED, trashLED, alarmLED, ecoLED};
int numPins = sizeof(ledPins) / sizeof(ledPins[0]);
String states[] = {"OFF", "OFF", "OFF", "OFF", "OFF", "OFF", "OFF"};
int count[7];
int previousStates[7];

int btnPins[] = {turnOnBTN, oneCupBTN, twoCupsBTN, steamBTN, rinsingBTN, ecoBTN};

bool currentState;
bool current_state;

int updated = 0;
int reading;

unsigned long detectionTime = 0;
unsigned long detectionInterval = 4000;

bool deviceConnected = false;

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b" // Replace with your service UUID
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8" // Replace with your characteristic UUID

// This function is responsible for giving a signal to the pin that has been sent by the bangle
void changeState(std::string value) {
  int pin = std::stoi(value); // Convert the received value to an integer
  Serial.print("Received pin: ");
  Serial.println(pin);
  digitalWrite(pin, HIGH); // Set the specified pin to high
  delay(100);
  digitalWrite(pin, LOW); // Set the specified pin to high
}

// This function is called once the esp32 is connected to the bangle
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    sendToBangle();
    Serial.println("Client connected");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Client disconnected");
    ESP.restart(); // Reset the ESP32
  }
};

// This function is for detecting if there is any data sent by the bangle
class MyCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string value = pCharacteristic->getValue();

    if (value.length() > 0) {
      changeState(value);
    }
  }
};

BLEServer *pServer;
BLECharacteristic *pCharacteristic;

void setup() {
  Serial.begin(115200);

  // Preparation of the pins type and initial states
  for (int i = 0; i < numPins; i++) {
    pinMode(ledPins[i], INPUT);
    previousStates[i] = LOW;
  }
  for (int i = 0; i < 6; i++) {
    pinMode(btnPins[i], OUTPUT);
    digitalWrite(btnPins[i], LOW);
  }

  // Setting up the connection properties
  BLEDevice::init("ESP32 Server");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE |
    BLECharacteristic::PROPERTY_NOTIFY |
    BLECharacteristic::PROPERTY_INDICATE
  );

  pCharacteristic->addDescriptor(new BLE2902());
  pCharacteristic->setCallbacks(new MyCallbacks());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x0);  // Set value to 0x00 to not advertise this parameter
  BLEDevice::startAdvertising();
  Serial.println("Waiting for a client connection...");
}

// Loop function is constantly looping
void loop() {
  if (deviceConnected) { // The whole code will start working when the esp32 is connected to the bangle
    unsigned long currentTime = millis();

    // It will constantly check if there is a change in the state of the LEDs
    for (int j = 0; j < numPins; j++) {
      reading = analogRead(ledPins[j]);
      float voltage = reading * (3.3 / 4095.0);  // Convert ADC reading to voltage (3.3V reference and 12-bit ADC resolution)

      if (voltage >= 1) {
        current_state = HIGH;
      } else if (voltage < 1) {
        current_state = LOW;
      }

      if (current_state != previousStates[j]) { // Pin state has changed, so call the detection function
        updated = detection(j);
        detectionTime = currentTime;
      }
      previousStates[j] = current_state;
      delay(750);
    }

    // When the LED states are stable now, send the new LED states to the bangle
    if (currentTime - detectionTime >= detectionInterval && updated) {
      sendToBangle();  // Sending data function is called
      updated = 0;
    }
  }
}

int detection(int j) { // This function is to detect if the LED is on or off or still blinking
  int x = 0;
  if (x == 0) {
    float voltage1;
    int reading1;
    for (int c = 1; c <= 4; c++) {
      for (int i = 0; i < numPins; i++) {
        reading1 = analogRead(ledPins[i]);
        voltage1 = reading1 * (3.3 / 4095.0);  // Convert ADC reading to voltage (3.3V reference and 12-bit ADC resolution)

        if (voltage1 >= 1) {
          currentState = HIGH;
        } else if (voltage1 < 1) {
          currentState = LOW;
        }
        Serial.print(ledPins[i]);
        Serial.print(".....");
       Serial.print(currentState);
        Serial.print(".....");
        Serial.print(ledPins[j]);
        Serial.print(".....");
        Serial.println(voltage1);

        if (currentState == previousStates[i]) { // Pin state has not changed
          count[i]++;
        }
        previousStates[i] = currentState;
      }
      delay(750);
    }

    for (int i = 0; i < numPins; i++) {
      if (count[i] >= 3 && (voltage1 >= 1)) {
        states[i] = "ON";
      } else if (count[i] >= 2 && (voltage1 < 1)) {
        states[i] = "OFF";
      } else if (count[i] < 2) {
        states[i] = "Blinking";
      }
    }

    for (int i = 0; i < numPins; i++) {
      count[i] = 0;
    }
    x++;
  }
  return 1;
}

void sendToBangle() {
  for (int i = 0; i < numPins; i++) {
    String message;
    switch (ledPins[i]) {
      case 12:
        message = "steamLED," + states[i];
        break;

      case 39:
        message = "oneCupLED," + states[i];
        break;

      case 32:
        message = "twoCupsLED," + states[i];
        break;

      case 34:
        message = "waterLED," + states[i];
        break;

      case 35:
        message = "trashLED," + states[i];
        break;

      case 16:
        message = "alarmLED," + states[i];
        break;

      
      case 4:
        message = "ecoLED," + states[i];
        break;
    }

    pCharacteristic->setValue(message.c_str());  // Send the states of all the LEDs
    pCharacteristic->notify();
  }
  delay(300);
}