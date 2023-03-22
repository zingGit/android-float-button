export namespace time {
    export function sleep(millisecond: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, millisecond);
        });
    }

    export async function delayCall(millisecond: number, callback: Function) {
        await sleep(millisecond);

        callback();
    }

    /**
     * 格式化秒数
     * @param seconds 秒
     * @returns
     */
    export function format(seconds: number): string {
        return new Date(seconds * 1000).toISOString().substring(11, 8 + 11);
    }

    /**
     * 转换时间格式
     * @param timestamp 时间戳
     * @returns 30/05/2022 18:05:37
     */
    export function changeDateStyle(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        const years = date.getFullYear();
        const month = date.getMonth() + 1;
        const days = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        return `${days.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${years}  ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    /**
     * 转换为本地时间
     * @param timestamp 时间戳
     * @returns
     */
    export function toLocalDateString(timestamp: number): string {
        const date = new Date(timestamp);
        const years = date.getFullYear();
        const month = date.getMonth() + 1;
        const days = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        return `${month.toString().padStart(2, "0")}/${days.toString().padStart(2, "0")}/${years}`;
    }

    /**
     * 转换为本地完整时间
     * @param timestamp 时间戳
     * @returns
     */
    export function toLocalDateTimeString(timestamp: number): string {
        const date = new Date(timestamp);
        const years = date.getFullYear();
        const month = date.getMonth() + 1;
        const days = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        return `${month.toString().padStart(2, "0")}/${days.toString().padStart(2, "0")}/${years} ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }
}
