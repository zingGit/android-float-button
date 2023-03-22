import { Component, Label, Node, sys, Toggle, tween, v3, _decorator, find, Widget, Vec3 } from "cc";
import { alertDialog } from "../components/alertDialog";
import { audioDef, eventKey, storageKey } from "../config/define";
import { i18nLabelRes, i18nSwitchLanguage } from "../i18n/i18n";
import { snAudio } from "../manager/snAudio";
import { snEvent } from "../manager/snEvent";
const { ccclass, property } = _decorator;

@ccclass("Setting")
export class Setting extends Component {
    @property(Node)
    nodeBody: Node = null!;
    @property(Toggle)
    toggleMusic: Toggle = null!;
    @property(Toggle)
    toggleSound: Toggle = null!;
    @property(Node)
    nodeShowLanguage: Node = null!;
    @property(Label)
    labelCurLanguage: Label = null!;
    @property(Label)
    labelVersion: Label = null!;

    private tempPostion: Vec3 | undefined;
    onLoad() {
        if (!this.nodeBody) {
            return;
        }
        if (sys.localStorage.getItem(storageKey.musicVolume) == "0") {
            this.toggleMusic.isChecked = false;
        }
        if (sys.localStorage.getItem(storageKey.soundVolume) == "0") {
            this.toggleSound.isChecked = false;
        }
        if (sys.localStorage.getItem(storageKey.language) == "en-us") {
            this.labelCurLanguage.string = "English";
        }

        this.nodeBody.getComponent(Widget)?.updateAlignment();
        this.tempPostion = this.nodeBody?.getPosition();
        const x = this.tempPostion.x;
        tween(this.nodeBody)
            .to(0.2, {
                position: v3(x - 606, 0),
            })
            .start();
    }

    start() {
        this.labelVersion.string = "v" + localStorage.getItem("client-version") || "1.0.0"
    }

    private btnHideSetting(): void {
        snAudio.playAudio(audioDef.clickBtn);
        if (!this.nodeBody) {
            return;
        }

        tween(this.nodeBody)
            .to(0.2, {
                position: v3(this.tempPostion?.x, 0),
            })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

    private btnMusicCall(toggle: Toggle): void {
        const volume = !!toggle.isChecked ? 1 : 0;
        localStorage.setItem(storageKey.musicVolume, `${volume}`);
        snAudio.setMusicVolume(volume);
        snAudio.playAudio(audioDef.clickBtn);
    }

    private btnSoundCall(toggle: Toggle): void {
        const volume = !!toggle.isChecked ? 1 : 0;
        localStorage.setItem(storageKey.soundVolume, `${volume}`);
        snAudio.setSoundVolume(volume);
        snAudio.playAudio(audioDef.clickBtn);
    }

    private btnShowLanguageCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        this.nodeShowLanguage.active = true;
    }

    private btnSelectLanguage(event: Event, customData: string): void {
        snAudio.playAudio(audioDef.clickBtn);
        this.nodeShowLanguage.active = false;
        if (customData == "1") {
            this.labelCurLanguage.string = "English";
            i18nSwitchLanguage("en-us");
        } else {
            this.labelCurLanguage.string = "Portuguese";
            i18nSwitchLanguage("br-ze");
        }
    }

    private btnLogoutCall(): void {
        snAudio.playAudio(audioDef.clickBtn);
        alertDialog.show({
            content: i18nLabelRes.labelAsync("alert_logout"),
            onConfirm: () => {
                this.btnHideSetting();
                snEvent.emit(eventKey.logout);
            },
        });
    }
}
