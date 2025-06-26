// myArduino.js - Verified Version

class ScratchArduino {
  constructor (runtime) {
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    this.runtime = runtime;
    this.port = null;
  }

  /**
   * @returns {object} metadata for this extension and its blocks.
   */
  getInfo () {
    return {
      id: 'myArduino',
      name: 'My Arduino',
      blocks: [
        {
          opcode: 'connect',
          blockType: 'command',
          text: 'Connect to Arduino'
        },
        {
          opcode: 'ledOn',
          blockType: 'command',
          text: 'Turn LED ON'
        },
        {
          opcode: 'ledOff',
          blockType: 'command',
          text: 'Turn LED OFF'
        }
      ]
    };
  }

  async connect () {
    try {
      if (navigator.serial) {
        this.port = await navigator.serial.requestPort();
        await this.port.open({ baudRate: 9600 });
        console.log('Successfully connected to Arduino!');
      } else {
        console.error('Web Serial API not supported in this browser.');
        alert('This feature requires a browser that supports the Web Serial API, like Google Chrome or Microsoft Edge.');
      }
    } catch (e) {
      console.error('Could not connect to Arduino:', e);
    }
  }

  async sendCommand (command) {
    if (!this.port || !this.port.writable) {
      console.warn('Arduino not connected or port not writable.');
      return;
    }
    const writer = this.port.writable.getWriter();
    const data = new TextEncoder().encode(command);
    await writer.write(data);
    writer.releaseLock();
  }

  ledOn () {
    this.sendCommand('1');
  }

  ledOff () {
    this.sendCommand('0');
  }
}

export default ScratchArduino;