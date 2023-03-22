import { _decorator, Component, Node, find, instantiate, Toggle, Sprite } from 'cc';
import { api } from '../../api/api';
import { eventKey } from '../../config/define';
import { globalData } from '../../global/globalData';
import { snEvent } from '../../manager/snEvent';
const { ccclass, property } = _decorator;

@ccclass('EditHead')
export class EditHead extends Component {

    private nodeContent: Node | null = null
    private btnExit: Node | null = null
    private btnConfirm: Node | null = null
    private nodeAvatar: Node | null = null

    start() {

        this.initNode()
        this.initBind()
        this.initAllHead()
    }


    private initNode() {

        this.nodeContent = find("body/ScrollView/view/content", this.node)
        this.btnExit = find("body/close", this.node)
        this.btnConfirm = find("body/info_confirm", this.node)
        this.nodeAvatar = find("body/item_avatar", this.node)
    }

    private initBind() {
        this.btnConfirm.on("click", this.onConfirm, this)
        this.btnExit.on("click", this.onCloseView, this)
    }

    private initAllHead() {

        for (let index = 0; index < 10; index++) {
            const avatar = instantiate(this.nodeAvatar)
            avatar.setParent(this.nodeContent)
            const spriteFrame = globalData.avatarMap.get(`${index}`)
            avatar.getComponent(Sprite).spriteFrame = spriteFrame
        }

        this.setCurrent()
    }

    private setCurrent() {
        const headid = globalData.user.avatarId
        const toggle: Toggle = this.nodeContent.children[headid].getComponent(Toggle)
        toggle.isChecked = true

    }

    private onConfirm() {
        let current = globalData.user.avatarId
        this.nodeContent.children.forEach( (node, index)=> {
            const toggle = node.getComponent(Toggle)
            if(toggle.isChecked) {
                current = index + ""
            }
        })

        if(current == globalData.user.avatarId) {
            this.node.destroy()
            return
        }

        const data = {
            avatarId: current
        }
        api.changeAvatar(data)
        .then(resp => {
            if(resp.code == 1) {
                globalData.user.avatarId = current
                snEvent.emit(eventKey.editUserHead)
                this.node.destroy()
            }
        })

    }

    private onCloseView() {
        this.node.destroy()
    }

}

