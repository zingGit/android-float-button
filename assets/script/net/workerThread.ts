import { director, sys } from "cc";
import { globalData } from "../global/globalData";
import { snAudio } from "../manager/snAudio";

export namespace workerThread {

    let worker: Worker | null = null

    export function terminate(): void {
        if(!sys.isBrowser) {
            return
        }
        worker?.terminate()
        snAudio.setMusicVolume(globalData.applicaion.musicVolume)
    }

    export function create(): void {
        if(!sys.isBrowser) {
            return
        }

        snAudio.setMusicVolume(0)
        const thread = `function worker () {
            const timer = function() {
                self.postMessage('t'); 
            }
            setInterval(timer, 1000 / 5);
        } `;

        const blob = new Blob([thread + ";worker();"], { type: "text/javascript" })
        const url = window.URL.createObjectURL(blob)
        worker = new Worker(url)
        worker.onmessage = function (e) {
            director.mainLoop(0)
        };


    }
}