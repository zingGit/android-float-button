import { Button, Label, macro, Node, ResolutionPolicy, view } from "cc";
import { globalData } from "../global/globalData";
import { sdk } from "../native-helper/sdk";

/**
 * Cocos Creator 扩展方法
 */
export namespace creator {
    /**
     * 设置节点的状态
     * @param node 需要设置的节点
     * @param active 状态
     * @returns
     */
    export function setActive(node: Node | null | undefined, active: boolean): void {
        if (!node) {
            return;
        }

        if (node.active === active) {
            return;
        }

        node.active = active;
    }

    /**
     * 销毁节点
     * @param node 要销毁的节点
     * @returns void
     */
    export function destroy(node: Node | null | undefined): void {
        if (!node) {
            return;
        }

        if (!node.isValid) {
            return;
        }

        node.destroy();
    }

    /**
     * 修改按钮点击状态
     * @param btn 按钮
     * @param interactable 是否允许点击
     * @returns
     */
    export function setBtnInteractable(btn: Button | undefined, interactable: boolean) {
        if (!btn) {
            return;
        }

        if (btn.interactable === interactable) {
            return;
        }

        btn.interactable = interactable;
    }


    export function setChildLabelByName(node: Node, childName: string, str: string) {

        if (!node.isValid) {
            return
        }

        const label = node.getChildByName(childName)!.getComponent(Label)

        if (!label) {
            return
        }

        label.string = str
    }

    export function setScreenOrientationLandscape() {
        view.setDesignResolutionSize(globalData.applicaion.designWidth, globalData.applicaion.designHeight, ResolutionPolicy.FIXED_HEIGHT);
        view.setOrientation(macro.ORIENTATION_LANDSCAPE);

        sdk.setScreenOrientationLandscape();
    }

    export function setScreenOrientationPortrait() {
        view.setDesignResolutionSize(globalData.applicaion.designHeight, globalData.applicaion.designWidth, ResolutionPolicy.FIXED_WIDTH);
        view.setOrientation(macro.ORIENTATION_PORTRAIT);

        sdk.setScreenOrientationPortrait();
    }
}
