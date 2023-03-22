export namespace strings {
    /**
     * 省略
     * @param str 需要处理的字符串
     * @param max 最大显示长度
     * @returns 处理后的字符换
     */
    export function ellipsis(str: string, max?: number): string {
        max = max ?? 30;
        if (max < 3) {
            return str;
        }

        if (str.length > max) {
            return `${str.substring(0, max - 3)}...`;
        }

        return str;
    }
}
