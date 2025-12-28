# Google Play Store Yayınlama Rehberi

## ChampionChess Manager - Android Uygulaması

### ✅ Tamamlanan Adımlar

1. ✅ Capacitor kurulumu tamamlandı
2. ✅ Android platformu eklendi
3. ✅ AdMob reklam entegrasyonu yapıldı
4. ✅ Web build hazırlandı
5. ✅ Android projesi senkronize edildi

---

## 📱 APK/AAB Oluşturma (Build)

### Gereksinimler
- Android Studio (son sürüm)
- Java JDK 17 veya üzeri

### Adımlar

#### 1. Android Studio'yu Açın
```bash
npx cap open android
```

#### 2. Build Variant Seçin
- Android Studio'da: **Build** > **Select Build Variant**
- **release** seçeneğini seçin

#### 3. Signing Key Oluşturun (İlk Defa İseniz)
- **Build** > **Generate Signed Bundle / APK**
- **Android App Bundle** (AAB) seçin
- **Create new...** ile yeni keystore oluşturun
- Keystore bilgilerini güvenli bir yere kaydedin!
  - Key store path
  - Password
  - Key alias
  - Key password

#### 4. AAB Oluşturun
- **Build** > **Generate Signed Bundle / APK**
- **Android App Bundle** seçin
- Keystore bilgilerinizi girin
- **release** build variant'ı seçin
- **Create** butonuna tıklayın

AAB dosyası şurada oluşacak:
```
android/app/release/app-release.aab
```

---

## 🎯 AdMob Yapılandırması

### Test AdMob ID'leri Aktif

Şu anda uygulamada **test AdMob ID'leri** kullanılıyor:
- App ID: `ca-app-pub-3940256099942544~3347511713`
- Banner ID: `ca-app-pub-3940256099942544/6300978111`
- Interstitial ID: `ca-app-pub-3940256099942544/1033173712`

### Gerçek AdMob ID'lerinizi Kullanmak İçin

1. **AdMob Hesabı Oluşturun**: [admob.google.com](https://admob.google.com)

2. **Uygulama Ekleyin**:
   - "Apps" bölümüne gidin
   - "Add app" butonuna tıklayın
   - Platform: Android
   - App name: ChampionChess Manager
   - Package name: com.championchess.manager

3. **Ad Units Oluşturun**:
   - Banner ad unit oluşturun
   - Interstitial ad unit oluşturun
   - Her birinin ID'sini kaydedin

4. **ID'leri Güncelleyin**:

**AndroidManifest.xml** dosyasında (`android/app/src/main/AndroidManifest.xml`):
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="BURAYA_SIZIN_APP_ID"/>
```

**src/utils/admob.ts** dosyasında:
```typescript
// Banner Ad ID'yi değiştirin
adId: 'BURAYA_BANNER_AD_UNIT_ID'

// Interstitial Ad ID'yi değiştirin
adId: 'BURAYA_INTERSTITIAL_AD_UNIT_ID'
```

5. **Rebuild Yapın**:
```bash
npm run build
npx cap sync android
```

---

## 🚀 Google Play Console'a Yükleme

### 1. Play Console'a Giriş Yapın
[play.google.com/console](https://play.google.com/console)

### 2. Yeni Uygulama Oluşturun
- "Create app" butonuna tıklayın
- App name: **ChampionChess Manager**
- Default language: **Turkish**
- App or game: **Game**
- Free or paid: **Free**

### 3. Store Listing (Mağaza Kaydı)

#### App Details
- **App name**: ChampionChess Manager
- **Short description** (80 karakter):
```
Türkiye Süper Ligi'nde takımınızı şampiyonluğa taşıyın! Satranç ve zar tabanlı maç sistemi.
```

- **Full description** (4000 karakter):
```
🏆 ChampionChess Manager - Türkiye Süper Ligi Menajerlik Oyunu

Türkiye'nin en büyük futbol takımlarından birini seçin ve şampiyonluğa giden yolda rakiplerinizi alt edin!

🎮 OYUN ÖZELLİKLERİ:

⚽ Gerçek Türk Süper Ligi takımları
♟️ Benzersiz satranç tabanlı maç sistemi
🎲 Stratejik zar mekaniği ile heyecanlı maçlar
📊 Detaylı lig tablosu ve istatistikler
🏅 34 haftalık sezon mücadelesi
📱 Kolay ve akıcı arayüz

🎯 NASIL OYNANIR:

1. Favori takımınızı seçin
2. Her hafta maçları oynayın
3. Satranç hamleleri ile rakibinizi mat edin
4. Güç seviyeniz zar atışlarını etkiler
5. Sezon sonunda şampiyonluğu kazanın!

⭐ NEDEN CHAMPİONCHESS MANAGER?

- Futbol ve satranç birleşimi
- Strateji ve şans dengesi
- Offline oynanabilir
- Süper Lig atmosferi
- Ücretsiz ve reklamsız deneyim

Takımınızı seçin, rakiplerinizi yenin ve Türkiye Şampiyonu olun!

#FutbolMenajerlik #Satranç #TürkiyeSüperLigi #StratejikOyun
```

#### Graphics
Google Play Store için gereken görseller:

1. **App Icon** (512x512 PNG):
   - Satranç şahı + futbol topu kombinasyonu
   - Mavi-beyaz renk temaları

2. **Feature Graphic** (1024x500 PNG):
   - "ChampionChess Manager" logosu
   - Arka planda satranç tahtası ve futbol teması

3. **Screenshots** (En az 2, maksimum 8):
   - Takım seçim ekranı
   - Lig tablosu
   - Satranç maç ekranı
   - Sezon özeti

*Not: Görselleri hazırlamak için Canva, Figma veya Adobe Express kullanabilirsiniz.*

#### Categorization
- **App category**: Games > Sports
- **Tags**: Football, Chess, Manager, Strategy, Turkey Super League

### 4. Content Rating
- "Start questionnaire" butonuna tıklayın
- Sorulara uygun cevaplar verin
- Rating'i kaydedin

### 5. App Content
- **Privacy Policy**: Gerekmez (reklam ve veri toplama yok)
- **Ads**: "Yes, my app contains ads" seçin (AdMob kullandığınız için)
- **Target age**: Everyone

### 6. Release
#### Production Track
1. "Create release" butonuna tıklayın
2. AAB dosyanızı yükleyin (`app-release.aab`)
3. Release notes ekleyin:
```
İlk sürüm (v1.0):
- Türkiye Süper Ligi takımları
- Satranç tabanlı maç sistemi
- 34 haftalık sezon modu
- Detaylı lig tablosu
```
4. "Review release" ve "Start rollout to production"

---

## 📋 Kontrol Listesi

### Yayınlamadan Önce
- [ ] AdMob gerçek ID'leri güncellendi
- [ ] AAB başarıyla oluşturuldu
- [ ] App icon ve feature graphic hazır
- [ ] Screenshots hazır
- [ ] Store listing metinleri hazır
- [ ] Content rating tamamlandı
- [ ] Privacy policy (gerekirse)

### Yayınladıktan Sonra
- [ ] AdMob'da app-ads.txt dosyasını ekleyin
- [ ] Play Console'da ilk kullanıcı geri bildirimlerini takip edin
- [ ] Crash raporlarını kontrol edin
- [ ] Rating ve yorumları yanıtlayın

---

## 🛠️ Güncellemeler İçin

### Kod Değişikliği Sonrası:
```bash
# 1. Web build
npm run build

# 2. Android sync
npx cap sync android

# 3. Android Studio'da build
# Version Code'u artırın (build.gradle'da)
# Yeni AAB oluşturun
```

### Version Güncelleme:
`android/app/build.gradle` dosyasında:
```gradle
versionCode 2  // Her yayında 1 artırın
versionName "1.1"  // Semantik versiyon
```

---

## 📞 Destek

Sorun yaşarsanız:
1. Capacitor dökümantasyonu: [capacitorjs.com/docs](https://capacitorjs.com/docs)
2. AdMob dökümantasyonu: [developers.google.com/admob](https://developers.google.com/admob)
3. Play Console yardım: [support.google.com/googleplay](https://support.google.com/googleplay)

---

## ⚠️ Önemli Notlar

1. **Keystore Dosyanızı Saklamayı Unutmayın!**
   - Kaybederseniz uygulama güncelleyemezsiniz
   - Güvenli bir yedekleme yapın

2. **Test Edin!**
   - Internal test track kullanarak önce test edin
   - Tüm özellikleri kontrol edin

3. **Play Store Politikalarına Uyun**
   - Telif hakkı ihlali yapmayın
   - Takım logoları için gerekirse izin alın

4. **AdMob Politikaları**
   - Sahte tıklama yapmayın
   - Reklam yerleşimlerini uygun tutun

---

🎉 **Başarılar! ChampionChess Manager'ı dünyaya sunmaya hazırsınız!**
