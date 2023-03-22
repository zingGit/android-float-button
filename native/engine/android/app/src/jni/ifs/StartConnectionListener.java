package jni.ifs;

public interface StartConnectionListener {
    /**
     * @method 连接成功
     */
    void onBillingConnectionSucceed();

    /**
     * @method 连接失败
     */
    void onBillingConnectionFailed();
}
