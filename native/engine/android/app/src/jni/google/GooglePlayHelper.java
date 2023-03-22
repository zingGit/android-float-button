package jni.google;

import android.app.Activity;
import android.util.Log;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchaseHistoryResponseListener;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchaseHistoryParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.android.billingclient.api.SkuDetailsResponseListener;
import com.cocos.service.SDKWrapper;

import java.util.ArrayList;
import java.util.List;

import jni.ifs.StartConnectionListener;

public class GooglePlayHelper {
    private static final String TAG = "GooglePlayHelper";
    private static final int GAME_ORDER_ID=0x01;
    private Activity mMainActivity;
    private BillingClient mBillingClient;
    private String mOrderId = "";
    private List<ProductDetails> mProductDetailsList = new ArrayList<>();

    public GooglePlayHelper(Activity main) {
        mMainActivity = main;
        init(mMainActivity);
    }

    /**
     * @method 初始化
     * @param context
     */
    private void init(Activity context) {
        Log.d(TAG,"init");
        mBillingClient = BillingClient.newBuilder(context)
                .setListener(purchasesUpdatedListener)
                .enablePendingPurchases()
                .build();
    }
    /**
     * @method 监听所有购买交易更新
     */
    private PurchasesUpdatedListener purchasesUpdatedListener = new PurchasesUpdatedListener() {
        @Override
        public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
            // To be implemented in a later section.
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
                for (Purchase purchase : purchases) {
                    handlePurchase(purchase);
                    Log.d(TAG, "purchases succeed");
                    Log.d(TAG, purchase.toString());
                }
            } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
                // Handle an error caused by a user cancelling the purchase flow.
                Log.d(TAG, "puchases user canceled");
            } else {
                // Handle any other error codes.
                Log.d(TAG, "purchases error");
            }
        }
    };

    /**
     * @method 处理用户购买的商品
     * consumeAsync 标记消耗，成功通知服务端发放内容
     *
     * @param purchase
     */
    private  void handlePurchase(Purchase purchase) {
        // Purchase retrieved from BillingClient#queryPurchasesAsync or your PurchasesUpdatedListener.
        // Verify the purchase.
        // Ensure entitlement was not already granted for this purchaseToken.
        // Grant entitlement to the user.
        StartConnectionListener startConnectionListener = new StartConnectionListener() {
            @Override
            public void onBillingConnectionSucceed() {
                ConsumeParams consumeParams =
                        ConsumeParams.newBuilder()
                                .setPurchaseToken(purchase.getPurchaseToken())
                                .build();

                ConsumeResponseListener listener = new ConsumeResponseListener() {
                    @Override
                    public void onConsumeResponse(BillingResult billingResult, String purchaseToken) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            // Handle the success of the consume operation.
                            Log.d(TAG, "consume succeed");
                        }
                        else {
                            //请求消耗失败
                        }
                    }
                };
                //购买成功 执行消耗
                mBillingClient.consumeAsync(consumeParams, listener);
            }

            @Override
            public void onBillingConnectionFailed() {
                Log.d(TAG, "consumeAsync connection failed");
            }
        };
        startConnection(startConnectionListener);
    }

    /**
     * @method 建立连接
     * @param startConnectionListener
     */
    private void startConnection(StartConnectionListener startConnectionListener) {
        if(isReady()) {
            startConnectionListener.onBillingConnectionSucceed();
            return;
        }
        //建立连接是异步的，回调实现BillingClientStateListener
        mBillingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                int code = billingResult.getResponseCode();
                String msg = billingResult.getDebugMessage();
                if (billingResult.getResponseCode() ==  BillingClient.BillingResponseCode.OK) {
                    // The BillingClient is ready. You can query purchases here.
                    Log.d(TAG, "The BillingClient is ready. You can query purchases here.");
                    startConnectionListener.onBillingConnectionSucceed();
                }
            }
            @Override
            public void onBillingServiceDisconnected() {
                // Try to restart the connection on the next request to
                // Google Play by calling the startConnection() method.
                startConnectionListener.onBillingConnectionFailed();
                Log.d(TAG, "连接失败");
            }
        });
    }

    /**
     * @emthod 释放连接
     */
    public void release() {
        if (isReady()) {
            mBillingClient.endConnection();
        }
    }

    /**
     * @method 连接状态
     * @return
     */
    private boolean isReady() {
        return mBillingClient != null && mBillingClient.isReady();
    }

    /**
     * @method 查询商品
     * @param productType 商品类型  BillingClient.ProductType   (inapp | subs
     * @param productIds  商品id 对应google后台的
     */
    public void queryProductDetailsAsync(String productType, List<String> productIds) {
        StartConnectionListener startConnectionListener = new StartConnectionListener() {
            @Override
            public void onBillingConnectionSucceed() {
                //查询商品参数列表
                List <QueryProductDetailsParams.Product> productList = new ArrayList();
                for (String productId : productIds) {
                    QueryProductDetailsParams.Product product = QueryProductDetailsParams
                            .Product.newBuilder()
                            .setProductId(productId)
                            .setProductType(BillingClient.ProductType.INAPP)
//                            .setProductType(productType)
                            .build();
                    //添加对应的 产品id 去查询详情
                    productList.add(product);
                }
                Log.d(TAG, "查询商品数量:"+ productList.size());
                //实现queryProductDetailsParams
                QueryProductDetailsParams queryProductDetailsParams = QueryProductDetailsParams.newBuilder()
                        .setProductList(productList)
                        .build();

                /**
                 * 查询商品详情
                 * 异步操作，实现ProductDetailsResponseListener 监听查询结果
                 */
                mBillingClient.queryProductDetailsAsync(queryProductDetailsParams,
                        new ProductDetailsResponseListener() {
                            public void onProductDetailsResponse(BillingResult billingResult, List<ProductDetails> productDetailsList) {
                                // check billingResult
                                // process returned productDetailsList
                                if(billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                                    mProductDetailsList = productDetailsList;
                                    Log.d(TAG, "查询商品详情成功 result："+ billingResult.toString());
                                    Log.d(TAG, "details:" + productDetailsList.toString());
                                }
                                else {
                                    Log.d(TAG, "查询商品详情失败："+ billingResult.toString());
                                }



                            }
                        }
                );

            }

            @Override
            public void onBillingConnectionFailed() {
                Log.d(TAG, "queryProductDetailsAsync connection failed");
            }
        };

        startConnection(startConnectionListener);

    }

    /**
     * @method 启动购买
     * 成功后会显示Google Play 购买界面
     */
    public void launchBillingFlow() {
        if(mProductDetailsList.size() == 0) {
            Log.d(TAG, "未查询到商品 不发起购买");
            return;
        }
        StartConnectionListener startConnectionListener = new StartConnectionListener() {
            @Override
            public void onBillingConnectionSucceed() {

                List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
                //商品详情
                for (ProductDetails productDetails:mProductDetailsList) {
                    BillingFlowParams.ProductDetailsParams productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                            // retrieve a value for "productDetails" by calling queryProductDetailsAsync()
                            .setProductDetails(productDetails)
                            // to get an offer token, call ProductDetails.getSubscriptionOfferDetails()
                            // for a list of offers that are available to the user
                            .setOfferToken(String.valueOf(productDetails.getSubscriptionOfferDetails()))
                            .build();
                    productDetailsParamsList.add(productDetailsParams);
                }

                BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(productDetailsParamsList)
                        .setObfuscatedAccountId(mOrderId) //订单号
                        .build();

                // Launch the billing flow
                BillingResult billingResult = mBillingClient.launchBillingFlow(mMainActivity, billingFlowParams);
                if(billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "launchBillingFlow succeed");
                }
                else{
                    Log.d(TAG, "launchBillingFlow failed");
                }
            }

            @Override
            public void onBillingConnectionFailed() {
                Log.d(TAG, "launchBillingFlow connection failed");
            }
        };

        startConnection(startConnectionListener);

    }

    /**
     * @method 查询交易记录
     * @param productType 查询类型 isapp  subs
     */
    public void queryPurchaseHistoryAsync(String productType) {
        StartConnectionListener startConnectionListener = new StartConnectionListener() {
            @Override
            public void onBillingConnectionSucceed() {
                mBillingClient.queryPurchaseHistoryAsync(
                        QueryPurchaseHistoryParams.newBuilder()
                                .setProductType(productType)
                                .build(),
                        new PurchaseHistoryResponseListener() {
                            public void onPurchaseHistoryResponse(
                                    BillingResult billingResult, List purchasesHistoryList) {
                                // check billingResult
                                // process returned purchase history list, e.g. display purchase history
                            }
                        }
                );

            }

            @Override
            public void onBillingConnectionFailed() {

            }
        };

        startConnection(startConnectionListener);
    }

    /**
     * @methodo 提取购买交易
     * app 启动后调用此函数 官方建议写在onResume 中函数
     * 主要是防止购买后由于网络问题 或其他原因导致购买后 没有收到消息
     * 所以在app启动时检查一遍
     * todo: 仅返回有效订阅和非消耗型一次性购买交易。
     */
    public void queryPurchasesAsync() {
        StartConnectionListener startConnectionListener = new StartConnectionListener() {
            @Override
            public void onBillingConnectionSucceed() {
                mBillingClient.queryPurchasesAsync(
                        QueryPurchasesParams.newBuilder()
                                .setProductType(BillingClient.ProductType.SUBS)
                                .build(),
                        new PurchasesResponseListener() {
                            public void onQueryPurchasesResponse(BillingResult billingResult, List<Purchase> purchases) {
                                // check billingResult
                                // process returned purchase list, e.g. display the plans user owns
                                if(billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
                                    for (Purchase purchase : purchases) {
                                        handlePurchase(purchase);
                                        Log.d(TAG, "purchases succeed");
                                        Log.d(TAG, purchase.toString());
                                    }
                                }

                            }
                        }
                );

            }

            @Override
            public void onBillingConnectionFailed() {

            }
        };

        startConnection((startConnectionListener));

    }

}