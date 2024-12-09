let bluetoothDevice;
let uartService;
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // Correct TX characteristic

// Function to connect to micro:bit
async function connectToMicrobit() {
    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: "BBC" }], // Filter for devices with names starting with "BBC"
            optionalServices: [UART_SERVICE_UUID],
        });

        const server = await bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService(UART_SERVICE_UUID);
        uartService = await service.getCharacteristic(UART_TX_UUID);

        console.log("Connected to micro:bit!");
        alert("Connected to Yorick!");
    } catch (error) {
        console.error("Failed to connect to micro:bit:", error);
        alert("Failed to connect to Yorick. Please try again.");
    }
}

// Function to send a command to the micro:bit
async function sendCommand(actionNumber) {
    if (!uartService) {
        console.error("Not connected to micro:bit");
        alert("Please connect to Yorick first!");
        return;
    }

    try {
        // Convert action number to hex and pad to two characters
        const hexAction = actionNumber.toString(16).toUpperCase().padStart(2, "0");
        const command = `CMD|0F|${hexAction}|$`;
        const encoder = new TextEncoder();
        await uartService.writeValue(encoder.encode(command));
        console.log(`Command sent: ${command}`);
    } catch (error) {
        console.error("Failed to send command:", error);
        alert("Failed to send command to Yorick.");
    }
}

// Function to run a scene
function runScene(audioId, actionNumber) {
    const audioElement = document.getElementById(`audio-${audioId}`);
    if (!audioElement) {
        console.error("Audio element not found");
        return;
    }

    // Play audio
    audioElement.play().then(() => {
        console.log("Playing audio...");
        // After the audio starts, trigger the action
        sendCommand(actionNumber);
    }).catch(error => {
        console.error("Error playing audio:", error);
        alert("Error playing audio. Please try again.");
    });
}

// Attach event listener for the "Connect" button
document.getElementById("connect-button").addEventListener("click", connectToMicrobit);
