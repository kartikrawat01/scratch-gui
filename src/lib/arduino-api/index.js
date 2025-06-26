// scratch-gui/src/lib/arduino-api/index.js

/**
 * A singleton service to manage the Web Serial connection to an Arduino running Firmata.
 * The entire application will share this single instance.
 */
class ArduinoAPI {
    constructor() {
        this.port = null;
        this.writer = null;
        this.reader = null;
        this.onDisconnect = null; // A callback function for when disconnection occurs.
    }

    isConnected() {
        return !!this.port;
    }

    async connect() {
        if (this.isConnected()) return;

        try {
            if (!navigator.serial) {
                alert('Web Serial API is not supported by your browser. Please use Google Chrome or Microsoft Edge.');
                throw new Error('Web Serial not supported');
            }
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 57600 }); // Standard Firmata baud rate

            this.writer = this.port.writable.getWriter();
            this.reader = this.port.readable.getReader();

            // The read loop starts listening for data but does not block the UI.
            this._startReadLoop();
        } catch (e) {
            // If the user cancels the port selection, it's not a critical error.
            if (e.name === 'NotFoundError') {
                console.log('Port selection cancelled by user.');
            } else {
                console.error('Connection failed:', e);
            }
            // Ensure we are clean on failure.
            await this.disconnect();
            throw e; // Re-throw the error so the UI can catch it.
        }
    }

    async disconnect() {
        if (this.reader) {
            try {
                await this.reader.cancel(); // This will break the read loop.
            } catch (e) { /* Ignore error */ }
        }
        if (this.writer) {
            try {
                await this.writer.close();
            } catch (e) { /* Ignore error */ }
        }
        if (this.port) {
            try {
                await this.port.close();
            } catch (e) { /* Ignore error */ }
        }
        this._resetState();
    }

    async _startReadLoop() {
        try {
            while (true) {
                const { value, done } = await this.reader.read();
                if (done) break; // The reader was cancelled.
                // In the future, this is where you will parse incoming sensor data.
                console.log(value); // For now, just log incoming data.
            }
        } catch (error) {
            console.log('Read loop error. Device likely unplugged.', error);
        } finally {
            // If the loop ever breaks (e.g., device unplugged), trigger a disconnect.
            if (this.onDisconnect) this.onDisconnect();
        }
    }
    
    _resetState() {
        this.port = null;
        this.writer = null;
        this.reader = null;
    }

    async sendCommand(commandArray) {
        if (!this.isConnected()) return;
        const data = new Uint8Array(commandArray);
        await this.writer.write(data);
    }
}

const arduinoAPI = new ArduinoAPI();
export default arduinoAPI;