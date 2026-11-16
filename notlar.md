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
- Grundriss ayrı bir dosyada: `grundriss.js`. `zeichneSchnitt()` artık ölçeği (abb) döndürüyor, Grundriss aynı ölçeği ve x eksenini kullanıyor. Böylece plan kesitin tam altında duruyor (izdüşüm). *(Kabul edildi.)*
- Basamak numaraları Steigungen'i sayıyor (1 … n). Son numara üst döşeme kenarının arkasında duruyor. *(Kabul edildi.)*
- Kesme çizgisi (Schnittlinie), üst yüzü 100 cm'e ilk ulaşan basamakta duruyor. Çift eğik çizgi olarak çiziliyor. Çizginin üstündeki kenarlar ve Lauflinie kesikli. Merdiven 1 m'den alçaksa kesme çizgisi yok. 100 cm bir çizim kuralı, norm değeri değil. Kaynak muhtemelen DIN 1356-1, doğrulanmadı (kodda TODO). *(Kabul edildi.)*
- Planda şimdilik sadece merdiven çiziliyor. Duvarlar ve Treppenloch, alan girişi adımında eklenecek. *(Kabul edildi.)*
- Laufbreite varsayılanı bina türünün minimumu. Kullanıcı değeri elle değiştirdiyse, bina türü değişince değer korunuyor. *(Kabul edildi.)*
- Laufbreite girişi 30–400 cm ile sınırlı. Bu bir makullük sınırı, norm değeri değil.
- Genel sonuç metni ikiye ayrıldı: Basamaklar uygun ama genişlik küçükse, ayrı bir mesaj gösteriliyor („Die nutzbare Laufbreite unterschreitet …“).
- Çizimler büyütüldü: Sayfa 44rem → 64rem genişliğinde, yazılar 11 → 13 px (basamak numaraları 12 px). Kenar boşlukları küçüldü, görünen döşeme parçası (DECKENUEBERSTAND) 100 → 60 cm oldu. *(Kabul edildi.)*
- Minimum ölçek: Plan bandı en az 90 px yüksek, bir basamak en az 28 px geniş. Bu, kesit ve plan için ortak ölçek. Kesitin yükseklik sınırı (560 px) minimum ölçeğin önüne geçmiyor. İlk değer (120 px / 30 px) laptopta 300 cm'de bile kaydırma gerektiriyordu, küçültüldü. Artık 250–350 cm arası ~950 px'lik kutuya sığıyor. *(Nutzer: laptopta normal katlarda kaydırma olmasın.)*
- **Rundungsfehler durch Handrechnung entdeckt.** Elle hesaplayınca iki hata çıktı:
  - a yuvarlanmış s ile hesaplanıyordu: 300 cm'de 63 − 2 × 16,7 = 29,6. Doğrusu 63 − 2 × 16,667 = 29,67.
  - Lauflänge yuvarlanmış a ile hesaplanıyordu: 17 × 29,7 = 504,9. Doğrusu 17 × 29,667 = 504,3.

  Karar: Tüm hesaplar (s, a, 2s + a, Lauflänge, çizimler) ve Normprüfung artık tam değerle yapılıyor. Sadece gösterimde yuvarlanıyor. *(Benim kararım.)*
- Normprüfung tam değerle yapılıyor: s = 19,04 cm, „Gebäude im Allgemeinen“ (≤ 19 cm) için „nicht erfüllt“. Sınırı aşan bir varyant puanlamada ceza alıyor, bu yüzden bir basamak daha ekleniyor. Gleitkomma için 1e-9 cm tolerans var (`RECHENTOLERANZ`). *(Benim kararım.)*
- Prüfung tablosunda değerler en fazla 2 ondalıkla gösteriliyor (ör. 19,04 cm, 29,67 cm). 1 ondalıkla 19,04 „19,0 cm ✗“ olarak görünürdü, bu kafa karıştırırdı. Üstteki değer tablosu ve çizimler 1 ondalık gösteriyor.
- Test: 50–600 cm arası 0,1 cm adımlarla tarandı. Eski kod da hiçbir zaman sınırı tam değerle aşan bir s seçmemişti, çünkü puanlama 17 cm'e yakın s'yi tercih ediyor. Yani yeni kontrol daha çok bir güvenlik ağı. Bazı yüksekliklerde, iki uygun çözüm arasındaki seçim değişti (konfor puanı artık tam değerle hesaplanıyor).
- Plandaki kesme çizgisi, kesme düzlemini (100 cm) kesen rıhtın (Setzstufe) üzerinden geçiyor, basamağın ortasından değil. Bu hem geometrik olarak daha doğru, hem de çizgi iki numaranın arasında kalıyor ve numaraların üstünden geçmiyor.
- Genişlik yetmezse, kesit ve plan tek bir kaydırma alanında (`.zeichnungen`) birlikte yatay kayıyor. Böylece hizalı kalıyorlar. Başlıklar ve açıklama yazıları `position: sticky` ile yerinde kalıyor. Bunun için `container-type` / `cqw` kullanılıyor. *(Telefonda yatay kaydırma kabul edildi.)*
- Ölçek, kaydırma alanının görünen genişliğinden hesaplanıyor, `figure`'un genişliğinden değil. Çünkü `figure` çizimle birlikte büyüyor; aksi halde çizim pencere küçülünce bir daha küçülmezdi.
- Plandaki genişlik ölçüsünde sadece sayı yazıyor (kesitteki Geschosshöhe gibi). „Laufbreite 80,0“ dar merdivenlerde ölçü çizgisine sığmıyordu.
