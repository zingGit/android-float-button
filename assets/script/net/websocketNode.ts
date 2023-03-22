import { NetMessageEvent, NetNode } from "./net";

export class WebSocketNode implements NetNode {
    private ws: WebSocket | null = null;
    private dsn: string = "";
    private openEvent: Function | null = null;
    private messageEvent: NetMessageEvent | null = null;
    private closeEvent: Function | null = null;
    private errorEvent: Function | null = null;

    public constructor(dsn: string) {
        this.dsn = dsn;
    }

    setOpenEvent(event: Function): void {
        this.openEvent = event;
    }

    setMessageEvent(event: NetMessageEvent): void {
        this.messageEvent = event;
    }

    setCloseEvent(event: Function): void {
        this.closeEvent = event;
    }

    setErrorEvent(event: Function): void {
        this.errorEvent = event;
    }

    connect(): void {
        this.ws = new WebSocket(this.dsn);
        this.ws.binaryType = "arraybuffer";

        this.ws.onopen = () => this.openEvent?.();
        this.ws.onmessage = (event) => this.messageEvent?.(event.data as ArrayBuffer);
        this.ws.onclose = () => this.closeEvent?.();
        this.ws.onerror = () => this.errorEvent?.();
    }

    send(buf: ArrayBuffer): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.errorEvent?.();
            return;
        }

        this.ws.send(buf);
    }

    // https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent
    close(code?: number): void {
        if (!this.ws) {
            return;
        }

        this.ws.close(code ?? 1000, "initiative close");
        this.closeEvent?.();
    }
}
