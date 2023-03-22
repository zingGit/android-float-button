import { AudioClip, AudioSource, Component, Node, _decorator } from "cc";
import { globalData } from "../global/globalData";
import { moLog } from "../utils/logger";
import { snRes } from "./snRes";
const { ccclass, property } = _decorator;

@ccclass("AudioViewLogic")
export class AudioViewLogic extends Component {
    @property(AudioSource)
    musicAudioSource: AudioSource = null!;
    @property(AudioSource)
    soundAudioSource: AudioSource = null!;

    private audioCache: Map<string, AudioClip> = new Map();

    public addClipCache(clipName: string, clip: AudioClip): void {
        this.audioCache.set(clipName, clip);
    }

    public checkExistClipCache(clipName: string): boolean {
        const clip = this.audioCache.get(clipName);
        if (!clip) {
            return false;
        }
        return true;
    }

    public setMusicVolume(volume: number): void {
        globalData.applicaion.musicVolume = volume;
        if (volume) {
            this.musicAudioSource.volume = volume;
            this.musicAudioSource.play();
        } else {
            this.musicAudioSource.pause();
        }
    }

    public playMusic(clipName: string): void {
        this.musicAudioSource.stop();
        const clip = this.audioCache.get(clipName)!;
        this.musicAudioSource.clip = clip;
        this.musicAudioSource.play();
        this.musicAudioSource.loop = true;
        if (!globalData.applicaion.musicVolume) {
            this.musicAudioSource.pause();
        }
    }

    public setSoundVolume(volume: number): void {
        globalData.applicaion.soundVolume = volume;
        this.soundAudioSource.volume = volume;
    }

    public playAudio(clipName: string): void {
        if (!globalData.applicaion.soundVolume) {
            return;
        }
        
        this.soundAudioSource.stop();
        const clip = this.audioCache.get(clipName)!;
        this.soundAudioSource.playOneShot(clip, 1);
    }
}

export namespace snAudio {
    let audioLogic: AudioViewLogic | null;

    export function initView(node: Node): void {
        audioLogic = node.getComponent(AudioViewLogic);
    }

    export async function loadAudio(audioName: string, assetsName: string): Promise<void> {
        if (audioLogic?.checkExistClipCache(audioName)) {
            return;
        }
        const clip = await snRes.loadAsync<AudioClip>("resources", assetsName);
        if (!clip) {
            return;
        }

        audioLogic?.addClipCache(audioName, clip);
    }

    export function playMusic(name: string): void {
        if (!audioLogic?.checkExistClipCache(name)) {
            moLog.error("playMusic error: ", name);
            return;
        }
        audioLogic?.playMusic(name);
    }

    export function playAudio(name: string): void {
        if (!audioLogic?.checkExistClipCache(name)) {
            moLog.error("playAudio error: ", name);
            return;
        }
        audioLogic?.playAudio(name);
    }

    export function setMusicVolume(volume: number): void {
        audioLogic?.setMusicVolume(volume);
    }

    export function setSoundVolume(volume: number): void {
        audioLogic?.setSoundVolume(volume);
    }
}
