import { _decorator, Component, find, instantiate, Label, Node, Prefab, Vec3 } from "cc";
import { snRes } from "../manager/snRes";
import { config } from "../config/config";
import { api } from "../api/api";
import { globalData } from "../global/globalData";
import { creator } from "../utils/creator";
import { PersonalinfoView } from "./personal-view";
import { WalletView } from "./wallet-view";
import { CashTurnoverView } from "./cash-turnover-view";
import { GameRecordView } from "./game-record-view";
const { ccclass, property } = _decorator;

@ccclass("PlayerInfoView")
export class PlayerInfoView extends Component {
    private leftBtns: Node | undefined;
    private leftBtnNode: Node[] = [];
    private btnIndex: number = 0;
    private bodyNode: Node | undefined;
    //个人信息
    private prsonaInfoNode: Node | undefined;
    private PersonalView: PersonalinfoView | undefined;

    //个人钱包
    private wallet: Node | undefined;
    private walletView: WalletView | undefined;

    //现金流水
    private cashTurnover: Node | undefined;
    private cashView: CashTurnoverView | undefined;

    //游戏记录
    private gameRecord: Node | undefined;
    private gameRecordView: GameRecordView | undefined;

    onLoad() {
        this.bodyNode = find("body", this.node) ?? undefined;
        this.leftBtns = find("body/left/btnViews", this.node) ?? undefined;
        this.leftBtnNode = this.leftBtns?.children ?? [];

        this.prsonaInfoNode = find("body/center/prarentView/prsonalinfo_view", this.node) ?? undefined;
        this.wallet = find("body/center/prarentView/my_wallet_view", this.node) ?? undefined;
        this.cashTurnover = find("body/center/prarentView/cash_turnover_view", this.node) ?? undefined;
        this.gameRecord = find("body/center/prarentView", this.node) ?? undefined;
        this.bodyNode?.setScale(Vec3.ONE);
    }

    start() {
        this.setItemView();
    }

    public setItemView() {
        this.setLeftBtnEvent();
        this.setBtnState();
    }

    public setPlantView() {
        if (!this.PersonalView) {
            this.PersonalView = this.prsonaInfoNode?.addComponent(PersonalinfoView);
        }

        this.PersonalView?.setView();
    }

    private setDefaultState() {
        this.btnIndex = 0;
        this.setBtnState();
    }

    private setLeftBtnEvent() {
        this.leftBtnNode.forEach((item, index) => {
            item.on(
                "click",
                () => {
                    this.btnIndex = index;
                    this.setBtnState();
                },
                this
            );
        });
        this.setDefaultState();
    }

    private setBtnState() {
        this.leftBtnNode.forEach((btn, index) => {
            if (index === this.btnIndex) {
                creator.setActive(btn.getChildByName("select"), true);
            } else {
                creator.setActive(btn.getChildByName("select"), false);
            }
        });
    }
}

export namespace playerInfoHandle {
    let infoPefab: Prefab | undefined;

    export function show() {
        const callback = async () => {
            if (!infoPefab) {
                let prefabRes = await snRes.loadAsync<Prefab>("lobby-model", "information");
                if (!prefabRes) {
                    return;
                }

                infoPefab = prefabRes;
            }

            const node = instantiate(infoPefab);

            node.setParent(config.uiNode.windowNode);
            const sc = node.addComponent(PlayerInfoView);
            node.setPosition(Vec3.ZERO);
            sc.setItemView();
        };

        callback();
    }
}
