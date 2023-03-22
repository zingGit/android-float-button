import { moLog } from "../utils/logger";
import { Packet, packetHelper } from "./packet";
import { WebSocketNode } from "./websocketNode";

export type NetMessageEvent = (buf: ArrayBuffer) => void;

export interface NetNode {
    setOpenEvent(event: Function): void;
    setMessageEvent(event: NetMessageEvent): void;
    setCloseEvent(event: Function): void;
    setErrorEvent(event: Function): void;
    connect(): void;
    send(buf: ArrayBuffer): void;
    close(code?: number): void;
}

export interface NetHandler {
    handler(pkg: Packet): void;
}

enum NetState {
    Invalid = 0,
    Connecting = 1,
    Disconnect = 2,
}

export class Net {
    private static instance: Net;
    public static getInstance(): Net {
        if (!Net.instance) {
            Net.instance = new Net();
        }

        return Net.instance;
    }

    private netNode: NetNode | null = null;
    private handlers: Map<number, NetHandler[]> = new Map();
    private openEvent: Function[] = [];
    private closeEvent: Function[] = [];
    private errorEvent: Function[] = [];
    private state: NetState = NetState.Invalid;
    private domain: string = "";

    private constructor() { }

    public connect(domain: string) {
        if (this.netNode) {
            return;
        }

        this.domain = domain;
        console.log("路由", this.domain);
        this.createNetNode();
    }

    public setDomain(domain: string) {
        this.domain = domain;
    }

    public reconnect(): void {
        this.close();

        this.createNetNode();
    }

    private createNetNode(): void {
        moLog.info(`will connect ${this.domain}`);
        const node = new WebSocketNode(this.domain);
        node.setOpenEvent(() => {
            this.state = NetState.Connecting;
            this.openEvent.forEach((e) => e());
        });
        node.setMessageEvent((buf: ArrayBuffer) => {
            if (buf.byteLength <= 0) {
                return;
            }

            const pkgs = packetHelper.decodeAll(buf);
            if (pkgs.length === 0) {
                return;
            }

            pkgs.forEach((pkg) => {
                if (pkg.cmdId != 10) {
                    // moLog.info(`receive pkg, will handle pkg, type: ${pkg.pkgType}, cmd: ${pkg.cmdId}, length: ${pkg.length}`);
                }
                const handlers = this.handlers.get(pkg.pkgType);
                if (!handlers) {
                    return;
                }

                handlers.forEach((h) => h.handler(pkg));
            });
        });
        node.setCloseEvent(() => {
            this.state = NetState.Disconnect;
            this.closeEvent.forEach((e) => e());
        });
        node.setErrorEvent(() => {
            this.state = NetState.Invalid;
            this.errorEvent.forEach((e) => e());
        });
        node.connect();

        this.netNode = node;
    }

    public send(pkg: Packet): void {
        if (!this.netNode) {
            moLog.info(`netnode is null`);
            return;
        }

        if (this.state !== NetState.Connecting) {
            moLog.info("netstate is not connecting");
            return;
        }

        if (pkg.cmdId != 9) {
            // moLog.info(`will send pkg, type: ${pkg.pkgType}, cmd: ${pkg.cmdId}, length: ${pkg.length}`);
        }
        this.netNode.send(pkg.encode());
    }

    public bind(pkgType: number, handler: NetHandler): void {
        const handlers = this.handlers.get(pkgType);
        if (!handlers) {
            this.handlers.set(pkgType, [handler]);
            return;
        }

        // 已存在
        if (handlers.indexOf(handler) !== -1) {
            return;
        }

        handlers.push(handler);
    }

    public unbind(pkgType: number, handler: NetHandler): void {
        const handlers = this.handlers.get(pkgType);
        if (!handlers) {
            return;
        }

        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    public addOpenEvent(event: Function) {
        if (this.openEvent.indexOf(event) !== -1) {
            return;
        }

        this.openEvent.push(event);
    }

    public removeOpenEvent(event: Function) {
        const index = this.openEvent.indexOf(event);
        if (index === -1) {
            return;
        }

        this.openEvent.splice(index, 1);
    }

    public addCloseEvent(event: Function): void {
        if (this.closeEvent.indexOf(event) !== -1) {
            return;
        }

        this.closeEvent.push(event);
    }

    public removeCloseEvent(event: Function): void {
        const index = this.closeEvent.indexOf(event);
        if (index === -1) {
            return;
        }

        this.closeEvent.splice(index, 1);
    }

    public addErrorEvent(event: Function): void {
        if (this.errorEvent.indexOf(event) !== -1) {
            return;
        }

        this.errorEvent.push(event);
    }

    public removeErrorEvent(event: Function): void {
        const index = this.errorEvent.indexOf(event);
        if (index === -1) {
            return;
        }

        this.errorEvent.splice(index, 1);
    }

    public close() {
        this.netNode?.close();
        this.netNode = null;
        this.state = NetState.Invalid;
    }
}
