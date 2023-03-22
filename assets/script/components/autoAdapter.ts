import { _decorator, Component, Node, Canvas, find, sys, screen, view, UITransform, ResolutionPolicy, Widget } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AutoAdapter")
export class AutoAdapter extends Component {
    private canvas: Canvas | undefined;
    private widget: Widget | undefined;

    onLoad() {
        this.canvas = this.getComponent(Canvas) ?? undefined;
        this.widget = this.getComponent(Widget) ?? undefined;

        this.adapter();
    }

    private adapter() {
        const size = screen.windowSize;
        const curRatio = size.width / size.height;
        const minRatio = 1920 / 1080;
        const maxRatio = 2340 / 1080;
        if (curRatio > maxRatio) {
            view.setDesignResolutionSize(2340, 1080, ResolutionPolicy.FIXED_HEIGHT);
            this.canvas?.getComponent(UITransform)?.setContentSize(2340, 1080);

            const scale = 1080 / size.height;
            const diff = Math.floor(((size.width - maxRatio * size.height) / 2) * scale);
            if (this.widget) {
                this.widget.left = diff;
                this.widget.right = diff;
            }
        } else if (curRatio > minRatio) {
            view.setDesignResolutionSize(curRatio * 1080, 1080, ResolutionPolicy.FIXED_WIDTH);
            this.canvas?.getComponent(UITransform)?.setContentSize(curRatio * 1080, 1080);
        } else {
            view.setDesignResolutionSize(1920, 1080, ResolutionPolicy.FIXED_WIDTH);
            this.canvas?.getComponent(UITransform)?.setContentSize(1920, 1080);
        }

        if (this.widget) {
            this.widget.enabled = true;
            this.widget.updateAlignment();
        }
    }
}
