import { Color, Component, Label, Sprite, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Countdown")
export class Countdown extends Component {
    @property(Sprite)
    bg: Sprite = null!;
    @property(Label)
    label: Label = null!;
    @property
    normalColor: Color = Color.WHITE.clone();
    @property
    countdownColor: Color = Color.WHITE.clone();
    @property
    textTemplate: string = "#1 s";

    private cacheText = "";

    onLoad() {
        this.cacheText = this.label?.string ?? "";
    }

    private setGray(value: boolean): void {
        if (!this.bg) {
            return;
        }

        if (this.bg.grayscale === value) {
            return;
        }

        this.bg.grayscale = value;
    }

    private setText(text: string): void {
        if (!this.label) {
            return;
        }

        this.label.string = text;
    }

    private setLabelColor(color: Color): void {
        if (!this.label) {
            return;
        }

        this.label.color = color;
    }

    private replace(time: number): string {
        const reg = new RegExp("#1", "g");
        return this.textTemplate.replace(reg, `${time}`);
    }

    public countdown(time: number): void {
        if (time <= 0) {
            return;
        }

        this.setGray(true);
        this.setText(this.replace(time));
        this.setLabelColor(this.countdownColor);
        this.schedule(
            () => {
                time--;
                this.setText(this.replace(time));

                if (time <= 0) {
                    this.setGray(false);
                    this.setText(this.cacheText);
                    this.setLabelColor(this.normalColor);
                }
            },
            1,
            time - 1 > 0 ? time - 1 : 1
        );
    }

    public cancel(): void {
        this.unscheduleAllCallbacks();
        this.setGray(false);
        this.setText(this.cacheText);
        this.setLabelColor(this.normalColor);
    }
}
