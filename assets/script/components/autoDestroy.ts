import { _decorator, Component, Node } from "cc";
const { ccclass, property, disallowMultiple } = _decorator;

@ccclass("AutoDestroy")
@disallowMultiple
export class AutoDestroy extends Component {
    @property({ displayName: "持续时间（秒）" })
    private duration: number = 1.5;

    @property({ displayName: "自动开始计时" })
    private runInLoad: boolean = false;

    private destroyCall: Function = this.autoDestroy.bind(this);

    onLoad() {
        if (this.runInLoad) {
            this.scheduleOnce(this.destroyCall, this.duration);
        }
    }

    private autoDestroy() {
        if (!this.node.isValid) {
            return;
        }

        this.node.destroy();
    }

    public setDuration(duration: number): void {
        this.duration = duration;

        this.unschedule(this.destroyCall);

        this.scheduleOnce(this.destroyCall, this.duration);
    }
}
