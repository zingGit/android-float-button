import { Component, Prefab, Vec3, _decorator, find, instantiate, Node, Label, Button, tween, easing, v3, Sprite } from "cc";
import { snRes } from "../manager/snRes";
import { config } from "../config/config";
import { api } from "../api/api";
import { moLog } from "../utils/logger";
import { currency } from "../utils/currency";
import { creator } from "../utils/creator";
import { snAudio } from "../manager/snAudio";
import { audioDef, eventKey } from "../config/define";
import { rewardDialog } from "../reward/reward";
import { snEvent } from "../manager/snEvent";
const { ccclass, property } = _decorator;

export interface IdailyInfo {
    day: number;
    amount: number;
}

export namespace dailyDialog {
    const prefabName = "dailyBouns";
    let dailyPrefab: Prefab | undefined;
    export function open() {
        const callback = async () => {
            if (!dailyPrefab) {
                const prefab = await snRes.loadAsync<Prefab>("lobby-model", "daily");
                if (!prefab) {
                    return;
                }
                dailyPrefab = prefab;
            }

            const node = instantiate(dailyPrefab);
            node.name = prefabName;
            node.setParent(config.uiNode.windowNode);
            node.setPosition(Vec3.ZERO);
            const sc = node.addComponent(DailyLogic);
            sc.moveIn();

            sc.bindCloseBtn(() => {
                sc.moveOut();
            });

            try {
                const info = await api.fetchDailyBouns();
                const { data } = info;
                console.log("daily:", data);
                sc.setItemView(data.days);
                sc.setItemViewState(data.dayIndex, data.isReceive);

                const signInCB = () => {
                    api.signIn()
                        .then(() => {
                            sc.setItemViewState(data.dayIndex, true);
                            rewardDialog.show({ amount: data.days[data.dayIndex - 1].amount });
                            sc.setTipsState(false);
                            snEvent.emit(eventKey.refreshUserBalance)
                        })
                        .catch((err) => {
                            moLog.info(err.code);
                        });
                };

                sc.bindSubmitBtn(() => {
                    snAudio.playAudio(audioDef.clickBtn);
                    signInCB();
                });
            } catch (err: any) {
                moLog.error(`daily show: ${JSON.stringify(err)}`);
            }
        };

        callback();
    }

    export class dailyItem {}
}

@ccclass("DailyLogic")
export class DailyLogic extends Component {
    private bodyNode: Node | undefined;
    private dailyItem: Node | undefined;
    private sevenDailyItem: Node | undefined;
    private submit: Button | undefined;
    private closeBtn: Button | undefined;
    private dailyView: Node | undefined;
    private itemInfos: DailyItem[] = [];
    private submitSprite: Sprite | undefined;
    private tips: Node | undefined;
    onLoad() {
        this.bodyNode = find("body", this.node) ?? undefined;
        this.dailyItem = find("body/dailyView/dailyitem", this.node) ?? undefined;
        this.sevenDailyItem = find("body/dailyView/dailyitem7", this.node) ?? undefined;

        this.submit = find("body/submit", this.node)?.getComponent(Button) ?? undefined;

        this.submitSprite = this.submit?.node.getComponent(Sprite) ?? undefined;

        this.closeBtn = find("body/btn_close", this.node)?.getComponent(Button) ?? undefined;
        this.dailyView = find("body/dailyView", this.node) ?? undefined;

        this.tips = find("body/tips", this.node) ?? undefined;
        this.bodyNode?.setScale(Vec3.ZERO);
    }

    public moveIn() {
        tween(this.bodyNode).to(0.3, { scale: Vec3.ONE }, { easing: easing.cubicOut }).start();
    }

    public moveOut() {
        tween(this.bodyNode)
            .to(0.3, { scale: Vec3.ZERO }, { easing: easing.cubicOut })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    public setTipsState(show: boolean) {
        creator.setActive(this.tips, show);
    }

    public setItemView(infos: IdailyInfo[]) {
        infos.forEach((info) => {
            const dayIndex = info.day;
            const item = dayIndex === 7 ? instantiate(this.sevenDailyItem) : instantiate(this.dailyItem);

            if (!item) {
                return;
            }

            const sc = new DailyItem(item, dayIndex);
            sc.setAmount(info.amount);
            sc.setDailyLabel(info.day);
            this.dailyView?.addChild(item);
            item.active = true;
            this.setItemLocalPostion(item, info.day);

            this.itemInfos.push(sc);
        });
    }

    private setItemLocalPostion(item: Node, dailyIndex: number) {
        if (dailyIndex == 7) {
            item.setPosition(new Vec3(662, -128));
            return;
        }

        if (dailyIndex >= 1 && dailyIndex <= 3) {
            item.setPosition(new Vec3(192 * (dailyIndex - 1), 0, 0));
        }

        if (dailyIndex > 3 && dailyIndex <= 6) {
            //4 5 /6
            const X = -17 + (dailyIndex - 4) * 192;

            item.setPosition(new Vec3(X, -247));
        }
    }

    public setItemViewState(curDailyIndex: number, isReceived: boolean) {
        this.setClaimBtnState(isReceived);

        this.itemInfos.forEach((item) => {
            if (isReceived) {
                if (item.dayIndex <= curDailyIndex) {
                    item.setCompleted();
                } else {
                    item.setNorMal();
                }
            } else {
                if (item.dayIndex == curDailyIndex) {
                    item.setSelect();
                } else if (item.dayIndex < curDailyIndex) {
                    item.setCompleted();
                } else {
                    item.setNorMal();
                }
            }
        });
    }

    private setClaimBtnState(isReceived: boolean) {
        if (!this.submit) {
            return;
        }

        if (!this.submitSprite) {
            return;
        }

        this.submit.interactable = !isReceived;

        this.submitSprite.grayscale = isReceived;
    }

    public bindCloseBtn(callBack: Function) {
        this.closeBtn?.node.on("click", callBack, this);
    }

    public bindSubmitBtn(callback: Function) {
        this.submit?.node.on("click", callback, this);
    }
}

class DailyItem {
    private node: Node | undefined;
    private selectBg: Node | undefined;
    private norMalBg: Node | undefined;
    private finshBg: Node | undefined;
    private dailyLabel: Label | undefined;
    private amount: Label | undefined;
    public dayIndex: number = 1;

    constructor(item: Node, dayIndex: number) {
        this.node = item;
        this.norMalBg = find("normoalbg", this.node) ?? undefined;
        this.selectBg = find("selectbg", this.node) ?? undefined;
        this.finshBg = find("finishbg", this.node) ?? undefined;
        this.dailyLabel = find("dailyLabel", this.node)?.getComponent(Label) ?? undefined;
        this.amount = find("amount", this.node)?.getComponent(Label) ?? undefined;
        this.dayIndex = dayIndex;
    }

    public setDailyLabel(dailyIndex: number) {
        if (!this.dailyLabel) {
            return;
        }

        this.dailyLabel.string = `Day ${dailyIndex}`;
    }

    public setAmount(amount: number) {
        if (!this.amount) {
            return;
        }

        this.amount.string = `R$ ${currency.itoa(amount)}`;
    }

    //完成领取的
    public setCompleted() {
        // creator.setActive(this.norMalBg, true); //正常情况下的bg永远不动
        creator.setActive(this.selectBg, false);
        creator.setActive(this.finshBg, true);
    }

    //当天没有领取
    public setSelect() {
        creator.setActive(this.selectBg, true);
        creator.setActive(this.finshBg, false);
    }

    //正常的
    public setNorMal() {
        creator.setActive(this.selectBg, false);
        creator.setActive(this.finshBg, false);
        creator.setActive(this.norMalBg, true);
    }
}
