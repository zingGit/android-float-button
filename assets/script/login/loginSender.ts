import { moLog } from "../utils/logger";
import { Net } from "../net/net";
import { Packet } from "../net/packet";
import { default as proto } from "../protocol/protocol.js";

export namespace loginSender {
    function send(commandId: number, buf: Uint8Array): void {
        const pkg = new Packet(5000, commandId, buf);
        Net.getInstance().send(pkg);
    }

    export function login(userId: number, token: string): void {
        const payload: proto.common.ILoginRequest = {
            userId: userId,
            token: token,
        };

        const req = proto.common.LoginRequest.create(payload);
        const encReq = proto.common.LoginRequest.encode(req).finish();
        moLog.info(`send login payload: ${JSON.stringify(req.toJSON())}`);
        send(proto.common.CMD.LOGIN_REQ, encReq);
    }
}
