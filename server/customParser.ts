import { Emitter } from "@socket.io/component-emitter";
import { decode, encode } from "cbor-x";
import { PacketType } from "socket.io-parser";
const protocol = 5;

class Encoder {
  /**
   * Encode a packet into a list of strings/buffers
   */
  encode(packet) {
    return [encode(packet)];
  }
}

class Decoder extends Emitter {
  /**
   * Receive a chunk (string or buffer) and optionally emit a "decoded" event with the reconstructed packet
   */
  add(chunk) {
    if (!ArrayBuffer.isView(chunk)) chunk = new Uint8Array(chunk);
    const packet = decode(chunk);
    if (this.isPacketValid(packet)) {
      this.emit("decoded", packet);
    } else {
      throw new Error("invalid format");
    }
  }
  isPacketValid({ type, data, nsp, id }) {
    const isNamespaceValid = typeof nsp === "string";
    const isAckIdValid = id === undefined || Number.isInteger(id);
    if (!isNamespaceValid || !isAckIdValid) {
      return false;
    }
    switch (type) {
      case PacketType.CONNECT: // CONNECT
        return data === undefined || typeof data === "object";
      case PacketType.DISCONNECT: // DISCONNECT
        return data === undefined;
      case PacketType.EVENT: // EVENT
      case PacketType.BINARY_EVENT: // BINARY_EVENT
        return Array.isArray(data) && data.length > 0;
      case PacketType.ACK: // ACK
      case PacketType.BINARY_ACK: // BINARY_ASK
        return Array.isArray(data);
      case PacketType.CONNECT_ERROR: // CONNECT_ERROR
        return typeof data === "object";
      default:
        return false;
    }
  }
  /**
   * Clean up internal buffers
   */
  destroy() {}
}

// export const customParser = { Encoder, Decoder, ...PacketType, protocol }
export const customParser = { Encoder, Decoder };
// export const myParser = { Encoder, Decoder };
