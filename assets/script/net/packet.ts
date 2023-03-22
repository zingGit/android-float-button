// ------------------------ socket 包头 -------------------------
//  |--------|--------|--------|--------|
//   magicId   length    type     cmd
//   2 bytes  2 bytes  2 bytes  2 bytes
// ---------------------------------------------------------------
// magicId: 魔法ID
// length: 包长度
// type: 消息类型
// cmd: 协议命令

const headerLength = 8;
const magicNumber = 4680;

export namespace packetHelper {
    export function decode(pkg: ArrayBuffer): Packet | null {
        const view = new DataView(pkg);
        const magicId = view.getUint16(0, true);
        if (magicId !== magicNumber) {
            return null;
        }
        const length = view.getUint16(2, true);
        if (length != pkg.byteLength) {
            return null;
        }
        const pkgType = view.getUint16(4, true);
        const cmdId = view.getUint16(6, true);
        const msg = length > headerLength ? new Uint8Array(pkg.slice(headerLength)) : new Uint8Array();
        return new Packet(pkgType, cmdId, msg);
    }

    export function decodeAll(buf: ArrayBuffer): Packet[] {
        let offset = 0;
        let pkgs = [];
        const view = new DataView(buf);
        while (true) {
            if (buf.byteLength - offset < headerLength) {
                break;
            }
            const magicId = view.getUint16(offset + 0, true);
            if (magicId !== magicNumber) {
                break;
            }
            const length = view.getUint16(offset + 2, true);
            const pkgType = view.getUint16(offset + 4, true);
            const cmd = view.getUint16(offset + 6, true);
            const msg = length > headerLength ? new Uint8Array(buf.slice(offset + headerLength, offset + length)) : new Uint8Array();
            pkgs.push(new Packet(pkgType, cmd, msg));
            offset += length;
            if (offset >= buf.byteLength) {
                break;
            }
        }
        return pkgs;
    }
}

export class Packet {
    public readonly length: number;
    public readonly pkgType: number;
    public readonly cmdId: number;
    public readonly msg: Uint8Array;

    public constructor(type: number, cmdId: number, msg?: Uint8Array) {
        this.length = headerLength + (msg ? msg.length : 0);
        this.pkgType = type;
        this.cmdId = cmdId;
        this.msg = msg ?? new Uint8Array();
    }

    public encode(): ArrayBuffer {
        const length = headerLength + (this.msg ? this.msg?.length : 0);
        const buf = new ArrayBuffer(length);
        const view = new DataView(buf);
        view.setUint16(0, magicNumber, true);
        view.setUint16(2, length, true);
        view.setUint16(4, this.pkgType, true);
        view.setUint16(6, this.cmdId, true);

        if (length > headerLength) {
            this.msg?.forEach((value, index) => view.setUint8(headerLength + index, value));
        }

        return buf;
    }
}
