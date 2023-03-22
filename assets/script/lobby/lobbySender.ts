import { moLog } from "../utils/logger";
import { Net } from "../net/net";
import { Packet } from "../net/packet";
import { default as proto } from "../protocol/protocol.js";
import { api } from "../api/api";

export namespace lobbySender {
    function send(commandId: number, buf?: Uint8Array): void {
        const pkg = new Packet(5000, commandId, buf);
        Net.getInstance().send(pkg);
    }

    /**
     * 请求余额
     */
    // export function requestBalance(): void {
    //     moLog.info(`send requestBalance`);
    //     // send(proto.lobby.LobbyCmd.CMD_GET_BALANCE_REQ);
    // }

    export async function requestBalance() {}
}
