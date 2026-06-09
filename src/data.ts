import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // ==================== KEBAPLAR ====================
  {
    id: 'kebap-adana',
    name: 'Adana Kebap',
    description: 'Zırh kıymasının ustaca acılı hali; köz biber ve domatesle.',
    price: 690,
    category: 'kebaplar',
    image: '/images/menu/kebap-adana.jpg',
    isPopular: true,
    isSpicy: true,
    ingredients: ['Zırhla Çekilmiş Kuzu Eti', 'Hakiki Kuzu Kuyruk Yağı', 'Közlenmiş Domates', 'Közlenmiş Biber', 'Sumaklı Piyaz Soğan', 'Tırnak Pide', 'Özel Pul Biber ve Kaya Tuzu'],
    customizable: true,
    allergens: ['glüten']
  },
  {
    id: 'kebap-urfa',
    name: 'Urfa Kebap',
    description: "Adana'nın acısız hali; zırh kıymasının saf ve dengeli tadı.",
    price: 690,
    category: 'kebaplar',
    image: '/images/menu/kebap-urfa.jpg',
    isSpicy: false,
    ingredients: ['Zırhla Çekilmiş Acısız Kuzu Kıyması', 'Kuzu Kuyruk Yağı', 'Tırnak Pide', 'Sumaklı Soğan', 'Közlenmiş Yeşil Biber', 'Közlenmiş Domates', 'Kaya Tuzu'],
    customizable: true,
    allergens: ['glüten']
  },
  {
    id: 'kebap-beyti',
    name: 'Beyti Kebap',
    description: 'Baharatlı zırh kıyması lavaşa sarılı; tereyağlı domates sosu ve süzme yoğurtla.',
    price: 730,
    category: 'kebaplar',
    image: '/images/menu/kebap-beyti.jpg',
    isPopular: true,
    ingredients: ['Zırh Kebap Kıyması', 'Sıcak Tandır Lavaşı', 'Süzme Tava Yoğurdu', 'Köpüklü Tereyağı', 'Sarımsak', 'Özel Domates Sosu', 'Közlenmiş Biber ve Domates'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'kebap-patlican',
    name: 'Patlıcanlı Kebap',
    description: 'Taze patlıcan ve zırh kıyması, şişte mangal lezzetiyle.',
    price: 770,
    category: 'kebaplar',
    image: '/images/menu/kebap-patlican.jpg',
    isSpicy: false,
    ingredients: ['Taze Bostan Patlıcanı', 'Zırh Kıyması Köftesi', 'Tırnak Pide', 'Sumaklı Maydanozlu Piyaz', 'Köz Biber', 'Köz Domates'],
    customizable: false,
    allergens: ['glüten']
  },
  {
    id: 'kebap-copsis',
    name: 'Çöp Şiş',
    description: 'Sütle marine kuzu eti, mangalda nar gibi kızaran yumuşacık lokmalar.',
    price: 830,
    category: 'kebaplar',
    image: '/images/menu/kebap-copsis.jpg',
    isSpicy: false,
    ingredients: ['Marine Edilmiş Kuzu Bonfile', 'Körpe Kuzu Kuyruk Yağı', 'Kekik ve Zeytinyağı Marinası', 'Tırnak Pide', 'Sumaklı Soğan Piyazı', 'Közlenmiş Biber ve Domates'],
    customizable: true,
    allergens: ['glüten']
  },
  {
    id: 'kebap-kuzusis',
    name: 'Kuzu Şiş',
    description: 'Meşe ateşinde kendi yağıyla pişen, sütle terbiyeli yumuşacık kuzu but.',
    price: 830,
    category: 'kebaplar',
    image: '/images/menu/kebap-kuzusis.jpg',
    isPopular: true,
    ingredients: ['Marine Kuzu But Küpleri', 'Süt, Zeytinyağı ve Sarımsak Marinası', 'Tırnak Pide', 'Sumaklı Sarımsaklı Piyaz Soğan', 'Köz Biber', 'Köz Domates'],
    customizable: true,
    allergens: ['glüten']
  },
  {
    id: 'kebap-cigersis',
    name: 'Ciğer Şiş',
    description: 'Kuyruk yağıyla lezzetlenen taze kuzu ciğeri, sumaklı soğan piyazıyla.',
    price: 740,
    category: 'kebaplar',
    image: '/images/menu/kebap-cigersis.jpg',
    ingredients: ['Günlük Taze Kuzu Ciğeri', 'Körpe Kuyruk Yağı', 'Özel Kimyon Aromalı Baharat Karışımı', 'Tırnak Pide', 'Kimyonlu Sumaklı Maydanozlu Soğan Piyazı'],
    customizable: true,
    allergens: ['glüten']
  },
  {
    id: 'kebap-tavuksis',
    name: 'Tavuk Şiş',
    description: 'Marine edilip dinlendirilmiş tavuk göğsü; dışı kızarık, içi sulu.',
    price: 630,
    category: 'kebaplar',
    image: '/images/menu/kebap-tavuksis.jpg',
    ingredients: ['Tavuk Göğsü Küpleri', 'Süt, Yoğurt ve Salça Marinası', 'Tırnak Pide', 'Közlenmiş Yeşil Biber', 'Közlenmiş Domates', 'Sumaklı Soğan'],
    customizable: true,
    allergens: ['glüten']
  },
  {
    id: 'kebap-kanat',
    name: 'Tavuk Kanat',
    description: 'Marine kanatlar; mangalda dışı çıtır, içi sulu, nar gibi kızarmış.',
    price: 650,
    category: 'kebaplar',
    image: '/images/menu/kebap-kanat.jpg',
    ingredients: ['Tavuk Kanat', 'Özel Kanat Sosu Marinası', 'El Yapımı Çıtır Patates Kızartması', 'Tırnak Pide', 'Söğüş Limonlu Maydanoz'],
    customizable: false,
    allergens: ['glüten']
  },
  {
    id: 'kebap-alinazik-kuzu',
    name: 'Ali Nazik Kuzu',
    description: 'Köz patlıcan ve süzme yoğurt üzerinde, tereyağlı lokum kuzu parçaları.',
    price: 870,
    category: 'kebaplar',
    image: '/images/menu/kebap-alinazik-kuzu.jpg',
    isPopular: true,
    ingredients: ['Sote Kuzu Eti parçaları', 'Közlenmiş Bostan Patlıcanı', 'Sarımsaklı Süzme Yoğurt', 'Yemeklik Tereyağı', 'Kırmızı Pul Biber', 'Taze Maydanoz Süsleme'],
    customizable: false,
    allergens: ['süt']
  },
  {
    id: 'kebap-alinazik-dana',
    name: 'Ali Nazik Dana',
    description: 'Közlenmiş patlıcan beğendi üzerinde, ağır ateşte sotelenmiş yumuşacık dana.',
    price: 870,
    category: 'kebaplar',
    image: '/images/menu/kebap-alinazik-dana.jpg',
    ingredients: ['Dana Bonfile Dilimleri', 'Sote Kekik ve Toz Biber', 'Közlenmiş Patlıcanlı Harç', 'Sarımsaklı Süzme Yoğurt', 'Kızdırılmış Tereyağı'],
    customizable: false,
    allergens: ['süt']
  },

  // ==================== DÖNERLER ====================
  {
    id: 'doner-iskender',
    name: 'İskender',
    description: 'Sıcak pide üzerinde yaprak döner, kızgın tereyağı, kıvamlı yoğurt ve domates sosu.',
    price: 720,
    category: 'donerler',
    image: '/images/menu/doner-iskender.jpg',
    isPopular: true,
    ingredients: ['Dana Yaprak Döner', 'Tırnak Pide Dilimleri', 'Sıcak Köpüklü Tereyağı', 'Özel Baharatlı Domates Sosu', 'Kaymaklı Tava Yoğurdu', 'Közlenmiş Biber ve Domates'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'doner-simsek-iskender',
    name: 'Şimşek İskender',
    description: 'Özel sos ve bol tereyağıyla, mekana özel imza İskender tabağı.',
    price: 740,
    category: 'donerler',
    image: '/images/menu/doner-simsek-iskender.jpg',
    ingredients: ['Duble Dana Yaprak Döner', 'Pide Porsiyon', 'Özel İskender Sosu', 'Ekstra Kızgın Köpüklü Tereyağı', 'Tava Yoğurdu'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'doner-kebap',
    name: 'Döner Kebap',
    description: 'Odun ateşinde dönen %100 yaprak et; tırnak pide ve köz sebzeyle.',
    price: 680,
    category: 'donerler',
    image: '/images/menu/doner-kebap.jpg',
    ingredients: ['Ankara Usulü İnce Yaprak Döner', 'El Yapımı Çıtır Patates Kızartması', 'Tırnak Pide Dilimleri', 'Közlenmiş Biber', 'Közlenmiş Domates'],
    customizable: false,
    allergens: ['glüten']
  },
  {
    id: 'doner-durum',
    name: 'Döner Dürüm',
    description: 'İnce taze lavaşa sarılı döner; isteğe göre domates ve soğan piyazıyla.',
    price: 680,
    category: 'donerler',
    image: '/images/menu/doner-durum.jpg',
    ingredients: ['Dana Yaprak Döner', 'Elde Açılmış Sıcak Taş Fırın Lavaşı', 'Tercihe Göre Sumaklı Soğan', 'Domates Dilimi'],
    customizable: true,
    allergens: ['glüten']
  },
  {
    id: 'doner-durum-beyti-kasar',
    name: 'Döner Dürüm Beyti Kaşarlı',
    description: 'Beyti usulü dürüm; sıcacık sos ve uzayan kaşarla.',
    price: 730,
    category: 'donerler',
    image: '/images/menu/doner-durum-beyti-kasar.jpg',
    ingredients: ['Dana Yaprak Döner', 'Yağlı Kaşar Peyniri', 'Sıcak Tandır Lavaşı', 'Tava Yoğurdu', 'Köpüklü Tereyağı', 'Domates Salçalı Sos'],
    customizable: true,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'doner-durum-ssk',
    name: 'Döner Dürüm SSK',
    description: 'Sos, soğan ve eriyen kaşar; bol malzemeli efsane dürüm.',
    price: 690,
    category: 'donerler',
    image: '/images/menu/doner-durum-ssk.jpg',
    isPopular: true,
    ingredients: ['Dana Yaprak Döner', 'Sıcak Tandır Lavaşı', 'Rendelenmiş Yağlı Kaşar Peyniri', 'Sumaklı Piyaz Soğan', 'Özel Salçalı Ankara Aspava Sosu'],
    customizable: true,
    allergens: ['glüten', 'süt']
  },

  // ==================== PİDELER ====================
  {
    id: 'pide-kiymali',
    name: 'Kıymalı Pide',
    description: 'Baharatlı dana kıyma, odun fırınında çıtır çıtır pişen ince hamurun üzerinde.',
    price: 530,
    category: 'pideler',
    image: '/images/menu/pide-kiymali.jpg',
    ingredients: ['Zırhla Çekilmiş Dana Kıyması', 'Kuru Soğan', 'Yeşil Köy Biberi', 'Domates Rendesi', 'Özel Mayalı Çıtır Pide Hamuru', 'Fırından Çıkınca Eritilmiş Trabzon Tereyağı'],
    customizable: false,
    allergens: ['glüten']
  },
  {
    id: 'pide-kasarli',
    name: 'Kaşarlı Pide',
    description: 'Çıtır hamur üzerinde, altın rengini alana dek fırınlanmış bol kaşar.',
    price: 530,
    category: 'pideler',
    image: '/images/menu/pide-kasarli.jpg',
    ingredients: ['Özel Uzayan Yağlı Kaşar Peyniri', 'Trabzon Tereyağı', 'Çıtır Pide Hamuru'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'pide-kusbasili',
    name: 'Kuşbaşılı Pide',
    description: 'Yumuşacık kuşbaşı et ve taze sebze, odun fırınından.',
    price: 580,
    category: 'pideler',
    image: '/images/menu/pide-kusbasili.jpg',
    ingredients: ['Dana Kuşbaşı Eti (Zar kesim)', 'Soyulmuş Küp Domates', 'Yeşil Biber Sotesi', 'Özel Mayalı Çıtır Hamur', 'Trabzon Tereyağı'],
    customizable: false,
    allergens: ['glüten']
  },
  {
    id: 'pide-karisik',
    name: 'Karışık Pide',
    description: 'Kıyma, kuşbaşı, sucuk ve kaşar; hepsi tek çıtır hamurda.',
    price: 590,
    category: 'pideler',
    image: '/images/menu/pide-karisik.jpg',
    isPopular: true,
    ingredients: ['Zar Kesim Kuşbaşı Dana Eti', 'Zırh Kıyması Harci', 'Dilimli Dana Sucuk', 'Yağlı Kaşar Peyniri', 'Fırından Çıkınca Eritilmiş Tereyağı'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'pide-kasarli-sucuklu',
    name: 'Kaşarlı Sucuklu Pide',
    description: 'Baharatlı dana sucuk ve uzayan kaşarın fırın sıcağındaki uyumu.',
    price: 590,
    category: 'pideler',
    image: '/images/menu/pide-kasarli-sucuklu.jpg',
    ingredients: ['Özel Bol Dilimli Dana Sucuk', 'Eriyen Kaşar Peyniri', 'Pide Hamuru', 'Kenar Tereyağı'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'pide-kiyma-kasarli',
    name: 'Kıyma Kaşarlı Pide',
    description: 'Baharatlı kıymanın üzerinde, fırında eriyip uzayan bol kaşar.',
    price: 540,
    category: 'pideler',
    image: '/images/menu/pide-kiyma-kasarli.jpg',
    ingredients: ['Biberli Kıyma Harcı', 'Rendelenmiş Kaşar Peyniri', 'Çıtır Taş Fırın Hamuru', 'Trabzon Tereyağı'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'pide-kusbasi-kasarli',
    name: 'Kuşbaşı Kaşarlı Pide',
    description: 'İri kuşbaşı et ve eriyen kaşar, taş fırında bir arada.',
    price: 590,
    category: 'pideler',
    image: '/images/menu/pide-kusbasi-kasarli.jpg',
    ingredients: ['Dana Kuşbaşı Parçaları', 'Bol Kaşar Peyniri', 'Trabzon Tereyağı', 'Pide Hamuru'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'pide-tavuklu',
    name: 'Tavuklu Pide',
    description: 'Renkli biberlerle sotelenmiş tavuk; hafif ama doyurucu.',
    price: 590,
    category: 'pideler',
    image: '/images/menu/pide-tavuklu.jpg',
    ingredients: ['Sote Tavuk Göğsü', 'Yeşil Köy Biberi', 'Domates', 'Çıtır Pide Hamuru', 'Tereyağı'],
    customizable: false,
    allergens: ['glüten']
  },
  {
    id: 'pide-mantarli',
    name: 'Mantarlı Pide',
    description: 'Taze mantar ve eriyen kaşar; etsiz ama dolu dolu.',
    price: 530,
    category: 'pideler',
    image: '/images/menu/pide-mantarli.jpg',
    ingredients: ['Taze Kültür Mantarı Sote', 'Yeşil Biber', 'Rendelenmiş Kaşar Peyniri', 'Tereyağı', 'Hamur'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'pide-kapali-donerli',
    name: 'Kapalı Dönerli Pide',
    description: 'Bafra usulü kapalı çıtır hamurun içinde, tereyağlı sıcak yaprak döner.',
    price: 650,
    category: 'pideler',
    image: '/images/menu/pide-kapali-donerli.jpg',
    isPopular: true,
    ingredients: ['Dana Yaprak Döner', 'Rendelenmiş Kaşar Peyniri', 'Kapalı Taş Fırın Hamuru', 'Trabzon Tereyağı Sırlaması'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },

  // ==================== KİREMİTLER ====================
  {
    id: 'kiremit-kofte',
    name: 'Kiremitte Köfte',
    description: 'Kendi suyunda pişen köfte; eriyen kaşar ve domates sosuyla cızırdayarak gelir.',
    price: 710,
    category: 'kiremitler',
    image: '/images/menu/kiremit-kofte.jpg',
    ingredients: ['Usta Yapımı Kasap Köftesi', 'Bol Kaşar Peyniri', 'Sıcak Özel Domates Sosu', 'Arpacık Soğan ve Sarımsak', 'Yeşil Köy Biberi', 'Eritilmiş Tereyağı', 'Toprak Güveç Kabı'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },
  {
    id: 'kiremit-tavuk',
    name: 'Kiremitte Tavuk',
    description: 'Yumuşacık tavuk ve mevsim sebzeleri, özel sosuyla kiremitte.',
    price: 670,
    category: 'kiremitler',
    image: '/images/menu/kiremit-tavuk.jpg',
    ingredients: ['Sote Tavuk Göğsü', 'Dilimlenmiş Kültür Mantarı', 'Fırınlanmış Kaşar Peyniri', 'Özel Salçalı Güveç Sosu', 'Köy Biberi', 'Tereyağı'],
    customizable: false,
    allergens: ['süt']
  },
  {
    id: 'kiremit-mantarli-kofte',
    name: 'Kiremitte Mantarlı Köfte',
    description: 'Izgara köftenin sıcağında eriyen kaşar ve taze mantar.',
    price: 710,
    category: 'kiremitler',
    image: '/images/menu/kiremit-mantarli-kofte.jpg',
    ingredients: ['Usta Yapımı Kasap Köftesi', 'Taze Kültür Mantarı Sote', 'Bol Erimiş Kaşar Peyniri', 'Trabzon Tereyağı', 'Özel Domates Sosu', 'Köy Biberi'],
    customizable: false,
    allergens: ['glüten', 'süt']
  },

  // ==================== İÇECEKLER ====================
  {
    id: 'icecek-kola',
    name: 'Kola',
    description: 'Buz gibi serinletici kutu Coca-Cola Original (330ml).',
    price: 90,
    category: 'icecekler',
    image: '/images/menu/icecek-kola.jpg',
    ingredients: ['Kutu Coca-Cola Orijinal', 'İsteğe Bağlı Limon Dilimi ve Kırık Buz'],
    customizable: false
  },
  {
    id: 'icecek-kola-zero',
    name: 'Zero Kola',
    description: 'Sıfır şeker ve sıfır kalori kutu Coca-Cola Zero Sugar (330ml).',
    price: 90,
    category: 'icecekler',
    image: '/images/menu/icecek-kola-zero.jpg',
    ingredients: ['Kutu Coca-Cola Zero Sugar', 'İsteğe Bağlı Kırık Buz'],
    customizable: false
  },
  {
    id: 'icecek-fanta',
    name: 'Fanta',
    description: 'Buz gibi lezzetli kutu Fanta Portakal gazlı içecek (330ml).',
    price: 90,
    category: 'icecekler',
    image: '/images/menu/icecek-fanta.jpg',
    ingredients: ['Kutu Fanta Portakal'],
    customizable: false
  },
  {
    id: 'icecek-sprite',
    name: 'Sprite',
    description: 'Buz gibi yüksek ferahlatıcı mis kokulu gazlı içecek Sprite (330ml).',
    price: 90,
    category: 'icecekler',
    image: '/images/menu/icecek-sprite.jpg',
    ingredients: ['Kutu Sprite'],
    customizable: false
  },
  {
    id: 'icecek-uzay-kola',
    name: 'Uzay Kola',
    description: 'Yerli üretim Uzay Kola; buz gibi servis edilen ekonomik kola keyfi.',
    price: 70,
    category: 'icecekler',
    image: '/images/menu/icecek-uzay-kola.jpg',
    ingredients: ['Uzay Kola'],
    customizable: false
  },
  {
    id: 'icecek-uzay-gazoz',
    name: 'Uzay Gazoz',
    description: 'Yerli üretim Uzay Gazoz; nostaljik ve ferahlatıcı limonlu gazoz.',
    price: 70,
    category: 'icecekler',
    image: '/images/menu/icecek-uzay-gazoz.jpg',
    ingredients: ['Uzay Gazoz'],
    customizable: false
  },
  {
    id: 'icecek-uzay-portakal',
    name: 'Uzay Portakal',
    description: 'Yerli üretim Uzay Portakal; buz gibi tatlı portakal aromalı gazlı içecek.',
    price: 70,
    category: 'icecekler',
    image: '/images/menu/icecek-uzay-portakal.jpg',
    ingredients: ['Uzay Portakal'],
    customizable: false
  },
  {
    id: 'icecek-ayran',
    name: 'Ayran',
    description: 'Katkısız süzme yoğurt, kaya tuzu ve arıtılmış kaynak suyu ile çalkalanan nefis geleneksel yayık köpüklü ayranı.',
    price: 60,
    category: 'icecekler',
    image: '/images/menu/icecek-ayran.jpg',
    isPopular: true,
    ingredients: ['Katkısız Süzme Tava Yoğurdu', 'Kaya Tuzu', 'Soğutulmuş Kaynak Suyu', 'Bol Yayık Köpüğü'],
    customizable: false,
    allergens: ['süt']
  },
  {
    id: 'icecek-fusetea',
    name: 'Fuse Tea',
    description: 'Buzlu çay keyfi; Şeftali veya Limon seçeneği taşıyan serin kutu içecek aroması.',
    price: 90,
    category: 'icecekler',
    image: '/images/menu/icecek-fusetea.jpg',
    ingredients: ['Kutu Fuse Tea (Şeftali veya Limon Seçeneği)'],
    customizable: false
  },
  {
    id: 'icecek-cappy',
    name: 'Cappy Meyve Suyu',
    description: 'Doğal meyve püreleriyle zenginleşen kutu Cappy (Meyve Şöleni/Şeftali/Vişne seçeneği ile).',
    price: 90,
    category: 'icecekler',
    image: '/images/menu/icecek-cappy.jpg',
    ingredients: ['Kutu Cappy Meyve Suyu'],
    customizable: false
  },
  {
    id: 'icecek-sira',
    name: 'Şıra',
    description: 'Özellikle yaprak döner ve kebapların yanında içimi muhteşem giden mor üzümden elde edilmiş fermente geleneksel Türk içeceği.',
    price: 80,
    category: 'icecekler',
    image: '/images/menu/icecek-sira.jpg',
    ingredients: ['Siyah ve Mor Kuru Üzüm Özü', 'Soğutulmuş Saf Suyu', 'Doğal Fermantasyon Mayası'],
    customizable: false
  },
  {
    id: 'icecek-salgam',
    name: 'Şalgam',
    description: 'Doğal mor havuç ve şalgam turpu fermantasyonuyla elde edilen hakiki buz gibi tatlı acısız şalgam suyu.',
    price: 80,
    category: 'icecekler',
    image: '/images/menu/icecek-salgam.jpg',
    ingredients: ['Çukurova Mor Havucu', 'Şalgam Turpu', 'Bulgur Unlu Geleneksel Maya', 'Kaya Tuzu', 'Acısız Tatlı Su'],
    customizable: false
  },
  {
    id: 'icecek-salgam-acili',
    name: 'Acılı Şalgam',
    description: 'Doğal fermente edilmiş, üzerine usta yapımı acı süs biberi suyu ilave edilmiş tam acılı geleneksel şalgam suyu.',
    price: 80,
    category: 'icecekler',
    image: '/images/menu/icecek-salgam-acili.jpg',
    ingredients: ['Mor Havuç', 'Acılı Süs Biberi Suyu', 'Bulgur Unlu Maya', 'Tuz'],
    customizable: false
  },
  {
    id: 'icecek-limonata',
    name: 'Limonata(hazır)',
    description: 'Taze sıkılmış limon suları ve taze limon kabuğu esanslarıyla hazırlanan, ferahlatıcı naneli soğuk lezzet.',
    price: 80,
    category: 'icecekler',
    image: '/images/menu/icecek-limonata.jpg',
    ingredients: ['Sıkılmış Çatalca Limonları', 'Limon Kabuğu Kabartması', 'Taze Nane Yaprakları', 'Şeker Şurubu', 'Kırık Buz'],
    customizable: false
  },
  {
    id: 'icecek-soda',
    name: 'Sade Soda',
    description: 'Buz gibi soğuk, yüksek mineralli Beypazarı doğal maden suyu (200ml).',
    price: 50,
    category: 'icecekler',
    image: '/images/menu/icecek-soda.jpg',
    ingredients: ['Beypazarı Doğal Maden Suyu'],
    customizable: false
  },
  {
    id: 'icecek-soda-meyveli',
    name: 'Meyveli Soda',
    description: 'Doğal Beypazarı maden suyunun leziz meyve aromalarıyla buluştuğu gazlı içecek (Limon / Çilek / Elma seçenekleriyle).',
    price: 50,
    category: 'icecekler',
    image: '/images/menu/icecek-soda-meyveli.jpg',
    ingredients: ['Beypazarı Doğal Maden Suyu', 'Doğal Meyve Esansları (Tercihe Göre)'],
    customizable: false
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: 'Sparkles' },
  { id: 'kebaplar', name: 'Kebaplar', icon: 'Flame' },
  { id: 'donerler', name: 'Dönerler', icon: 'Flame' },
  { id: 'pideler', name: 'Pideler', icon: 'Pizza' },
  { id: 'kiremitler', name: 'Kiremitler', icon: 'Flame' },
  { id: 'icecekler', name: 'İçecekler', icon: 'GlassWater' }
];
