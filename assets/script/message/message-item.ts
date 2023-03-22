import { _decorator, Component, Node, Label, find } from 'cc';
import { api } from '../api/api';
import { time } from '../utils/time';
import { IMessageInfo } from './message-box';
import { msgContent } from './message-content';
const { ccclass, property } = _decorator;

@ccclass('MessageItem')
export class MessageItem extends Component {

    private labelTitle: Label | null = null
    private nodeUnread: Node | null = null
    private labelExpTime: Label | null = null

    private msgId: number = 0
    private itemInfo: IMessageInfo = null

    onLoad() {
        this.initNode()
        this.initBind()
    }

    private initNode() {
        this.labelTitle = find("title", this.node)?.getComponent(Label)
        this.nodeUnread = find("unread/icon_new", this.node)
        this.labelExpTime = find("label_exp_time", this.node)?.getComponent(Label)
    }

    private initBind() {

        this.node.on("click", this.onClick, this)


    }

    private onClick() {
        console.warn(`点击邮件:${this.msgId}`)
        const data = {
            msgId: this.msgId
        }
        api.readEmail( data )
        .then( resp => {

            if(resp.code == 1) {
                console.warn("读取邮件成功")
                this.nodeUnread.active = false
            }
        })

        msgContent.show(this.itemInfo)
    }

    public setItemInfo(info) {

        this.labelTitle.string = info.title
        this.msgId = info.msgId

        this.itemInfo = info
        const endtime = info.endTime
        this.labelExpTime.string = "Expires in " + time.toLocalDateString(endtime)

        if(info.status == 1) {
            this.nodeUnread.active = true
        }

    }
}

