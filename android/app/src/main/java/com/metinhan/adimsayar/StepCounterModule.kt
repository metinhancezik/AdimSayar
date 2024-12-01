package com.metinhan.adimsayar

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class StepCounterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "StepCounterModule"

    @ReactMethod
    fun updateWidget(steps: Int, calories: Double) {
        try {
            StepCounterWidget.updateWidgetData(reactApplicationContext, steps, calories)
            sendEvent("onWidgetUpdate", Arguments.createMap().apply {
                putInt("steps", steps)
                putDouble("calories", calories)
            })
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        try {
            reactApplicationContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Gerekli React Native event listener metodları
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Gerekli React Native event listener metodları
    }
}