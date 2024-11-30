package com.metinhan.adimsayar

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class StepCounterModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext),
    SensorEventListener {

    private var sensorManager: SensorManager? = null
    private var stepSensor: Sensor? = null
    private var stepCount: Int = 0
    private var calories: Double = 0.0

    init {
        sensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
    }

    override fun getName() = "StepCounterModule"

    @ReactMethod
    fun startStepCounter() {
        stepSensor?.let {
            sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }
    }

    @ReactMethod
    fun stopStepCounter() {
        sensorManager?.unregisterListener(this)
    }

    @ReactMethod
    fun updateWidget(steps: Int, calories: Double) {
        val context = reactApplicationContext
        this.stepCount = steps
        this.calories = calories
        StepCounterWidget.updateWidgetData(context, steps, calories)
        // Widget güncellemesinden sonra event gönder
        sendStepCountUpdate()
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            if (it.sensor.type == Sensor.TYPE_STEP_COUNTER) {
                stepCount = it.values[0].toInt()
                // Kalori hesaplaması (basit bir örnek)
                calories = stepCount * 0.04 // Her adım için ortalama 0.04 kalori
                
                // Widget'ı güncelle
                updateWidget(stepCount, calories)
                
                // React Native tarafına event gönder
                sendStepCountUpdate()
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // Sensör hassasiyeti değişikliklerini burada işleyebilirsiniz
    }

    private fun sendStepCountUpdate() {
        val data = Arguments.createMap().apply {
            putInt("steps", stepCount)
            putDouble("calories", calories)
        }
        
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("onStepCountUpdate", data)
    }

    @ReactMethod
    fun getStepCount(promise: Promise) {
        val data = Arguments.createMap().apply {
            putInt("steps", stepCount)
            putDouble("calories", calories)
        }
        promise.resolve(data)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Gerekli için boş implementasyon
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Gerekli için boş implementasyon
    }
}