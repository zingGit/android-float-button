export namespace currency {
    /**
     * 将数字转为字符串
     * @param value 需要转化的数字
     * @returns 转化后的字符串
     */
    export function itoa(value: number): string {
        if (value === 0) {
            return "0";
        }

        if (value < 1000 * 100) {
            return `${value / 1e4}`;
        }

        const numFormat = (num: number) => {
            const res = num.toString().replace(/\d+/g, (n) => {
                return n.replace(/(\d)(?=(\d{3})+$)/g, (x) => `${x},`);
            });
            return res;
        };

        return numFormat(value / 1e4);
    }
    // 将普通数字字符串转为带逗号的字符串 '00000' => '00,000'
    export function sToS(str: string): string {
        const res = str.replace(/\d+/g, (n) => {
            return n.replace(/(\d)(?=(\d{3})+$)/g, (x) => `${x},`);
        });
        return res;
    }
    // 将数字转换为带K的字符串
    export function itos(value: number): string {
        if (value < 1000 * 100) {
            return `${value / 100}`;
        }
        let valueStr = Math.ceil(value / 1000) / 100 + "K";
        return valueStr;
    }
    // 将数字转换为bmfont字符串，1特殊处理
    export function itoBMFontStr(num: number | string, bMoney: boolean = true): string {
        if (bMoney) {
            num = Number(num) / 10000;
        }
        let strAry = num.toString().split('');
        let finalStr = "";
        for (let i = 0; i < strAry.length; i++) {
            if (strAry[i] == "1" || strAry[i] == "/" || strAry[i] == ":" || strAry[i] == ".") {
                strAry[i] += ' ';
            }
            finalStr += strAry[i];
        }
        return finalStr;
    }

    /**
     * @method 向下保留两位小数
     * @param value 
     * @returns 
     */
    export function fixed(value: number) {
        return Math.floor(value * 100) / 100 + "";
    }

    export function format(value: number) {
        const v = (value / 100).toFixed(2);
        return sToS(v);
    }
}
