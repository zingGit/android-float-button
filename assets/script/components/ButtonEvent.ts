import { _decorator, Component, Node, Button } from "cc";
import { audioDef } from "../config/define";
import { snAudio } from "../manager/snAudio";
const { ccclass, property, requireComponent, disallowMultiple, menu } = _decorator;

@ccclass("ButtonEvent")
@requireComponent(Button)
@disallowMultiple
@menu("按钮事件")
export class ButtonEvent extends Component {
    // 只播放音效
    private playAudioWithNoDelay(): void {
        snAudio.playAudio(audioDef.clickBtn);
    }

    // 只延迟点击
    private delayClickWithNoAudio(): void {
        const button = this.node.getComponent(Button)!;
        button.interactable = false;
        this.scheduleOnce(() => {
            button.interactable = true;
        }, 0.5);
    }

    // 延迟并播放默认音效
    private delayClickAndPlayAudio(): void {
        this.playAudioWithNoDelay();
        this.delayClickWithNoAudio();
    }
}
