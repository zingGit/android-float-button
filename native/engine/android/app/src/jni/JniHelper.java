package jni;

import static android.content.Context.TELEPHONY_SERVICE;

import android.Manifest;
import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Message;
import android.os.ParcelUuid;
import android.preference.PreferenceManager;
import android.provider.MediaStore;
import android.provider.Settings;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONException;
import com.alibaba.fastjson2.JSONObject;
import com.cocos.game.AppActivity;
import com.cocos.lib.CocosHelper;
import com.cocos.lib.CocosJavascriptJavaBridge;
import com.cocos.service.SDKWrapper;
import com.google.android.gms.ads.identifier.AdvertisingIdClient;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.starstar.game.R;
import com.tbruyelle.rxpermissions2.RxPermissions;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Executors;

import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;
import jni.facebook.FacebookHelper;
import jni.google.GooglePlayHelper;
import jni.ifs.PermissionsRespones;
import jni.permission.PermissionsHelper;

public class JniHelper {
    public static AppActivity mMainActivity = null;
    public static GooglePlayHelper mGooglePlayHelper = null;
    public static FacebookHelper mFacebookHelper = null;
    public static String TAG = "jniHelper";
    public static String mClipText = "";
    public static String mDeviceUniqueId = "";
    public static String mBundleVersion = "";
    public static String mBundleId = "";
    public static String mAppsFlyerId = "";
    public static String mGoogleAdId = "";
    public static String mFromType = "";
    public static int mBundleCode = 0;
    public static ImageView mSplashView = null;

    public JniHelper(AppActivity main) {
        mMainActivity = main;
        mGooglePlayHelper = new GooglePlayHelper(main);
        mFacebookHelper = new FacebookHelper(mMainActivity);
        mMainActivity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        showSplashView();
        initGoogleAd();
        initBundleInfo();

    }

    public FacebookHelper getFacebookHelper() {
        return mFacebookHelper;
    }
    public void onResume() {
        //提取订阅
        mGooglePlayHelper.queryPurchasesAsync();
    }

    /**
     * @method 初始化静态数据
     */
    public static void initBundleInfo() {
        mBundleId = mMainActivity.getPackageName();
        PackageManager pm = mMainActivity.getPackageManager();
        try {
            PackageInfo pi = pm.getPackageInfo(mBundleId, 0);
            mBundleVersion = pi.versionName;
            mBundleCode = pi.versionCode;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }

    }

    public static String getBundleVersion() {
        return mBundleVersion;
    }
    /**
     * @method 设置横屏
     */
    public static void setHorizontalScreen() {
        if (mMainActivity.getRequestedOrientation() != ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE) {
            mMainActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        }
    }

    /**
     * @method 设置为竖屏
     */
    public static void setVerticalScreen() {
        if (mMainActivity.getRequestedOrientation() != ActivityInfo.SCREEN_ORIENTATION_PORTRAIT) {
            mMainActivity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }
    }

    /**
     * @method 设置剪贴板
     * @param text
     */
    public static void setClipText(final String text) {
        Message message = new Message();
        message.obj = text;
        ClipboardManager cm = (ClipboardManager) mMainActivity.getSystemService(Context.CLIPBOARD_SERVICE);
        cm.setPrimaryClip(ClipData.newPlainText(null, (String) message.obj));
    }

    /**
     * @method 清理剪贴板
     */
    public static void setClipNull() {
        ClipboardManager cm = (ClipboardManager) mMainActivity.getSystemService(Context.CLIPBOARD_SERVICE);
        cm.setPrimaryClip(null);
    }

    /**
     * @method APP启动时加载场景 会有一段黑屏时间，添加一个过渡遮罩
     */
    public static void showSplashView() {
        mSplashView = new ImageView(mMainActivity);
        mSplashView.setImageResource(R.drawable.splash_slogan_view);
        mSplashView.setScaleType(ImageView.ScaleType.FIT_XY);
        mMainActivity.addContentView(mSplashView, new WindowManager.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
    }

    /**
     * @method 场景初始化完成后移除遮罩
     */
    public static void removeSplashView() {
        mMainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (mSplashView != null) {
                    mSplashView.setVisibility(View.GONE);
                }
            }
        });
    }

    /**
     * @method 是否debug模式
     * @return
     */
    private static boolean isDebug() {
        try {
            ApplicationInfo info = mMainActivity.getApplicationInfo();
            return  (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * @method 通过包名拉起其他app
     * @param packName
     */
    public static void openAppForPackage( final String packName) {
        //check app
        if( isAvilible(packName) ) {
            Intent intent = mMainActivity.getPackageManager().getLaunchIntentForPackage(packName);
            mMainActivity.startActivity(intent);
            return;
        }
        Log.d(TAG, "not installed "+ packName);
    }

    //bInstalled from packName
    public static boolean isAvilible( final String packName )
    {
        final PackageManager packageManager = mMainActivity.getPackageManager();
        // check installed app information
        List<PackageInfo> pinfo = packageManager.getInstalledPackages(0);
        for ( int i = 0; i < pinfo.size(); i++ )
        {
            if(pinfo.get(i).packageName.equalsIgnoreCase(packName))
                return true;
        }
        return false;
    }

    /**
     * @method 获取google id
     */
    private void initGoogleAd() {
        mGoogleAdId = PreferenceManager.getDefaultSharedPreferences(mMainActivity.getApplicationContext()).getString("google-id", "");

        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    AdvertisingIdClient.Info idInfo = AdvertisingIdClient.getAdvertisingIdInfo(SDKWrapper.shared().getActivity());
                    mGoogleAdId = idInfo.getId();
                    Log.d(TAG, "google ad id: " + mGoogleAdId);

                    SharedPreferences.Editor editor = PreferenceManager.getDefaultSharedPreferences(mMainActivity.getApplicationContext()).edit();
                    editor.putString("google-id", mGoogleAdId);
                    editor.apply();
                } catch (IOException | GooglePlayServicesNotAvailableException | GooglePlayServicesRepairableException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    /**
     *
     * @return
     */
    private static String customIMEI() {
        return "35" +
                Build.BOARD.length() % 10 + Build.BRAND.length() % 10 +
                Build.SUPPORTED_ABIS.length % 10 + Build.DEVICE.length() % 10 +
                Build.DISPLAY.length() % 10 + Build.HOST.length() % 10 +
                Build.ID.length() % 10 + Build.MANUFACTURER.length() % 10 +
                Build.MODEL.length() % 10 + Build.PRODUCT.length() % 10 +
                Build.TAGS.length() % 10 + Build.TYPE.length() % 10 +
                Build.USER.length() % 10; //13 digits
    }

    /**
     *
     * @return
     */
    @SuppressLint("HardwareIds")
    public static String getDeviceInfo() {
        final JSONObject info = new JSONObject();
        try {
            info.put("brand", Build.BRAND);
            info.put("model", Build.MODEL);
            info.put("version", Build.VERSION.INCREMENTAL);
            info.put("manufacturer", Build.MANUFACTURER);
            info.put("sdk", Build.VERSION.SDK_INT);
            info.put("bundleId", mBundleId);
            info.put("bundleVersion", mBundleVersion);
            info.put("bundleCode", mBundleCode);
            info.put("appsFlyerId", mAppsFlyerId);
            info.put("googleAdId", mGoogleAdId);
            info.put("customIMEI", customIMEI());
            info.put("androidId", Settings.Secure.getString(mMainActivity.getContentResolver(), Settings.Secure.ANDROID_ID));
            info.put("fromType", mFromType);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        Log.d(TAG, "device info: " + info.toString());
        return info.toString();
    }

    /**
     * @method 系统文字分享
     * */
    public static void osShareText(String text) {
        Log.d("share:", text);
        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_SEND);
        intent.putExtra(Intent.EXTRA_TEXT, text);
        intent.setType("text/plain");
//        intent.setPackage("com.msthl.first");
        mMainActivity.startActivity(intent);

    }

    /**
     * @method 系统图片分享
     * @param path 图片路径
     */
    public static void osShareImage(String path) {
        Log.d(TAG, "osShareImage:" + path);
        try {
            //读取app可写路径图片数据
            FileInputStream fis = new FileInputStream(path);
            Bitmap bitmap  = BitmapFactory.decodeStream(fis);
            Intent intent = new Intent();
            intent.setAction(Intent.ACTION_SEND);
            Uri uri = Uri.parse(MediaStore.Images.Media.insertImage(mMainActivity.getContentResolver(), bitmap, "IMG" + Calendar.getInstance().getTime(), null));
            intent.setType("image/*");
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            mMainActivity.startActivity(Intent.createChooser(intent, "title"));

        } catch (FileNotFoundException e) {
            Log.d(TAG, "osShareImage failed");
            e.printStackTrace();
        }

    }

    /**
     * @method 获取国家代码
     * @return
     */
    public static String getCountryCode() {
        Locale locale = mMainActivity.getResources().getConfiguration().locale;
        //获取系统语言
        String language = locale.getLanguage(); //zh
        String local = Locale.getDefault().toString();//zh_CN_#Hans
        //获取国家代码
        String country = mMainActivity.getResources().getConfiguration().locale.getCountry();//CN
        Log.d("getCountryCode:", country);
        return country;
    }

    /**
     * @method 获取剪贴板
     */
    public static String getClipText() {
        ClipboardManager cmb = (ClipboardManager) mMainActivity.getSystemService(Context.CLIPBOARD_SERVICE);
        if (cmb.hasPrimaryClip()) {
            mClipText = (String) cmb.getPrimaryClip().getItemAt(0).getText();
            Log.d(TAG, "text:" + mClipText);
        }
        return mClipText;
    }

    /**
     * @method 获取商品详情
     * @param strProductIds
     */
    public static void getProductDetails(String strProductIds) {
        Log.d(TAG, strProductIds);
        if(strProductIds.equals("")) {
            return;
        }
        String productType = "inapp";
        List<String> productIds = JSON.parseArray(strProductIds, String.class);
        mGooglePlayHelper.queryProductDetailsAsync(productType, productIds);
    }

    /**
     * @method 拉取支付面板
     * @param data
     */
    public static void launchBillingFlow(String data) {
        Log.d(TAG, "launch");
        mGooglePlayHelper.launchBillingFlow();
    }

    /**
     * @method se call facebook login
     */
    public static void facebookLogin() {
        try {
            FacebookHelper.metaLogin();
        }
        catch ( Exception e) {
            Log.d(TAG, "call facebook login eror");
            Log.d(TAG, e.toString());
        }
    }
    /**
     * 回调jsengine 参数为普通字符串
     * @param eventId
     * @param data
     */
    public static void sendToSe(String eventId, String data) {
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                String call = "window.onNativeEvent" + "(\"" + eventId + "\","+ "\"" + data + "\");";
                CocosJavascriptJavaBridge.evalString(call);
            }
        });
    }

    /**
     * 回调jsengine 参数为base64（为了方便传递多参数，在js层JSON.parse反序列化
     * @param eventId
     * @param object
     */
    public static void sendToSeInBase64(String eventId, Object object) {
        String base64 = objectToBase64(object);
        if(base64 == null) return;
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                String call = "window.onNativeEventInBase64" + "(\"" + eventId + "\","+ "\"" + base64 + "\");";
                CocosJavascriptJavaBridge.evalString(call);
            }
        });

    }

    /**
     * 对象转JSON
     * @param object
     * @return
     */
    @TargetApi(Build.VERSION_CODES.O)
    public static String objectToBase64(Object object) {
        try {
            String jsonString = JSON.toJSONString(object);
            String base64 = Base64.getEncoder().encodeToString(jsonString.getBytes("utf-8"));
            return base64;
        }
        catch (UnsupportedEncodingException e) {
            return null;
        }

    }

    public static void onSeEvent() {
    }


}
