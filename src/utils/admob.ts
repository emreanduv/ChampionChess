import { Capacitor } from '@capacitor/core';

const isNativePlatform = Capacitor.isNativePlatform();

export const initializeAdMob = async () => {
  if (!isNativePlatform) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: false,
    });
  } catch (error) {
    console.error('AdMob initialization error:', error);
  }
};

export const showBannerAd = async () => {
  if (!isNativePlatform) return;

  try {
    const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
    await AdMob.showBanner({
      adId: 'ca-app-pub-3940256099942544/6300978111',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.TOP_CENTER,
      margin: 0,
      isTesting: false,
    });
  } catch (error) {
    console.error('Banner ad error:', error);
  }
};

export const hideBannerAd = async () => {
  if (!isNativePlatform) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.hideBanner();
  } catch (error) {
    console.error('Hide banner error:', error);
  }
};

export const showInterstitialAd = async () => {
  if (!isNativePlatform) return;

  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.prepareInterstitial({
      adId: 'ca-app-pub-3940256099942544/1033173712',
      isTesting: false,
    });
    await AdMob.showInterstitial();
  } catch (error) {
    console.error('Interstitial ad error:', error);
  }
};
