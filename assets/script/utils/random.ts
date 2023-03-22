export namespace random {
    export function guid(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    export function anyString(length: number): string {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    export function getRandomInt(max: number): number {
        return Math.floor(Math.random() * max);
    }

    export function getRandomInterger(minNum: number, maxNum: number): number {
        if (minNum == maxNum) {
            return Math.floor(maxNum);
        }
        return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    }
}
