# Notlar

## En iyi prompt

## Takıldığım yerler

## Benim kararlarım

- Beim Öffnen wird sofort mit den Standardwerten gerechnet, damit man die Zeichnung als Erstes sieht (UX-Regel: Was sieht man zuerst?).
- Keine externe API nötig (Rücksprache mit Lehrenden, 17.11.). Datenquelle: DIN 18065 mit Quellenangabe.
- **Gestaltung (17.11., UI-Design dersi):** Dersten iki kural: bir stil seç, en az bir bilinçli tasarım kararını CLAUDE.md'ye yaz.
  - Stil-Prompt: „Swiss-inspiriert: strenges Raster, linksbündig, große Überschrift, viel Weißraum. Nur Schwarz, Weiß und ein Signalrot. Keine Schatten, keine runden Ecken. Schrift: Bitter für Überschriften, Nunito für Text.“
  - Font kurs şablonundan: başlıklar Bitter Bold, metin Nunito Regular/Bold. Böylece araç ve poster bir bütün oluyor. Dosyalar `fonts/` klasöründe, yerelden yükleniyor (SIL Open Font License, `OFL-Bitter.txt`, `OFL-Nunito.txt`). Çizimlerdeki ölçü yazıları sade teknik bir fontta kalıyor.
  - Kırmızı her zaman „sorun“ demek: sinyal kırmızısı sadece hatalar, sağlanmayan kontroller ve eksik ölçüler için. „Erfüllt“ yeşil değil **siyah** (✓). Gerekçe: kırmızı = sorun kuralı tek bir karşıtlıkla okunuyor ve kırmızı-yeşil renk körlüğünde de anlaşılıyor.
  - Laptopta solda giriş, sağda sonuç ve çizimler, böylece çizim hemen görünüyor. Sağdaki sıra (A): sonuç kutusu → değer şeridi → çizimler → Normprüfung → export. Telefonda alt alta. Yazdırmada tek sütun, Normprüfung 1. sayfada, çizimler 2. sayfada.
  - Tek ana buton „Berechnen“; export butonları daha sade.
- Sadece HTML, CSS ve JavaScript; kurulum yok, GitHub Pages'te çalışacak.
- Uygulama dili Almanca, benimle iletişim Türkçe.
- DIN 18065 değerleri tek bir yerde, kaynaklarıyla birlikte tutulacak.
- Norm değerleri DIN 18065:2020-08, Tabelle 1'den alındı. Kaynak: „zitiert nach WEKA-Fachportal, Original nicht eingesehen“.
- Arayüzde normun kendi terimleri kullanılıyor: „Wohngebäude mit bis zu zwei Wohnungen / innerhalb von Wohnungen“ ve „Gebäude im Allgemeinen“. İkiden fazla daireli binalar için bir not gösteriliyor.
- Şimdilik sadece DIN 18065 esas alınıyor. Eyalet yönetmeliği için sayfanın altında uyarı var.
- Kesitte Höhenkoten (üçgen sembol, „± 0,00“ / „+ 2,75“) gösteriliyor.
- Laufplatte çiziliyor, kalınlığı 18 cm varsayıldı. Kesilen döşeme ve plak ince tarama (Schraffur) ile gösteriliyor.
- Uzun kollarda ara sahanlık (Podest) kontrolü. Örneğin 600 cm'de tek kolda 35 rıht çıkıyor. **18.11.'de uygulamaya eklendi** (`norm.js`, `treppenformen.js`).
  - **Doğrulandı (sekundär):** Kaynak: Baunetz Wissen (DIN 18065'e atıfla), Original nicht eingesehen.
    - Notwendige Treppen'de en geç 18 Steigung'dan sonra bir Podest gerekir. Wohngebäude mit bis zu zwei Wohnungen bunun dışında.
    - Bir Treppenlauf en az 3 Stufe'den oluşur.
    - Podest uzunluğu en az nutzbare Laufbreite kadar olmalı.
- Raumeingabe: verfügbare Länge (Laufrichtung) ve Breite isteğe bağlı. Merdiven alanın sol alt köşesinde, duvara dayalı. Gereken genişlik = nutzbare Laufbreite („vereinfacht“). Sığma kontrolü bir Normprüfung değil: tabloda „Raumvorgabe“ etiketiyle ayrı bir satır ve ayrı bir sonuç metni var. Taşan kısım taralı, eksik ölçü kırmızı.
- `pruefeRaum` genel bir fonksiyon: sadece düz merdiveni değil, her dikdörtgen Footprint'i (Länge × Breite) kontrol ediyor. L/U merdivenlerde de kullanılacak.
- **Antritts- und Austrittsfläche (Recherche 16.11., sekundär):**
  - DIN 18065'te merdiven başı/sonu için genel bir minimum serbest alan **bulunamadı**. Bulunan sayılar (1,00–1,20 m) sadece forumlardan geliyor ve kaynakları yok, bu yüzden kullanılmadı. Uygulamada şimdilik bu alan yok; tablonun altında „ohne Antritts- und Austrittsfläche“ notu var.
  - Kapı kuralı **DIN 18065'te değil, MBO'da**: „Eine Treppe darf nicht unmittelbar hinter einer Tür beginnen, die in Richtung der Treppe aufschlägt; zwischen Treppe und Tür ist ein ausreichender Treppenabsatz anzuordnen.“ Kaynak: MBO 2002, **§ 34 Abs. 7** (umwelt-online.de, Archivfassung, Stand 16.06.2018). Yapay zekâ önce § 35 demişti, bu yanlıştı. Güncel MBO'daki numara **nicht verifiziert**.
  - MBO sadece „ausreichend“ diyor, **sayısal bir derinlik vermiyor**. „Absatz en az kapı genişliği kadar derin olmalı“ ifadesi hiçbir kaynakta bulunamadı: **nicht verifiziert**, kullanılmadı.
  - Baunetz Wissen („Treppen und Treppenräume“) bu konuda bir şey söylemiyor.
- **Mehrsprachigkeit (16.11., hocanın isteği):** Deutsch, Englisch, Französisch; varsayılan Almanca.
  - Semboller her dilde **s** ve **a**, formül de **2s + a**. Terimin yanında sembol duruyor: „Rise s“, „Hauteur de marche s“.
  - Birim her dilde **cm**.
  - Sayı biçimi dile göre: `de-DE` / `fr-FR` → 17,5 · `en-GB` → 17.5. Hesap her zaman tam değerle.
  - Normun adı (DIN 18065) her dilde aynı; EN/FR'de bunun bir Alman normu olduğu yazıyor. EN/FR'de „Übersetzung zur Orientierung, maßgebend ist der deutsche Normtext“ notu var.
  - Terimler aşağıdaki tabloda („Fachbegriffe DE / EN / FR“).
- **Export (16.11., hocanın isteği):**
  - DXF: kesit ve plan **ayrı dosyalar** (Revit/ArchiCAD'da plan ve kesit farklı görünümlere yerleştiriliyor).
  - Açıklama ölçeği **1:50** (yazı kâğıtta 2,5 mm).
  - PDF şimdilik sayfaya sığdırılmış, ölçeksiz („ohne Maßstab“). Ölçekli baskı (A4 yatay 1:50) PLAN.md'de Could.
  - `$INSUNITS` R12 dosyasına **yazılmıyor**: R12'ye ait değil, bazı programlarda içe aktarma hatası verebilir. Yerine butonların yanında „DXF: Einheit mm, Maßstab 1:1“ notu var. **README'ye de yazılacak:** içe aktarırken birim olarak mm seçilmeli.
  - Codepage ANSI_1252.
  - **TODO:** Umlaute (ä, ö, ü, ß, é) ve ± işaretini Revit/ArchiCAD'da kontrol et. Sorun olursa ± için AutoCAD kontrol kodu `%%p` denenebilir.
  - Python/ezdxf kurulmadı; gerçek test üniversitede ArchiCAD/Revit ile.
  - **DXF in AutoCAD 2027 erfolgreich getestet (Layer, Maße, Texte korrekt).** Kullanıcı testi, 16.11.: kesit ve plan açılıyor; yazılar, çizimler, katmanlar, ölçüler, tarama, kotlar, kesikli çizgiler ve „±“ doğru. ArchiCAD/Revit testi hâlâ açık.
  - PDF: kesit ve plan her zaman 2. sayfada başlıyor (`break-before: page`), başlık çizimden ayrılmıyor (`break-after: avoid`). 1. sayfa sonuçlar ve tablolar, 2. sayfa çizimler. Footer yazdırırken 1. sayfaya, Normprüfung'ün altına taşınıyor (`beforeprint`/`afterprint`, ekranda yeri değişmiyor); 600 cm, alan 600 × 600'de footer tek başına 3. sayfaya düşüyordu. *(Benim kararım.)*

- **L-/U-Treppe ve Variantenvergleich (18.11.):**
  - Sadece Podest'li çözümler, gewendelte Stufen yok. L: iki kol + Viertelpodest, sola ve sağa dönüş. U: iki paralel kol + Halbpodest.
  - „Ein Lauf mindestens 3 Stufen“ **3 Steigung** olarak sayılıyor (`TODO: Quelle prüfen`).
  - 18-Steigungen-Regel sadece „Gebäude im Allgemeinen“de; Wohngebäude bunun dışında.
  - Treppenauge (U) **10 cm – Annahme, kein Normwert.**
  - Ausschluss puanlamadan önce: alana sığmıyor (`pruefeRaum`) veya norm sağlanmıyor (18-Steigungen-Regel dahil) → ausgeschlossen.
  - Ağırlıklar (benim): Komfort 40 %, Platzbedarf 30 %, Sicherheit 20 %, Nutzung 10 %. Kodda tek bir yerde (`js/bewertung.js`, norm değeri değil).
    - Komfort = (Kₛ + Kₐ)/2, Kₛ = 100·(1 − |s − 17|/3), Kₐ = 100·(1 − |a − 29|/6), 0…100 arası.
    - Platz: alanın iki ölçüsü varsa 100·(1 − Footprint ÷ Raumfläche); yoksa göreli: 100·(en küçük Footprint ÷ kendi Footprint).
    - Sicherheit: en uzun koldaki Steigung sayısı m: m ≤ 8 → 100, m ≥ 18 → 0, arası doğrusal (8 benim varsayımım, 18 normdan).
    - Nutzung: Allgemein'de düz kollar +50 (hepsinde var) + Podest +50; Wohngebäude'de hepsi 100.
  - Varyantlar: 3 kart (gerade, L, U); L kartında links/rechts anahtarı, çünkü ikisinin puanı her zaman aynı (ayna görüntüsü, kapı konumu modellenmiyor).
  - Forma göre basamak sayısı: en konforlu Stufung alana sığmazsa, form normdan çıkmadan daha dik bir Stufung deniyor. Böylece Komfort formlar arasında gerçekten farklılaşıyor.
  - Elenen kartlar soluk + kesikli çerçeve (stil kuralı: sadece siyah, beyaz, kırmızı; gri yok), gerekçe kırmızı.
  - Schnitt: L/U'da **Abwicklung entlang der Lauflinie** (benim fikrim). Gerçek kesit (U'da ikinci kol görünüşte) Could.
  - **Not – ağırlıklar tekrar bakılacak:** Düz merdiven Sicherheit'ta düşük puan alıyor (ör. 16 Steigung → 20), Sicherheit ve Nutzung ikisi de Podest'i ödüllendiriyor. Bu bilinçli bir çift sayım, ama öneri sık sık U çıkabilir. Parça C'den sonra farklı senaryolarla birlikte bakacağız, gerekirse ağırlıkları ayarlayacağız.

## Yapay zekânın kararları

- **Treppenformen – teknik (18.11., Parça A):**
  - s ve a forma bağlı değil (`stufenKandidaten()` en iyi Stufung'u veriyor); form sadece kollara bölüyor. Lauf i: nᵢ Steigung, nᵢ − 1 Auftritt; Podest bir Auftritt'in yerine geçiyor.
  - L bölmesi: tüm bölmeler deneniyor (her kol ≥ 3). Sıra: kollar normgerecht → alana sığıyor / en küçük eksik ölçü → en dengeli (tek sayıda uzun kol önce). U her zaman dengeli (en kısa çözüm).
  - Footprint: L = (n₁−1)a + B × B + (n₂−1)a, U = (n₁−1)a + B × 2B + Auge. Viertelpodest B × B, Halbpodest B × (2B + Auge).
  - Planda her kolun kendi koordinat sistemi var (başlangıç noktası, yön, sol normal). Böylece gerade, L ve U aynı kodla çiziliyor. L links: Lauf 1 alt duvarda, Lauf 2 yukarı; L rechts ayna (Lauf 1 üstte, Lauf 2 aşağı). U sola dönüyor.
  - Basamak numaraları bütün kollar boyunca sürüyor. Bir kolun son numarası Podest'te duruyor (o rıht Podest'e çıkıyor). Dikey kollarda numara Lauflinie'nin sağında.
  - Schnittlinie hangi kola denk gelirse orada; ondan sonraki her şey (Podest, ikinci kol) kesikli.
  - Taşma taraması her kol ve Podest dikdörtgeni için ayrı hesaplanıyor (L-şekli dikdörtgen değil).
  - L/U'da plan kesitin altında hizalı değil (Abwicklung'un x ekseni plandaki x değil); aynı ölçek, kendi konumu.
  - Abwicklung'da Podest uzunluğu = Lauflinie'nin Podest üzerindeki uzunluğu: L'de B, U'da 2B + Auge. Podestplatte Laufplatte gibi 18 cm varsayıldı (legend'de yazıyor). Podest'e yükseklik kotu eklendi.
  - Formlar arası seçim şimdilik sonuç alanında geçici bir anahtar („Gerade Treppe | L-Treppe (links | rechts)“), Parça C'de kartlara dönüşecek.
  - Export dosya adı forma göre: `treppe_275_L-links_grundriss.dxf`; düz merdivende eski ad kalıyor.
  - Bu bilgisayarda Node yok: regresyon testi tarayıcı konsolunda. Düz merdivenin eleman listeleri (ekran ve export ölçeği, 6 durum) değişiklikten önce `localStorage`'a kaydedildi, sonra karşılaştırıldı: hepsi aynı; SVG de aynı.
  - Yeni davranış: Gebäude im Allgemeinen'de 19+ Steigung'lu düz merdiven artık „nicht erfüllt“ (örn. 320 cm) ve sonuç metni „Podest nötig“ diyor.

- **U-Treppe ve küçük düzeltmeler (18.11., Parça B):**
  - U'da links/rechts seçimi yok (U her zaman sola dönüyor); ayna görüntüsü Parça C'deki kartlarda da gerekmiyor.
  - U'da çıkış (Austritt) girişle aynı tarafta: son basamak numarası Antritt'in yanında, üst döşemede (x < 0) duruyor. Alan duvarı x = 0'da olduğu için bu numara alan çizgisinin dışında kalıyor – „ohne Antritts-/Austrittsfläche“ basitleştirmesinin bir sonucu.
  - Sayfa alt başlığı forma göre değişiyor (`seite.untertitel`, `…L`, `…U`). DE/EN normun terimlerini kullanıyor (Viertel-/Halbpodest, quarter/half landing); FR'de emin olmadığım için sadece „avec palier“ yazıyor.
  - Kennwerte: sayı ile „cm“ arasında bölünmez boşluk (`NBSP`), Platzbedarf'ta satır sadece „ד'den sonra kırılabiliyor. Laptopta sütunlar değere göre büyüyor (`minmax(8.5rem, auto)`), etiketler (dt) sütun genişliğini belirlemiyor (`width: 0; min-width: 100%`), yoksa uzun FR etiketleri yeri alıyordu. `nowrap` bilerek yok: 1024 px'te değer sütundan taşıyordu.
  - **Eksik ölçülerde tek yuvarlama kuralı: 0,1 cm'e yukarı** (`fehlmassAufgerundet()` in `raum.js`; mesaj, tablo, plan, DXF/SVG aynı fonksiyonu kullanıyor). Hata (kullanıcı, 320 cm, Wohngebäude, B = 100, L rechts, alan 400 × 300): gerçek eksik 5,21 cm, mesaj/tablo „5,3“ (yukarı), planda „5,2“ (en yakına). Gerekçe: güvenli tarafta kalmak – eksik ölçü hiçbir zaman gerçekte olduğundan küçük görünmemeli ve gerçek bir eksik hiçbir zaman „0“ görünmemeli; 0,1 cm fazla göstermenin bedeli yok, az göstermenin bedeli var (planlanan alan yine yetmez). Kayan nokta gürültüsü için tolerans var (5,2000000001 → 5,2, 5,3 değil). Kontrol: 3052 durumda (tüm formlar, iki bina türü, çeşitli alanlar) mesaj, plan ve DXF'teki sayılar aynı. *(Kullanıcının önerisi, yapay zekâ onayladı.)*
  - Yatay kaydırma çubuğunun sebebi alan girişi değil, yuvarlamaydı: `Math.ceil(958,0000001)` = 959 px, kaydırma alanı 958 px. Çözüm: 0,01 px tolerans ve kullanılabilir genişlik aşağı yuvarlanıyor (`clientWidth` 957,6'yı 958'e yuvarlıyordu).

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
- Alan kontrolü ayrı bir dosyada: `js/raum.js`. Fonksiyon sadece sayı döndürüyor (fehlt.laenge / fehlt.breite), metinler `app.js`'de oluşuyor. Eksik ölçü 0,1 cm'e yukarı yuvarlanıyor, böylece gerçek bir eksik hiçbir zaman „0 cm“ olarak görünmüyor.
- Alan merdivenden uzunsa, ortak çizim aralığı (Schnitt + Grundriss) alanın sonuna kadar uzuyor. Böylece plan kesitin altında hizalı kalıyor.
- Planda sadece girilen kenarlar çiziliyor: sadece Länge girilirse iki enine çizgi, sadece Breite girilirse iki boyuna çizgi.
- Ölçü zincirleri: alan uzunluğu Lauflänge'nin altında („Raum 400,0“), alan genişliği sağda. Eksik kısım aynı zincirde kırmızı („fehlt 20,0“).
- Alan girişinin makullük sınırı 50–2000 cm. Bu bir norm değeri değil.
- Plandaki genişlik ölçüsünde sadece sayı yazıyor (kesitteki Geschosshöhe gibi). „Laufbreite 80,0“ dar merdivenlerde ölçü çizgisine sığmıyordu.
- **Mehrsprachigkeit – teknik yapı:**
  - Tüm metinler `js/i18n.js` içindeki tek bir sözlükte (`TEXTE.de/en/fr`). Diğer dosyalar `t("anahtar", {yer tutucular})` çağırıyor. EN/FR'de eksik anahtar varsa Almanca metin gösteriliyor ve konsolda uyarı çıkıyor.
  - `index.html` Almanca metni olduğu gibi tutuyor (`data-i18n` / `data-i18n-aria`). JavaScript çalışmasa da sayfa Almanca okunabiliyor.
  - Hesap dosyaları artık metin değil, anahtar ve sayı döndürüyor (`kriterium: "steigung"`, `grenze: {min, max}`). Metni `app.js` oluşturuyor. `norm.js`'deki `bezeichnung` normun Almanca terimi olarak kaldı, arayüzde kullanılmıyor.
  - „Es fehlen …“ gibi cümleler parça parça değil, dile göre bütün cümle olarak sözlükte duruyor, çünkü dilbilgisi farklı.
  - Dil değişince sayfa yeniden yüklenmiyor. Son sonuç veya son hata mesajı yeni dilde tekrar gösteriliyor, çizimler yeniden çiziliyor.
  - `localStorage` erişimi `try/catch` içinde. Özel pencerede kayıt yapılamazsa dil sadece sayfa yenilenene kadar geçerli.
  - `zahl()` `zeichnung.js`'den `i18n.js`'e taşındı (sayı biçimi dile bağlı).
  - Seçici sağ üstte: `DE | EN | FR`, seçili dil kalın ve altı çizili (`aria-pressed`). Gri, küçük, büyük harf, çizim başlıklarıyla aynı stil.
  - Çizim legendlerindeki 18 cm / 20 cm sözlükte sabit yazıyor, HTML'de de öyleydi. `LAUFPLATTENDICKE`/`DECKENDICKE` değişirse sözlük de güncellenmeli.
  - Hata mesajlarındaki sınırlar (50, 600, 2000) biçimlendirilmeden yazılıyor („2000“, „2,000“ değil).

- **Export – teknik yapı (16.11.):**
  - Çizimler önce bir eleman listesi olarak hesaplanıyor (`js/elemente.js`), SVG ve DXF aynı listeden çıkıyor. Koordinatlar cm, y yukarı, başlangıç = Antritt. Planda merdiven alt duvarda (y = 0 … Laufbreite).
  - Yazı ve ölçü aralıkları px olarak tanımlı, `cmProPx` ile cm'ye çevriliyor. Ekranda `1 / ölçek`, exportta sabit. Ekran görüntüsünün değişmediği 5 durumda piksel karşılaştırmasıyla kontrol edildi.
  - DXF yazı yüksekliği = büyük harf yüksekliği. SVG yazı boyutu ise harf kutusu (em). Oran 0,72 (Helvetica için yaklaşık, tipografik değer). Bu yüzden 13 px yazı → 1:50'de 2,5 mm büyük harf.
  - Kesik çizgi (GESTRICHELT) adı bilerek AutoCAD'ın „DASHED“ adından farklı, `acad.lin` ile çakışmasın diye.
  - Taşan alan taraması (plan) RAUM katmanında, SCHRAFFUR sadece kesilen elemanlar için.
  - Kesit: merdiven ve üst döşeme tek tarama, ama dış çizgi TREPPE ve DECKE olarak ikiye bölünmüş.
  - Grup kodları AutoCAD gibi 3 karaktere sağa hizalı, ondalık sayılar hep noktalı (ör. „0.0“).
  - Dosya adında ondalık nokta yerine tire: 282,5 cm → `treppe_282-5_schnitt.dxf`.
  - SVG export: ekrandaki SVG'nin kopyası, renkler ve yazı tipi doğrudan niteliklerde (sayfanın CSS'i dışarıda yok). SVG'de katman grupları yok.

- **Gestaltung – teknik kararlar (17.11.):**
  - Sinyal kırmızısı `#e2001a`. Gri tonlar kaldırıldı; ipuçları siyah ve küçük (13 px).
  - Tüm aralıklar 0,5 rem'lik bir rasterin katları (`--r`).
  - Değerler tablosu yerine bir „Kennwerte“ şeridi (`<dl>`): küçük etiket, büyük değer.
  - İki sütun 64rem'den itibaren; sol sütun 18rem. 1366 px'te çizim alanı 958 px, 250–350 cm (Laufbreite 80–120) kaydırmasız ölçüldü.
  - Yazdırma sırası JavaScript ile (`beforeprint`/`afterprint`): Normprüfung ve footer çizimlerin önüne alınıyor; ekranda sıra değişmiyor.
  - Plan, sağ kenar: alan genişliği ölçüsü `L + a + 30 px`'te (son basamak numarasının arkasında); „fehlt“ yazısı ölçü çizgilerinden 18 px uzakta.
  - Ölçü yazısı (ör. „Total going 59.3“) yardımcı çizgilerin arasına sığmazsa sadece sayı yazılıyor. Liste DOM bilmediği için genişlik tahmin ediliyor: karakter sayısı × 0,55 × yazı boyutu (Helvetica için yaklaşık değer). DXF'te (1:50) kısa merdivenlerde de bu yüzden sadece sayı çıkabiliyor.

## Fachbegriffe DE / EN / FR

Kaynak: yapay zekânın önerisi, kullanıcı tarafından kontrol edildi ve düzeltildi (16.11.). DIN 18065'in resmi EN/FR çevirisi görülmedi. ⚠ = emin değil.

> **TODO:** Französisch von einer Muttersprachlerin / einem Muttersprachler prüfen lassen.

| Deutsch | English | Français | Not |
|---|---|---|---|
| Geschosshöhe | storey height | hauteur d'étage | |
| Steigung s | rise s | hauteur de marche s | |
| Auftritt a | going a | giron a | |
| Schrittmaß 2s + a | 2R + G rule (2s + a) | formule de Blondel (2s + a) | EN: Approved Document K'daki adı (kullanıcı) |
| Nutzbare Laufbreite | clear width ⚠ | emmarchement (largeur utile) | emmarchement = largeur de la volée (kullanıcı) |
| Lauflinie | walking line | ligne de foulée | |
| Podest | landing | palier (Zwischenpodest: palier de repos) | |
| Lauflänge | total going | reculement | EN: kullanıcı düzeltmesi |
| Treppenlauf | flight | volée | |
| Raumvorgabe | available space ⚠ | espace disponible ⚠ | terim değil, açıklayıcı ifade |
| Höhenkote | level / spot level | cote de niveau | |
| OKFF | FFL (finished floor level) | niveau du sol fini ⚠ | FR kısaltması belirsiz |
| Laufplatte | waist (stair slab) | paillasse | |
| Setzstufe | riser | contremarche | |
| Stufe / Stufennummer | step / step number | marche / numéro de marche | |
| Antritt / Austritt | foot / top of stair | départ / arrivée | |
| Schnitt / Grundriss | section / plan | coupe / vue en plan | |
| Schnittlinie (im Grundriss) | cut line ⚠ | ligne de coupe ⚠ | |
| Deckendicke | slab thickness | épaisseur de dalle | |
| Treppenloch | stairwell opening | trémie | |
| Kopfhöhe | headroom | échappée | |
| Handlauf / Wange | handrail / stringer | main courante / limon | |
| Wohngebäude mit bis zu zwei Wohnungen / innerhalb von Wohnungen | residential buildings with no more than two dwellings / within dwellings ⚠ | bâtiments d'habitation d'au plus deux logements / à l'intérieur des logements ⚠ | kendi çevirimiz |
| Gebäude im Allgemeinen | buildings in general ⚠ | bâtiments en général ⚠ | kendi çevirimiz |
| Notwendige Treppe | required stair ⚠ | escalier nécessaire ⚠ | Alman yönetmelik kavramı |
