package com.rndemo.rn.modules;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import javax.annotation.Nonnull;

public class MyJavaModule extends ReactContextBaseJavaModule {

    public MyJavaModule(ReactApplicationContext context) {
        super(context);
    }

    @Nonnull
    @Override
    public String getName() {
        return "MyJavaModule";
    }

    @ReactMethod
    public void callJavaMethod() {
        Log.d("--==--", "callJavaMethod and in turn call js func");
        getReactApplicationContext().getCatalystInstance().getJSModule(MyJsModule.class).myJsMethod();
    }

}
