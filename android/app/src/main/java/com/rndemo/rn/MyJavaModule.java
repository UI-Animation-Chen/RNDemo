package com.rndemo.rn;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.rndemo.rn.JsFunction;

import javax.annotation.Nonnull;

public class MyRNModule extends ReactContextBaseJavaModule {

    public MyRNModule(ReactApplicationContext context) {
        super(context);
    }

    @Nonnull
    @Override
    public String getName() {
        return "MyRNModule";
    }

    @ReactMethod
    public void callNative() {
        getReactApplicationContext().getCatalystInstance().getJSModule(JsFunction.class).jsFunc();
    }

}
