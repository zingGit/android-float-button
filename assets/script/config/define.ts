// 本地缓存
export namespace storageKey {
    export const musicVolume = "musicVolume";
    export const soundVolume = "soundVolume";
    export const authorization = "authorization";
    export const language = "language";
    export const phone = "phone";
    export const password = "password";
    export const lastSmsRequestTime = "lastSmsRequestTime";
    export const phoneBinded = "phoneBinded";
    export const emailkey = "EnmailItemKey";
}
// emit事件
export namespace eventKey {
    export const logout = "logout";
    export const backgroundState = "backgroundState";
    export const updateBalance = "updateBalance"; // 更新余额
    export const refreshUserBalance = "refreshUserBalance"; // 刷新用户金币
    export const lobbyReconnect = "lobbyReconnect"; // 大厅重连处理
    export const lobbyServicesInfo = "lobbyServicesInfo" //大厅推送消息
    export const editUserHead = "editUserHead" //编辑头像
    export const editUserName = "editUserName"
    export const refreshBindInfo = "refreshBindInfo"
    export const refreshManageBankCard = "refreshManageBankCard"    // 刷新管理银行卡界面信息
    export const refreshBankCardList = "refreshBankCardList"    // 刷新银行卡列表
    export const bindingBancard = "bindingBancard"
    export const addCashEvent = "addCashEvent"
    export const withdrawEvent = "withdrawEvent"
    export const googleOrderSuccessful = "googleOrderSuccessful" //google 支付成功
}
// 音效
export namespace audioDef {
    export const clickBtn = "click_Btn"; // 点击按钮
    export const lobbyMusic = "lobbyMusic"; // 大厅背景音乐
    export const rewardMusic = "rewardMusic";
}
