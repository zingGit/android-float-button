export namespace validator {
    /**
     * 验证手机号码
     * @param phone 手机号
     * @returns
     */
    export function phone(phone: string): boolean {
        const reg = new RegExp("^\\d{11}$", "g");
        return reg.test(phone);
    }

    /**
     * 验证短信验证码
     * @param code 验证码
     * @returns
     */
    export function smsCode(code: string): boolean {
        const reg = new RegExp("^\\d{6}$", "g");
        return reg.test(code);
    }

    /**
     * 验证密码
     * @param password 密码
     * @returns
     */
    export function password(password: string): boolean {
        const reg = new RegExp("^[0-9A-Za-z]{6,20}$", "g");
        return reg.test(password);
    }

    /**
     * 验证昵称
     * @param nickname 昵称
     * @returns
     */
    export function nickname(nickname: string): boolean {
        const reg = new RegExp("^[a-zA-Z0-9]+([a-zA-Z0-9\\s]?[a-zA-Z0-9]){4,19}$", "g");
        return reg.test(nickname);
    }

    /**
     * 匹配邀请码
     * @param text 网页端粘贴的邀请码
     * @returns 邀请码
     */
    export function matchInvitationCode(text: string): string {
        const reg = new RegExp("##(.*?)##");
        const group = reg.exec(text);
        if (group && group.length >= 2) {
            return group[1];
        }

        return "";
    }

    /**
     * IFSC 验证规则
     * @param text 需要验证的文本
     * @returns
     */
    export function ifsc(text: string): boolean {
        const reg = new RegExp("^[A-Za-z]{4}0[A-Z0-9]{6}$", "g");
        return reg.test(text);
    }

    /**
     * 真实姓名验证
     * @param text 需要验证的文本
     * @returns
     */
    export function realName(text: string): boolean {
        const reg = new RegExp("^[a-zA-Z0-9]+([a-zA-Z0-9s]?[a-zA-Z0-9]){4,49}$", "g");
        return reg.test(text);
    }

    /**
     * email 验证
     * @param text 需要验证的文本
     * @returns
     */
    export function email(text: string): boolean {
        const reg = new RegExp("^[0-9a-z][_.0-9a-z-]{0,31}@([0-9a-z][0-9a-z-]{0,30}[0-9a-z].){1,4}[a-z]{2,4}$", "g");
        return reg.test(text);
    }
}
