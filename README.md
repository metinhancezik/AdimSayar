# Adım Sayar 👣

Adım sayar, günlük aktivitelerinizi takip etmenizi sağlayan bir mobil uygulamadır. Telefonunuzun hareket sensörlerini kullanarak adımlarınızı sayar ve yakılan kalorileri hesaplar.

## Özellikler

- 📱 Gerçek zamanlı adım sayımı
- 🔥 Kalori takibi
- 📊 Hareket sensör verileri
- 💾 Günlük verileri otomatik kaydetme
- 🔄 Günlük sıfırlama

## Başlangıç

1. Gereksinimleri yükleyin:
   ```bash
   npm install
   ```

2. Uygulamayı başlatın:
   ```bash
   npx expo start
   ```

## Test Etme

Uygulamayı test etmek için:

1. Expo Go ile test:
   - Telefonunuza Expo Go uygulamasını yükleyin
   - QR kodu okutun
   - Aynı WiFi ağında olduğunuzdan emin olun

2. APK ile test:
   ```bash
   npx eas build -p android --profile preview
   ```

## Teknik Detaylar

- React Native & Expo ile geliştirildi
- TypeScript kullanıldı
- Expo Sensors API kullanıldı
- AsyncStorage ile veri saklama

## Geliştirme

Projeyi geliştirmek için:

1. Repo'yu klonlayın
2. Bağımlılıkları yükleyin
3. `src` klasöründeki dosyaları düzenleyin

