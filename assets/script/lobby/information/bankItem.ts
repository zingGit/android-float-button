import { _decorator, Component, Node, Label, find } from 'cc';
import { api } from '../../api/api';
import { config } from '../../config/config';
import { eventKey } from '../../config/define';
import { globalFunc } from '../../global/globalFunc';
import { snEvent } from '../../manager/snEvent';
const { ccclass, property } = _decorator;

@ccclass('BankItem')
export class BankItem extends Component {


    private labelCardNum: Label | null = null
    private labelCardId: Label | null = null

    private nodeBankcard: Node | null = null
    private nodeAddCard: Node | null = null

    private info: any = null
    onLoad() {

        this.initNode()
    }


    private initNode() {

        this.labelCardId = find("bankcard/label_id", this.node)?.getComponent(Label)
        this.labelCardNum = find("bankcard/label_num", this.node)?.getComponent(Label)
        this.nodeBankcard = find("bankcard", this.node)
        this.nodeAddCard = find("bankadd", this.node)
    }

    public setItemInfo(info: any) {
        this.info = info
        if(info == null) {
            this.initBind()
            this.nodeBankcard.active = false
            this.nodeAddCard.active = true
        }
        else {
            this.labelCardId.string = "Card" + info.id
            this.labelCardNum.string = info.aliasAccount
        }
    }

    private async onBtnAddBankCard(): Promise<void> {

        await globalFunc.loadPrefabFromBundle("addCashWithdraw", "bankCardInfo", config.uiNode.windowNode);
    }

    private initBind() {
        this.node.on("click", ()=> {
            
            console.warn("@@@@add")
            this.onBtnAddBankCard()
        })
    }

}

