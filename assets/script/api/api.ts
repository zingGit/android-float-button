import { PREVIEW } from "cc/env";
import { Base64 } from "js-base64";
import { config } from "../config/config";
import { random } from "../utils/random";
import { http } from "./http";

export namespace api {
    const header: Map<string, string> = new Map();

    ///////////////////////// 基础通信 ///////////////////////
    export function addHeader(name: string, value: string) {
        header.set(name, value);
    }

    export function addAuthorization(value: string) {
        header.set("Authorization", value);
    }

    function encodeUrl(url: string): string {
        return url;
        if (PREVIEW) {
        }
        const str = Base64.encode(`${random.anyString(random.getRandomInt(50) + 1)}|${url}`);
        return `${str}${str.length.toString().padStart(3, "0")}`;
    }

    async function post(router: string, data?: any): Promise<any> {
        return http.post(`${config.env.apiUrl}/${encodeUrl(router)}`, data, header);
    }

    async function get(router: string, data?: any): Promise<any> {
        return http.get(`${config.env.apiUrl}/${encodeUrl(router)}`, data, header);
    }

    /**
     * 检测服务是否正常
     * @param data 请求的数据
     * @returns
     */
    export async function ping(data?: any) {
        return http.get(`${config.env.apiUrl}/ping`, data);
    }

    ///////////////////////// 登录注册 ///////////////////////
    /**
     * 注册
     * @param data 请求的数据
     * @returns
     */
    export async function register(data?: any) {
        return post("api/v1/register", data);
    }

    /**
     * 登录请求
     * @param data 请求的数据
     * @returns
     */
    export async function login(data?: any): Promise<any> {
        return post(`api/v1/login`, data);
    }

    /**
     * 获取验证码
     * @param data 请求的数据
     * @returns
     */
    export async function fetchSmsCode(data?: any): Promise<any> {
        return post(`sms/v1/sms-code`, data);
    }

    /**
     * Facebook 登录
     * @param data 请求的数据
     * @returns
     */
    export async function facebookLogin(data?: any): Promise<any> {
        return post(`api/v1/facebook-login`, data);
    }

    /**
     * Token 登录
     * @param data 请求的数据
     * @returns
     */
    export async function tokenLogin(data?: any) {
        return post(`api/v1/token-login`, data);
    }

    /**
     * 获取设备ID
     * @param data 请求的数据
     */
    export async function fetchDeviceId(data?: any) {
        return post("api/v1/app/device-id", data);
    }

    /**
     * 忘记密码
     * @param data 请求的数据
     * @returns
     */
    export async function forgetPassword(data?: any) {
        return post("api/v1/forget-password", data);
    }

    /**
     * 请求用户信息
     * @param data 请求的数据
     * @returns
     */
    export async function fetchUserInfo(data?: any) {
        return get("api/v1/me", data);
    }
    /**
     * @method 玩家游戏记录
     * @param data 
     * @returns 
     */
    export async function featGameRecords(data?: any) {
        return get("gi/v1/game-records", data)
    }

    export async function featBalanceRecords(data?: any) {
        return get("payment/v1/balance/records", data)
    }
    export async function featWithdrawInfo(data?: any) {
        return get("payment/v1/withdrawable/getWithdrawable", data)
    }

    /**
     * 请求APP模式
     * @param data 请求的数据
     * @returns
     */
    export async function fetchAppMode(data?: any) {
        return get("api/v1/app/update", data);
    }

    ///////////////////////// 充值提现 /////////////////////////
    /**
     * 获取充值通道
     * @param data 请求的参数
     * @returns
     */
    export async function fetAddCashChannels(data?: any) {
        return get("payment/v1/payin/getChannels", data);
    }

    /**
     * 获取充值活动列表
     * @returns
     */
    export async function fetchAddCashActivity() {
        return get("activity/v1/list", { type: 1 });
    }

    /**
     * 请求参与充值活动
     * @param data 请求的数据
     * @returns
     */
    export async function fetchJoinRechargeActivity(data?: any) {
        return post("activity/v1/join", data);
    }

    /**
     * 创建支付订单
     * @param data 请求的数据
     * @returns
     */
    export async function fetchCreateOrder(data?: any) {
        return post("payment/v1/payin/createOrder", data);
    }

    /**
     * 充值记录
     * @param data 请求的数据
     * @returns
     */
    export async function fetchRechargeRecord(data?: any) {
        return get("payment/v1/payin/getOrders", data);
    }
    /**
     * 提现记录
     * @param data 请求的数据
     * @returns
     */
    export async function fetchWithdrawalRecord(data?: any) {
        return get("payment/v1/payout/getOrders", data);
    }

    /**
     * 获取提现通道
     * @param data 请求的参数
     * @returns
     */
    export async function fetWithdrawChannels(data?: any) {
        return get("payment/v1/payout/getChannels", data);
    }

    /**
     * 获取银行卡列表
     * @param data 请求的参数
     * @returns
     */
    export async function fetchBankCardList(data?: any) {
        return get("payment/v1/bank/getList", data);
    }

    /**
     * 新增银行卡信息
     * @param data 请求的数据
     * @returns
     */
    export async function fetchAddBankCard(data?: any) {
        return post("payment/v1/bank/add", data);
    }
    /**
     * 移除银行卡
     * @param id 请求的数据
     * @returns
     */
    export async function fetchRemoveBankCard(id: number) {
        return post(`payment/v1/bank/delete/${id}`);
    }
    /**
     * 更新银行卡信息
     * @param data 请求的数据
     * @returns
     */
    export async function fetchUpdateBankCard(data?: any) {
        return post("payment/v1/bank/update", data);
    }
    /**
     * 查询某银行卡信息
     * @param id 请求的参数
     * @returns
     */
    export async function fetchFindBankCardInfo(id: number) {
        return get(`payment/v1/bank/getDetail/${id}`);
    }
    /**
     * 创建提现订单
     * @param data 请求的数据
     * @returns
     */
    export async function fetchCreateWithdrawOrder(data?: any) {
        return post("payment/v1/payout/createOrder", data);
    }
    ///////////////////////// 大厅功能 /////////////////////////
    /**
     * 是否显示充值和商城按钮
     * @returns
     */
    export async function fetchShowAddCash() {
        return get("api/v1/app/config");
    }
    /**
     * 是否显示提现按钮
     * @returns
     */
    export async function fetchShowWithdraw() {
        return get("payment/v1/payout/checkShow");
    }
    /**
     * 签到
     * @returns
     */
    export async function signIn() {
        return post("api/v1/daily/receive");
    }

    /**
     * 获取签到奖品列表
     * @returns
     */
    export async function fetchDailyBouns() {
        return get("api/v1/daily");
    }

    /**
     * 获取签到奖品列表
     * @returns
     */
    export async function fetchShowActivityList() {
        return get("activity/v1/show-list");
    }

    /**
     * 修改头像
     * @param data 请求的数据
     * @returns
     */
    export async function changeAvatar(data?: any) {
        return post("api/v1/me/avatar-id", data);
    }

    /**
     * 修改昵称
     * @param data 请求的数据
     * @returns
     */
    export async function changeNickname(data?: any) {
        return post("api/v1/me/nickname", data);
    }

    /**
     * 绑定手机
     * @param data 请求的数据
     * @returns
     */
    export async function verifyPhone(data?: any) {
        return post("api/v1/me/bind-tel-number", data);
    }

    /**
     * 获取客服列表
     * @param data 请求的数据
     * @returns
     */
    export async function fetchCustomService(data?: any) {
        return get("api/v1/custom-services", data);
    }
    /**
     * google play 
     * @param data 
     * @returns 
     */
    export async function fetproducts(data?: any) {
        return get("google/v1/products", data);
    }
    export async function featGoogleLaunch(data?: any) {
        return post("google/v1/launch", data);
    }
    export async function featGoogleSubmit(data?: any) {
        return post("google/v1/submit", data);
    }

    /**
     * 请求系统邮件
     * @param data 请求的数据
     * @returns
     */
    export async function fetsystemmsg(data?: any) {
        return get("email/v1/list", data);
    }

    export async function getCarousels(data?: any) {
        return get("api/v1/carousel", data)
    }

    export async function getShareInfo(data?: any) {
        return get("api/v1/share", data)
    }

    export async function readEmail(data?: any) {
        return post("email/v1/read", data)
    }

    export async function takeAllCoins(data?: any) {
        return post("email/v1/take-all", data)
    }

    export async function takeCoins(data?: any) {
        return post("email/v1/take", data)
    }

    export async function deleteEmail(data?: any) {
        return post("email/v1/delete", data)
    }

    /**
     * 拉取用户金币
     */
    export async function refreshUserBalance(data?: any) {
        return get("gi/v1/refreshUserWallet/-1", data)
    }

    ///////////////////////// 游戏数据 ///////////////////////

    /**
     * 请求trucopaulista房间列表
     * @param data 请求的数据
     * @returns
     */
    export async function fetchTrucoPaulistaRooms(data?: any) {
        return get("games/truco-paulista/rooms", data);
    }

    /**
     * 请求trucomineiro房间列表
     * @param data 请求的数据
     * @returns
     */
    export async function fetchTrucoMineiroRooms(data?: any) {
        return get("games/truco-mineiro/rooms", data);
    }


    export async function getGameList(data?: any) {
        return get("gi/v1/getGameList", data);
    }

    export async function getGameAddr(data?: any) {
        return get("gi/v1/getGameAddr", data)
    }

}
