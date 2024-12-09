let bluetoothDevice;
let uartCharacteristic;

const CMD_ACTION_9 = "CMD|0F|09|$"; // Command for action 9

// Button references
const connectButton = document.getElementById("connect");
const action9Button = document.getElementById("action9");

// Function to connect to the micro:bit
async function connectToMicrobit() {
    try {
        // Request the Bluetooth device
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"], // UART service UUID
        });

        // Connect to the GATT server
        const server = await bluetoothDevice.gatt.connect();

        // Get the UART service
        const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");

        // Get the TX characteristic (WriteWithoutResponse)
		const TX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

        uartCharacteristic = await service.getCharacteristic(TX);

        // Verify that the characteristic supports writeWithoutResponse
        if (!uartCharacteristic.properties.writeWithoutResponse) {
            throw new Error("TX characteristic does not support writeWithoutResponse.");
        }

        // Enable the action button
        action9Button.disabled = false;

        console.log("Connected to micro:bit!");
    } catch (error) {
        console.error("Failed to connect to micro:bit:", error);
    }
}

// Function to send a command
async function sendCommand(command) {
    if (!uartCharacteristic) {
        console.error("Not connected to a micro:bit");
        return;
    }

    const encoder = new TextEncoder();
    const commandBuffer = encoder.encode(command);

    try {
        // Send the command using writeWithoutResponse
        await uartCharacteristic.writeValueWithoutResponse(commandBuffer);
        console.log("Command sent:", command);
    } catch (error) {
        console.error("Failed to send command:", error);
    }
}

// Event listeners for buttons
connectButton.addEventListener("click", connectToMicrobit);
action9Button.addEventListener("click", () => sendCommand(CMD_ACTION_9));
