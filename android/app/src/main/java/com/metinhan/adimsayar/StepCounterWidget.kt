package com.metinhan.adimsayar

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.content.ComponentName
import org.json.JSONObject

class StepCounterWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        try {
            val sharedPrefs = context.getSharedPreferences("dailyData", Context.MODE_PRIVATE)
            val dailyData = sharedPrefs.getString("dailyData", null)
            
            val views = RemoteViews(context.packageName, R.layout.step_counter_widget)
            
            if (dailyData != null) {
                val data = JSONObject(dailyData)
                val steps = data.optInt("steps", 0)
                val calories = data.optDouble("calories", 0.0)
                
                views.setTextViewText(R.id.steps_text, "$steps adım")
                views.setTextViewText(R.id.calories_text, "${calories.toInt()} kcal")
            } else {
                views.setTextViewText(R.id.steps_text, "0 adım")
                views.setTextViewText(R.id.calories_text, "0 kcal")
            }
            
            appWidgetManager.updateAppWidget(appWidgetId, views)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {
        fun updateWidgetData(context: Context, steps: Int, calories: Double) {
            try {
                val data = JSONObject().apply {
                    put("steps", steps)
                    put("calories", calories)
                }

                context.getSharedPreferences("dailyData", Context.MODE_PRIVATE)
                    .edit()
                    .putString("dailyData", data.toString())
                    .apply()

                val appWidgetManager = AppWidgetManager.getInstance(context)
                val thisWidget = ComponentName(context, StepCounterWidget::class.java)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)

                for (appWidgetId in appWidgetIds) {
                    updateAppWidget(context, appWidgetManager, appWidgetId)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        private fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val widget = StepCounterWidget()
            widget.updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
}