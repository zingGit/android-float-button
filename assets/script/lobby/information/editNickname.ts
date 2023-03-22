import { _decorator, Component, Node, find, EditBox, tween, Vec3, easing } from 'cc';
import { api } from '../../api/api';
import { eventKey } from '../../config/define';
import { globalData } from '../../global/globalData';
import { snEvent } from '../../manager/snEvent';
const { ccclass, property } = _decorator;

@ccclass('EditNickname')
export class EditNickname extends Component {

    private btnExit: Node | null = null
    private nodeMask: Node | null = null
    private btnConfirm: Node | null = null
    private editboxNickname: EditBox | null = null
    private nodeBody: Node | null = null

    start() {

        this.initNode()
        this.initBind()
        this.viewIn()
    }

    private initNode() {

        this.nodeMask = find("mask", this.node)
        this.nodeBody = find("body", this.node)
        this.btnExit = find("body/close", this.node)
        this.btnConfirm = find("body/info_confirm", this.node)
        this.editboxNickname = find("body/EditBox", this.node).getComponent(EditBox)
    }

    private initBind() {
        this.btnConfirm.on("click", this.onConfirm, this)
        this.btnExit.on("click", this.onCloseView, this)
    }

    public viewIn() {
        this.nodeBody?.setScale(Vec3.ZERO);
        tween(this.nodeBody).to(0.3, { scale: Vec3.ONE }, { easing: easing.cubicOut })
        .call( ()=> {
            this.nodeMask.active = true
            this.editboxNickname.string = globalData.user.nickname
        }).start();
    }


    private onConfirm() {

        const nickname = this.editboxNickname.string
        if(globalData.user.nickname == nickname || nickname == "") {
            this.node.destroy()
            return
        }

        const data = {
            nickname: this.editboxNickname.string
        }

        api.changeNickname(data)
        .then(resp => {

            if(resp.code == 1) {

                globalData.user.nickname = resp.data.nickname
                snEvent.emit(eventKey.editUserName)
                this.node.destroy()
            }
        })

    }

    private onCloseView() {
        this.node.destroy()
    }


}

