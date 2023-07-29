# Smart CoffeeMachine

# Overview:
The BangleWatch Brew project aims to modernize and enhance the functionality of an old coffee machine by integrating it with smart technology. By combining the power of an ESP32 microcontroller, Arduino IDE, Espruino IDE, and a Bangle.js smartwatch, we have successfully transformed the conventional coffee machine into a cutting-edge, Internet of Things (IoT) enabled brewer.

# Project Components:

ESP32 Circuit Integration: We designed and built a custom circuit using the ESP32 microcontroller board. The ESP32 serves as the brain of the smart coffee machine, acting as an intermediary between the machine's existing circuit and the Bangle.js smartwatch.

Arduino Code for ESP32: In the Arduino IDE, we programmed the ESP32 with the necessary code to facilitate communication between the coffee machine's circuitry and the Bangle.js watch. The code enables the ESP32 to receive commands from the watch and execute them to control the coffee maker's functionalities.

Bangle.js Smartwatch App: Using Espruino IDE and JavaScript, we developed a user-friendly mobile application compatible with the Bangle.js smartwatch. The app establishes a Bluetooth connection with the ESP32, allowing users to remotely control the coffee machine through their wrist-worn device.

# Key Features:

Wireless Control: With the Bangle.js app, users can conveniently control the coffee machine from a distance, eliminating the need to physically interact with the machine. This feature enables users to prepare their favorite brews remotely.

Custom Brew Settings: The app offers the flexibility to customize brewing parameters such as brew time, temperature, and strength. Users can easily adjust these settings to craft their ideal cup of coffee directly from the smartwatch.

Brew Scheduling: BangleWatch Brew supports scheduling coffee brewing sessions in advance. Users can set timers or create automatic brewing routines to ensure their coffee is ready at their preferred time.

Status Monitoring: The app provides real-time feedback on the brewing process, indicating whether the machine is heating, brewing, or in standby mode. Users can stay informed about the coffee maker's status through the watch's display.
