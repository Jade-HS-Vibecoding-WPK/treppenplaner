# Notlar

## En iyi prompt

## Takıldığım yerler

## Benim kararlarım

- Sadece HTML, CSS ve JavaScript; kurulum yok, GitHub Pages'te çalışacak.
- Uygulama dili Almanca, benimle iletişim Türkçe.
- DIN 18065 değerleri tek bir yerde, kaynaklarıyla birlikte tutulacak.
- Norm değerleri DIN 18065:2020-08, Tabelle 1'den alındı. Kaynak: „zitiert nach WEKA-Fachportal, Original nicht eingesehen“.
- Arayüzde normun kendi terimleri kullanılıyor: „Wohngebäude mit bis zu zwei Wohnungen / innerhalb von Wohnungen“ ve „Gebäude im Allgemeinen“. İkiden fazla daireli binalar için bir not gösteriliyor.
- Şimdilik sadece DIN 18065 esas alınıyor. Eyalet yönetmeliği için sayfanın altında uyarı var.
- Kesitte Höhenkoten (üçgen sembol, „± 0,00“ / „+ 2,75“) gösteriliyor.
- Laufplatte çiziliyor, kalınlığı 18 cm varsayıldı. Kesilen döşeme ve plak ince tarama (Schraffur) ile gösteriliyor.
- **İleride:** Uzun kollarda ara sahanlık (Podest) kontrolü. Örneğin 600 cm'de tek kolda 35 rıht çıkıyor. L/U merdivenler adımında uygulamaya eklenecek, şimdilik uygulamada değişiklik yok.
  - **Doğrulandı (sekundär):** Kaynak: Baunetz Wissen (DIN 18065'e atıfla), Original nicht eingesehen.
    - Notwendige Treppen'de en geç 18 Steigung'dan sonra bir Podest gerekir. Wohngebäude mit bis zu zwei Wohnungen bunun dışında.
    - Bir Treppenlauf en az 3 Stufe'den oluşur.
    - Podest uzunluğu en az nutzbare Laufbreite kadar olmalı.

## Yapay zekânın kararları

- CLAUDE.md Almanca yazıldı (proje dili Almanca); Türkçe iletişim kuralı içinde açıkça belirtildi.
- Dosyalar ayrıldı: `norm.js` (değerler), `berechnung.js` (hesap), `app.js` (arayüz). Script'ler klasik `<script>` olarak yükleniyor (ES module değil), böylece sayfa çift tıklayınca da açılıyor.
- Basamak sayısı seçimi: Normu ihlal etmeyen çözümler arasında 2s + a değeri 63 cm'e ve rıht yüksekliği 17 cm'e en yakın olan seçiliyor. Bunlar norm değeri değil, yaygın kurallar (17/29 merdiven). Rıht hedefi olmadan kod hep en dik çözümü (ör. 20/23) seçiyordu.
- Basamak derinliği 63 − 2s ile hesaplanıyor ve normun sınırları içine çekiliyor.
- Uygun çözüm yoksa en yakın çözüm gösteriliyor ve uymayan değerler kırmızı işaretleniyor.
- Kat yüksekliği girişi 50–600 cm ile sınırlı. Bu bir makullük sınırı, norm değeri değil.
- Kesit çizimi ayrı bir dosyada: `zeichnung.js`, kütüphane kullanmadan saf SVG. Geometri santimetre olarak hesaplanıyor. Ölçek sayfa genişliğinden otomatik çıkıyor, pencere boyutu değişince çizim yeniden yapılıyor. Böylece çizgi kalınlıkları ve yazı boyutu her ekranda aynı kalıyor.
- Çizimde rıht yüksekliğinin tam değeri (H / n) kullanılıyor, yazılarda yuvarlanmış değer görünüyor. Böylece son basamak üst döşemeye tam oturuyor.
- Döşeme kalınlığı çizim için 20 cm varsayıldı. Bu bir norm değeri değil, çizimin altında not olarak yazıyor. *(Kabul edildi.)*
- s ve a ölçüleri en üst basamakta yazılıyor, çünkü orada yazılar için yer var. Alt basamakta „± 0,00“ kotuyla çakışıyorlardı.
- İki kot da sağ kenarda, alt alta duruyor. Dar ekranda sol kenarda yer kalmıyordu. *(Kabul edildi, okunurluk için.)*
- Ölçü çizgilerinde ok yerine 45° eğik çizgi (Schrägstrich) kullanılıyor.
