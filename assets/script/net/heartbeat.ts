import { Net, NetHandler } from "../net/net";
import { Packet } from "../net/packet";
import { default as proto } from "../protocol/protocol.js";

export class Heartbeat implements NetHandler {
    /**
     * 网络连接超时
     */
    public static readonly CONN_TIMEOUT = "CONN_TIMEOUT";

    private static instance: Heartbeat;

    public static getInstance(): Heartbeat {
        if (!Heartbeat.instance) {
            Heartbeat.instance = new Heartbeat();
        }

        return Heartbeat.instance;
    }

    private constructor() {
        Net.getInstance().bind(5000, this);
    }

    private loopNumber: any = 0;
    private callCount: number = 0;

    public start(): void {
        this.stop();

        this.callCount = 0;
        this.loopNumber = setInterval(() => {
            this.callCount++;
            if (this.callCount >= 3) {
                this.stop();
                globalThis.dispatchEvent(new Event(Heartbeat.CONN_TIMEOUT));
                return;
            }

            const pkg = new Packet(5000, proto.common.CMD.PING_REQ);
            Net.getInstance().send(pkg);
        }, 3000);
    }

    public stop(): void {
        if (this.loopNumber !== 0) {
            clearInterval(this.loopNumber);
            this.loopNumber = 0;
        }
        this.callCount = 0;
    }

    handler(pkg: Packet): void {
        if (pkg.pkgType !== 5000) {
            return;
        }

        switch (pkg.cmdId) {
            case proto.common.CMD.PING_RESP:
                this.callCount = 0;
                break;

            default:
                break;
        }
    }
}
