import { log as ccLog, js, warn as ccWarn, error as ccError } from "cc";

export namespace moLog {
    let level = 0;
    function getDateString(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        const paddingLeft = (num: number) => `${num}`.padStart(2, "0");
        return `[${year}/${paddingLeft(month)}/${paddingLeft(day)} ${paddingLeft(hour)}:${paddingLeft(minute)}:${paddingLeft(second)}]`;
    }

    export function setLevel(lv: number): void {
        level = lv;
    }

    export function info(...args: any[]): void {
        if (level < 3) {
            return;
        }
        let backLog = console.log || ccLog;
        backLog.call(backLog, getDateString(), js.formatStr("%s", args));
    }

    export function warn(...args: any[]): void {
        if (level < 2) {
            return;
        }
        let backLog = console.warn || ccWarn;
        backLog.call(backLog, getDateString(), js.formatStr("%s", args));
    }

    export function error(...args: any[]): void {
        if (level < 1) {
            return;
        }
        let backLog = console.error || ccError;
        backLog.call(backLog, getDateString(), js.formatStr("%s", args));
    }
}
