import { config } from "../config/config";
import { Net, NetHandler } from "./net";
import { Packet } from "./packet";
import { default as proto } from "../protocol/protocol.js";
import { Heartbeat } from "./heartbeat";
import { snEvent } from "../manager/snEvent";
import { eventKey } from "../config/define";

export class lobbyServices implements NetHandler {


    constructor() {
        
        Net.getInstance().bind(5000, this);
    }

    handler(pkg: Packet): void {
        //后台不处理消息
        if (config.runtime.isBackground) {
            return;
        }

        let data = null

        switch (pkg.cmdId) {
            case proto.common.CMD.LOGIN_RESP:
                data = proto.common.LoginResponse.decode(pkg.msg);
        }


        snEvent.emit(eventKey.lobbyServicesInfo,  {cmd: pkg.cmdId, data})
    }

}