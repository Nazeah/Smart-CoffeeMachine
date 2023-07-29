/*
  #define steamLED    12   //B6
  #define oneCupLED   39   //B2  //VN
  #define twoCupsLED  32   //B2  //VN
  #define waterLED    34   //B11
  #define trashLED    35   //B12
  #define alarmLED    16   //B13
  #define rinsingLED  33   //B15
  #define ecoLED      4    //B17


  #define turnOnBTN   27  //B1------
  #define oneCupBTN   14  //B3------
  #define twoCupsBTN  13  //B5-------
  #define steamBTN    21  //B7------
  #define rinsingBTN  19  //B14
  #define ecoBTN      18  //B16-----
  */

var characteristicUuid = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
var serviceUuid = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";

let device;
let outputStatus = false;
let receivedMessages = [];
var pinStateObject = {};
let cursorPosition = 0;
var wait = false;
var locked = 0;
var HOME = 0;

var objectData = {
  steamLED: "OFF",
  oneCupLED: "OFF",
  twoCupsLED: "OFF",
  waterLED: "OFF",
  trashLED: "OFF",
  alarmLED: "OFF",
  rinsingLED: "OFF",
  ecoLED: "OFF",
};

var states = {
  steamState: "OFF",
};

function dataViewToString(dataView) {
  let str = "";
  for (let i = 0; i < dataView.byteLength; i++) {
    str += String.fromCharCode(dataView.getUint8(i));
  }
  return str;
}

function screenWriting(information) {
  g.clear();
  g.setFont("Vector", 15);
  g.setColor(0xffffff);
  g.drawString(`Device: Connected`, 60, 20);
  g.setFont("Vector", 20);

  const arrowSizeUP = 5;
  const centerXUP = g.getWidth() - 10;
  const centerYUP = g.getHeight() - 7;

  g.drawLine(
    centerXUP - arrowSizeUP / 2,
    centerYUP - arrowSizeUP,
    centerXUP + arrowSizeUP / 2,
    centerYUP - arrowSizeUP
  );
  g.drawLine(
    centerXUP + arrowSizeUP / 2,
    centerYUP - arrowSizeUP,
    centerXUP,
    centerYUP
  );
  g.drawLine(
    centerXUP,
    centerYUP,
    centerXUP - arrowSizeUP / 2,
    centerYUP - arrowSizeUP
  );

  const arrowSizeDown = 5;
  const centerXDown = g.getWidth() - 10;
  const centerYDown = g.getHeight() / 5;

  g.drawLine(
    centerXDown - arrowSizeDown / 2,
    centerYDown + arrowSizeDown,
    centerXDown + arrowSizeDown / 2,
    centerYDown + arrowSizeDown
  );
  g.drawLine(
    centerXDown + arrowSizeDown / 2,
    centerYDown + arrowSizeDown,
    centerXDown,
    centerYDown
  );
  g.drawLine(
    centerXDown,
    centerYDown,
    centerXDown - arrowSizeDown / 2,
    centerYDown + arrowSizeDown
  );

  const arrowSizeLeft = 5;
  const centerXLeft = g.getWidth() - 1;
  const centerYLeft = g.getHeight() / 2 + 15;

  g.drawLine(
    centerXLeft - arrowSizeLeft,
    centerYLeft - arrowSizeLeft / 2,
    centerXLeft - arrowSizeLeft,
    centerYLeft + arrowSizeLeft / 2
  );
  g.drawLine(
    centerXLeft - arrowSizeLeft,
    centerYLeft + arrowSizeLeft / 2,
    centerXLeft,
    centerYLeft
  );
  g.drawLine(
    centerXLeft,
    centerYLeft,
    centerXLeft - arrowSizeLeft,
    centerYLeft - arrowSizeLeft / 2
  );

  if (information.waterLED == "ON") {
    g.setFont("Vector", 20);
    g.setColor(0xffffff);
    g.drawString(`Check the Water Tank`, 10, 100);
  } else if (information.trashLED == "ON") {
    g.setFont("Vector", 20);
    g.setColor(0xffffff);
    g.drawString(`Check the Trash Tank`, 10, 100);
  } else if (information.trashLED == "ON") {
    g.setFont("Vector", 20);
    g.setColor(0xffffff);
    g.drawString(`Alarm is ON`, 10, 100);
  } else {
    // Calculate cursor position and draw cursor rectangle
    const cursorY = 55 + cursorPosition * 25; // Adjust Y-coordinate of the cursor
    const cursorWidth = g.getWidth() - 20; // Width of the cursor (same as screen width)
    const cursorHeight = 25; // Height of the cursor
    g.setColor(0x89f0aa); // Green color for cursor background
    g.fillRect(0, cursorY, cursorWidth, cursorY + cursorHeight);

    g.setColor(0xffffff); // White color
    g.drawString(
      `One Cup: ${information.oneCupLED == "ON" ? "Ready" : "Wait..."}`,
      5,
      60
    );
    g.drawString(
      `Two Cups: ${information.twoCupsLED == "ON" ? "Ready" : "Wait..."}`,
      5,
      85
    );
    g.drawString(`Steam Function: ${states.steamState}`, 5, 110);
    g.drawString(
      `Energy Saving: ${information.ecoLED == "ON" ? "ON" : "OFF"}`,
      5,
      135
    );
    g.drawString(`Rinse the Machine`, 5, 160);
    g.setColor(0xffe0); // White color
    g.drawString(`TURN OFF`, 50, 210);
  }

  g.flip();
}

function btn1Press() {
  if (locked == 1) {
    if (cursorPosition === 0) {
      cursorPosition = 6;
    } else if (cursorPosition === 6) {
      cursorPosition = 4;
    } else {
      cursorPosition =
        (cursorPosition - 1 + Object.keys(objectData).length) %
        Object.keys(objectData).length;
    }
    screenWriting(objectData);
  }
}

function btn3Press() {
  if (locked == 1) {
    if (cursorPosition === 6) {
      cursorPosition = 0;
    } else if (cursorPosition === 4) {
      cursorPosition = 6;
    } else {
      cursorPosition = (cursorPosition + 1) % Object.keys(objectData).length;
    }
    screenWriting(objectData);
  } else if (locked == 0) {
    setTimeout(function () {
      device.disconnect();
      console.log("Disconnected");
      Bangle.showLauncher();
    }, 2000);
  }
}

function btn2Press() {
  if (locked == 1) {
    if (cursorPosition === 0) {
      if (objectData.oneCupLED == "ON") {
        sendData(14);
        wait = true;
        g.clear();
        g.setFont("Vector", 20);
        g.setColor(0xffffff); // White color
        g.drawString("Preparing your Coffee", 10, 100); // Adjust Y-coordinate for static data 1
      } else if (objectData.oneCupLED == "OFF") {
        g.clear();
        g.setFont("Vector", 20);
        g.setColor(0xffffff); // White color
        g.drawString("Wait to get Ready", 10, 100); // Adjust Y-coordinate for static data 1
        setTimeout(function () {
          screenWriting(objectData);
        }, 2000);
      }
    }

    if (cursorPosition === 1) {
      if (objectData.twoCupsLED == "ON") {
        sendData(13);
        wait = true;
        g.clear();
        g.setFont("Vector", 20);
        g.setColor(0xffffff); // White color
        g.drawString("Preparing your Coffee", 10, 100); // Adjust Y-coordinate for static data 1
      } else if (objectData.twoCupsLED == "OFF") {
        g.clear();
        g.setFont("Vector", 20);
        g.setColor(0xffffff); // White color
        g.drawString("Wait to get Ready", 10, 100); // Adjust Y-coordinate for static data 1
        setTimeout(function () {
          screenWriting(objectData);
        }, 2000);
      }
    }

    if (cursorPosition === 2) {
      if (states.steamState == "OFF") {
        sendData(21);
        states.steamState = "Wait...";
        screenWriting(objectData);
      } else if (states.steamState == "Ready" && objectData.steamLED == "ON") {
        sendData(21);
        g.clear();
        g.setFont("Vector", 20);
        g.setColor(0xffffff); // White color
        g.drawString("Adding Steam", 10, 100); // Adjust Y-coordinate for static data
      }
    }

    if (cursorPosition === 3) {
      sendData(18);
    }

    if (cursorPosition === 4) {
      locked = 2;
      sendData(19);
      g.clear();
      g.setFont("Vector", 20);
      g.setColor(0xffffff); // White color
      g.drawString("Rinsing in process", 10, 100); // Adjust Y-coordinate for static data
    }

    if (cursorPosition === 6) {
      sendData(27);
      setTimeout(function () {
        locked = 0;
        HOME = 0;
        home();
      }, 1500);
    }
  }
}

setWatch(btn1Press, BTN1, { repeat: true, edge: "rising", debounce: 50 });
setWatch(btn2Press, BTN2, { repeat: true, edge: "rising", debounce: 50 });
setWatch(btn3Press, BTN3, { repeat: true, edge: "rising", debounce: 50 });

function sendData(pin) {
  let number = pin;
  let info = number.toString();
  device
    .getPrimaryService(serviceUuid)
    .then((service) => {
      return service.getCharacteristic(characteristicUuid);
    })
    .then((characteristic) => {
      return characteristic.writeValue(info);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

function onCharacteristicValueChanged(event) {
  locked = 1;
  var value = event.target.value;
  let message = dataViewToString(value);
  receivedMessages.push(message);

  if (receivedMessages.length == 8) {
    receivedMessages.forEach(function (line) {
      var parts = line.split(",");
      var pin = parts[0];
      var state = parts[1];

      pinStateObject[pin] = state;
    });

    objectData = pinStateObject;
    console.log(objectData);

    if (objectData.steamLED == "ON") {
      states.steamState = "Ready";
    }
    if (objectData.steamLED == "OFF") {
      states.steamState = "OFF";
    }
    if (!wait) {
      screenWriting(objectData);
    }
    wait = false;
    receivedMessages.splice(0);
  }
}

function onConnected(gatt) {
  setTimeout(home, 1500);
  setInterval(function () {
    if (!device.connected) {
      g.clear();
      g.setColor(0xffffff); // White color
      g.drawString("Device disconnected", 30, 100); // Adjust Y-coordinate for static data
      g.drawString("please try again.", 40, 120); // Adjust Y-coordinate for static data
      locked = 3;
    }
  }, 1500);

  device = gatt;
  console.log("Connected to server");
  device
    .getPrimaryService(serviceUuid)
    .then(function (service) {
      return service.getCharacteristic(characteristicUuid);
    })
    .then(function (characteristic) {
      characteristic.on(
        "characteristicvaluechanged",
        onCharacteristicValueChanged
      );
      characteristic.startNotifications(function (result) {
        if (result) {
          console.log("Notifications started");
        } else {
          console.log("Failed to start notifications");
        }
      });
    })
    .catch(function (error) {
      console.log("Error1:", error);
      g.clear();
      g.setColor(0xffffff); // White color
      g.drawString("Unable to Connect", 50, 100); // Adjust Y-coordinate for static data
      g.drawString("please try again.", 50, 120); // Adjust Y-coordinate for static data
    });
}

function connectToDevice() {
  NRF.connect("cc:db:a7:49:9c:ca") // Replace with the MAC address of your server device
    .then(onConnected)
    .catch(function (error) {
      console.log("Error2:", error);
    });
}

function start() {
  g.clear();
  g.setFont("Vector", 20);
  g.setColor(0xffffff); // White color
  g.drawString("Wait to connect to", 40, 100); // Adjust Y-coordinate for static data
  g.drawString("the Machine", 65, 120); // Adjust Y-coordinate for static data
  setTimeout(connectToDevice, 2000);
}

function home() {
  g.clear();
  g.setFont("Vector", 15);
  g.setColor(0xffffff); // White color
  g.drawString(`Back`, g.getWidth() - 50, g.getHeight() - 20); // Adjust Y-coordinate for static data
  g.drawString(`Device: Connected`, 60, 20); // Adjust Y-coordinate for static data
  g.setColor(0x89f0aa);
  g.fillRect(40, 150, 200, 90);
  g.setFont("Vector", 20);
  g.setColor(0xffffff); // White color
  g.drawString("Press to start", 50, 100); // Adjust Y-coordinate for static data
  g.drawString("the Machine", 65, 120); // Adjust Y-coordinate for static data
}

setWatch(
  function () {
    if (locked == 0 && device.connected && HOME == 0) {
      setTimeout(function () {
        sendData(27);
        cursorPosition = 0;
        screenWriting(objectData);
        setTimeout(function () {
          locked = 1;
          HOME = 1;
        }, 1000);
      }, 1500);
    } else if (locked == 0 && !device.connected) {
      Bangle.showLauncher();
    } else if (locked == 3) {
      Bangle.showLauncher();
    }
  },
  BTN2,
  { repeat: true, edge: "rising", debounce: 50 }
);

start();
