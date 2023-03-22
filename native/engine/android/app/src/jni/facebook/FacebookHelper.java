package jni.facebook;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.AccessToken;
import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.FacebookSdk;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.login.LoginBehavior;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;

import org.json.JSONObject;

import java.time.LocalDate;
import java.util.Arrays;

import jni.JniHelper;
import jni.SeEventDef;

public class FacebookHelper {
    public static Activity mMainActivity = null;
    public static AccessToken mAccessToken = null;
    private static CallbackManager callbackManager;
    public static String TAG = "facebookHelper";

    public FacebookHelper(Activity main) {
        mMainActivity = main;
        initSdk();
    }


    private void initSdk() {
        Log.d(TAG, "init sdk");
        FacebookSdk.sdkInitialize(mMainActivity.getApplicationContext());
        AppEventsLogger.activateApp(mMainActivity);
        callbackManager = CallbackManager.Factory.create();
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "判断一下code");
        callbackManager.onActivityResult(requestCode, resultCode, data);
    }

    /**
     * @method 发起登录
     * @throws Exception
     */
    public static void metaLogin() throws Exception {
        Log.d(TAG, "meta login begin");
        if (metaIsLogin()) {
            getLoginInfo(mAccessToken);
            return;
        }

        LoginManager.getInstance().setLoginBehavior(LoginBehavior.NATIVE_WITH_FALLBACK);
        LoginManager.getInstance().logInWithReadPermissions(mMainActivity, Arrays.asList("public_profile", "email"));

        LoginManager.getInstance().registerCallback(callbackManager,
                new FacebookCallback<LoginResult>() {
                    @Override
                    public void onSuccess(LoginResult loginResult) {
                        // App code
                        AccessToken access_token = loginResult.getAccessToken();
                        Log.d(TAG, "succeed");
                        Log.d(TAG, "token: "+ access_token.toString());
                        getLoginInfo(access_token);
                    }

                    @Override
                    public void onCancel() {
                        // App code
                        Log.d(TAG, "cancel");
                    }

                    @Override
                    public void onError(FacebookException exception) {
                        // App code
                        Log.d(TAG, "error");
                    }
                });
    }

    /**
     * @method 获取用户信息
     * @param accessToken
     */
    public static void getLoginInfo(AccessToken accessToken) {

        Log.d(TAG, "token:"+ accessToken.getToken());
        String token = accessToken.getToken();
        JniHelper.sendToSe(SeEventDef.facebookLogin, token);

//        GraphRequest request = GraphRequest.newMeRequest(accessToken, new GraphRequest.GraphJSONObjectCallback() {
//            @Override
//            public void onCompleted(final JSONObject object, GraphResponse response) {
//                if (object != null) {
//                    String id = object.optString("id");   //比如:521390978242842
//                    String name = object.optString("name");  //比如：Fu Bao
//                    String gender = object.optString("gender");  //性别：比如 male （男）  female （女）
//                    String emali = object.optString("email");  //邮箱：比如：bt0951@gmail.com
//                    String birthday = object.optString("birthday");
//
//                    //获取用户头像
//                    JSONObject object_pic = object.optJSONObject("picture");
//                    JSONObject object_data = object_pic.optJSONObject("data");
//                    String photo = object_data.optString("url");
//                    //获取地域信息
//                    String locale = object.optString("locale");   //zh_CN 代表中文简体
//
//                    Log.d(TAG, "get user info succeed!");
//                    Log.d(TAG, "id:" + id);
//                    Log.d(TAG, "name:" + name);
//                    Log.d(TAG, "gender:" + gender);
//                    Log.d(TAG, "emali:" + emali);
//                    Log.d(TAG, "birthday:" + birthday);
//                    Log.d(TAG, "photo:" + photo);
//                    Log.d(TAG, "locale:" + locale);
//
//                    JniHelper.sendToSe(SeEventDef.facebookLogin,id);
//
//                } else {
//                    Log.d(TAG, "get user info failed");
//
//                }
//
//            }
//        });

//        Bundle parameters = new Bundle();
//
//        parameters.putString("fields", "id,name,link,gender,birthday,email,picture,locale");
//        request.setParameters(parameters);
//        request.executeAsync();

    }

    /**
     * @method 是否已经登录且token 在有效期内
     * @return
     */
    public static boolean metaIsLogin() {
        Log.d(TAG,"enter is login");
        AccessToken accessToken = AccessToken.getCurrentAccessToken();
        boolean isLoggedIn = accessToken != null && !accessToken.isExpired();
        if(!isLoggedIn) {
            return false;
        }

        mAccessToken = accessToken;
        Log.d(TAG, "isLogin:" + accessToken.getToken());
        return true;
    }

    /**
     * @method meta 登出
     */
    public static void metaLogout() {
        LoginManager.getInstance().logOut();
    }
}
