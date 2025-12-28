# Google Play Store'a Yükleme Rehberi

## Adım 1: Projeyi Yerel Makinenize İndirin

Tüm proje dosyalarını yerel bilgisayarınıza indirin.

## Adım 2: Android Studio Kurulumu

1. [Android Studio](https://developer.android.com/studio)'yu indirip kurun
2. İlk açılışta gerekli SDK bileşenlerinin yüklenmesine izin verin

## Adım 3: Projeyi Android Studio'da Açın

1. Android Studio'yu açın
2. "Open an Existing Project" seçin
3. Proje klasöründeki `android` klasörünü seçin
4. Gradle sync'in tamamlanmasını bekleyin

## Adım 4: Signing Key Oluşturma

Google Play Store'a yüklemek için uygulamanızı imzalamanız gerekir:

1. Android Studio'da: `Build` > `Generate Signed Bundle / APK`
2. `Android App Bundle` seçin
3. `Create new...` butonuna tıklayın
4. Aşağıdaki bilgileri doldurun:
   - Key store path: Güvenli bir yere kaydedin (örn: `champion-chess-keystore.jks`)
   - Password: Güçlü bir şifre
   - Alias: `champion-chess`
   - Password: Güçlü bir şifre (alias için)
   - Validity: 25 yıl veya daha fazla
   - First and Last Name: Adınız
   - Organizational Unit: Şirket/Birim adı (opsiyonel)
   - Organization: Şirket adı (opsiyonel)
   - City or Locality: Şehir
   - State or Province: İl/Eyalet
   - Country Code: TR

**ÖNEMLİ:** Bu keystore dosyasını ve şifrelerini güvenli bir yerde saklayın! Kaybederseniz uygulamanızı güncelleyemezsiniz.

## Adım 5: Release Build Oluşturma

1. `Build` > `Generate Signed Bundle / APK`
2. `Android App Bundle` seçin
3. Oluşturduğunuz keystore'u seçin
4. Şifreleri girin
5. Build variant olarak `release` seçin
6. `Finish` butonuna tıklayın

AAB dosyası şu konumda oluşacak:
`android/app/release/app-release.aab`

## Adım 6: Google Play Console Ayarları

1. [Google Play Console](https://play.google.com/console)'a gidin (Developer hesabı gerekir - $25 tek seferlik ücret)
2. "Create app" butonuna tıklayın
3. Uygulama bilgilerini doldurun:
   - App name: **Champion Chess Manager**
   - Default language: Turkish
   - App or game: Game
   - Free or paid: Free

## Adım 7: Uygulama Detaylarını Doldurun

### Store Listing
- Short description (80 karakter max): Futbol yöneticisi oyununun satranç versiyonu
- Full description (4000 karakter max): Detaylı açıklama
- App icon: 512x512 PNG (şeffaf arka plan yok)
- Feature graphic: 1024x500 PNG
- Screenshots: En az 2 tane (telefon için)
- App category: Sports Games
- Content rating: ESRB E (Everyone)

### AdMob Bilgileri
Uygulamada reklam var, bu yüzden:
- AdMob App ID: `ca-app-pub-3940256099942544~3347511713` (Test ID - gerçek ID ile değiştirin)

## Adım 8: AAB Dosyasını Yükleyin

1. Sol menüden "Production" > "Create new release"
2. "Upload" butonuna tıklayın
3. `app-release.aab` dosyasını yükleyin
4. Release notes ekleyin (Türkçe):
   ```
   İlk sürüm:
   - 20 takımla süper lig
   - Her takım farklı güç seviyesinde
   - Satranç maçları ile müsabakalar
   - Dice modu (hızlı sonuç)
   - Sezon yönetimi
   - Reklam entegrasyonu
   ```

## Adım 9: İçerik Derecelendirmesi

1. "Content rating" bölümüne gidin
2. Anketi doldurun (oyun şiddetsiz, reklam içeriyor)
3. Derecelendirmeyi alın

## Adım 10: Target Audience & Content

1. Yaş grubu: 13 ve üzeri
2. App access: Tüm özellikler ücretsiz
3. Ads: Evet, reklam içerir
4. Data safety: Kişisel veri toplamıyoruz (AdMob hariç)

## Adım 11: Gözden Geçirme ve Yayınlama

1. Tüm zorunlu bölümleri doldurun
2. "Send for review" butonuna tıklayın
3. Google'ın incelemesini bekleyin (genellikle 1-3 gün)

## Güvenlik Notları

1. **Keystore'u yedekleyin**: Bu dosya olmadan uygulama güncellemesi yapamazsınız!
2. **Şifreleri unutmayın**: Güvenli bir şifre yöneticisinde saklayın
3. **Test edin**: Yüklemeden önce release sürümünü test cihazda deneyin

## Güncelleme Yapmak İsterseniz

1. `package.json` içindeki `version` numarasını artırın
2. `android/app/build.gradle` içindeki `versionCode` ve `versionName` değerlerini artırın
3. `npm run build` çalıştırın
4. `npx cap sync android` çalıştırın
5. Android Studio'da yeni AAB oluşturun
6. Play Console'da "Production" > "Create new release" ile yeni sürümü yükleyin

---

**Yardıma ihtiyacınız olursa:**
- Android Studio hataları için: Build > Clean Project ve yeniden deneyin
- AdMob sorunları için: Gerçek AdMob hesabı oluşturun ve test ID'leri değiştirin
- Play Console sorunları için: Google Play Developer desteğine başvurun
