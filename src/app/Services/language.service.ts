import { Injectable, signal, computed } from '@angular/core';

export type Language = 'geo' | 'eng' | 'rus';

export interface TranslationItem {
  eng: string;
  rus: string;
}

const TRANSLATION_MAP: Record<string, TranslationItem> = {
  // Hero section
  'აღმოაჩინე': { eng: 'Discover', rus: 'Откройте' },
  'საქართველო': { eng: 'Georgia', rus: 'Грузия' },
  'ადგილობრივი ლოკაციები, ღონისძიებები, გამოცდილებები და ის ადგილები, რომლებიც სხვა პლატფორმებზე თითქმის არ ჩანს.': {
    eng: 'Local spots, events, experiences, and hidden gems rarely found on other platforms.',
    rus: 'Местные локации, события, впечатления и места, которые редкие гости найдут на других платформах.'
  },
  '+ 500': { eng: '+ 500', rus: '+ 500' },
  'ლოკაცია': { eng: 'Locations', rus: 'Локации' },
  '+ 100': { eng: '+ 100', rus: '+ 100' },
  'ღონისძიება': { eng: 'Events', rus: 'Мероприятия' },
  '+ 300': { eng: '+ 300', rus: '+ 300' },
  'ადგილობრივის რჩევა': { eng: 'Local Advice', rus: 'Совет местного' },

  // Quick Filters & UI Controls
  'ადგილის ძებნა': { eng: 'Find Place', rus: 'Поиск мест' },
  'ღონისძიებები': { eng: 'Events', rus: 'Мероприятия' },
  'გამოცდილებები': { eng: 'Experiences', rus: 'Впечатления' },
  'რეკომენდაციები': { eng: 'Recommendations', rus: 'Рекомендации' },
  'ტრადიცია': { eng: 'Traditions', rus: 'Традиции' },
  'ყველა': { eng: 'All', rus: 'Все' },
  'ბუნება': { eng: 'Nature', rus: 'Природа' },
  'დასვენება': { eng: 'Leisure', rus: 'Отдых' },
  'კულტურა': { eng: 'Culture', rus: 'Культура' },
  'კვება': { eng: 'Food', rus: 'Еда' },
  'დამატებითი ფილტრაცია': { eng: 'More Filters', rus: 'Доп. фильтры' },
  'ყველა ბუნება (All Nature)': { eng: 'All Nature', rus: 'Вся природа' },
  'ყველა ბუნება': { eng: 'All Nature', rus: 'Вся природа' },
  'ყველა რეგიონი (All Regions)': { eng: 'All Regions', rus: 'Все регионы' },
  'ყველა რეგიონი': { eng: 'All Regions', rus: 'Все регионы' },
  'ეტლით მისასვლელი': { eng: 'Wheelchair Accessible', rus: 'Доступно для инвалидов' },
  'გასუფთავება': { eng: 'Clear Filters', rus: 'Сбросить фильтры' },
  'დაჯავშნე': { eng: 'Book Now', rus: 'Забронировать' },
  'დაჯავშნა': { eng: 'Book Now', rus: 'Забронировать' },
  'უფასო': { eng: 'Free', rus: 'Бесплатно' },
  'ფასიანი': { eng: 'Paid', rus: 'Платно' },
  'რუკით ძიება': { eng: 'Search on Map', rus: 'Поиск на карте' },
  '🔄 ხედვის გადატვირთვა': { eng: '🔄 Reset View', rus: '🔄 Сбросить вид' },
  'რუკა და მონაცემები იტვირთება...': { eng: 'Map and data loading...', rus: 'Загрузка карты и данных...' },
  'სურათი მიუწვდომელია': { eng: 'Image unavailable', rus: 'Изображение недоступно' },
  'მონაცემები ვერ მოიძებნა': { eng: 'No data found', rus: 'Данные не найдены' },
  'ადგილი': { eng: 'Place', rus: 'Место' },
  'ძებნა...': { eng: 'Search...', rus: 'Поиск...' },
  'ჩანჩქერები, მთები': { eng: 'Waterfalls, mountains', rus: 'Водопады, горы' },
  'ფავორიტები': { eng: 'Favorites', rus: 'Избранное' },
  'ადგილის დამატება': { eng: 'Add Place', rus: 'Добавить место' },
  'შესვლა': { eng: 'Log In', rus: 'Войти' },
  'რეგისტრაცია': { eng: 'Register', rus: 'Регистрация' },
  'გამოსვლა': { eng: 'Log Out', rus: 'Выйти' },

  // Favorites & Booking / Payment
  'ჩემი ფავორიტები': { eng: 'My Favorites', rus: 'Мое избранное' },
  'თქვენს მიერ შენახული ადგილები და ღონისძიებები': { eng: 'Your saved places and events', rus: 'Сохраненные вами места и мероприятия' },
  'სულ: ': { eng: 'Total: ', rus: 'Всего: ' },
  'სულ:': { eng: 'Total:', rus: 'Всего:' },
  'ყველას წაშლა': { eng: 'Clear All', rus: 'Очистить все' },
  'ფავორიტები ცარიელია': { eng: 'No Favorites Yet', rus: 'Избранное пусто' },
  'თქვენ ჯერ არ გაქვთ დამატებული ფავორიტი ადგილები. დააჭირეთ გულის იკონს ბარათებზე მათ შესანახად.': { eng: 'You haven\'t added any favorite places yet. Click the heart icon on any card to save it here.', rus: 'Вы еще не добавили любимые места. Нажмите на иконку сердца на карточках, чтобы сохранить их.' },
  'ადგილების დათვალიერება': { eng: 'Explore Places', rus: 'Просмотр мест' },
  'გადახდა': { eng: 'Payment', rus: 'Оплата' },
  'ბარათის მონაცემები': { eng: 'Card Details', rus: 'Данные карты' },
  'გადახდა შესრულდა წარმატებით': { eng: 'Payment Successful', rus: 'Оплата прошла успешно' },
  'დაბრუნება': { eng: 'Return Home', rus: 'Вернуться' },

  // Card Details
  'ობიექტის შესახებ': { eng: 'About this place', rus: 'Об объекте' },
  'რა არის შესული': { eng: 'What\'s included', rus: 'Что включено' },
  'ტრანსპორტირება': { eng: 'Transportation', rus: 'Трансфер' },
  'დეგუსტაცია': { eng: 'Tasting', rus: 'Дегустация' },
  'ტრადიციული სადილი': { eng: 'Traditional Lunch', rus: 'Традиционный обед' },
  'გიდი': { eng: 'Guide', rus: 'Гид' },
  'ტურის განრიგი': { eng: 'Tour Schedule', rus: 'Расписание тура' },
  'გამგზავრება თბილისიდან': { eng: 'Departure from Tbilisi', rus: 'Выезд из Тбилиси' },
  'შეკრება ვარდების მოედანზე და გამგზავრება კომფორტული მიკროავტობუსით.': { eng: 'Meeting at Rose Square and departure by comfortable minibus.', rus: 'Сбор на площади Роз и выезд на комфортабельном микроавтобусе.' },
  'ღვინის დეგუსტაცია': { eng: 'Wine Tasting', rus: 'Дегустация вин' },
  'ვიზიტი ტრადიციულ მარანში ქვევრის ღვინის დაყენების სადემონსტრაციო ჩვენებით.': { eng: 'Visit to a traditional cellar with a demonstration of Qvevri winemaking.', rus: 'Визит в традиционный марани с демонстрацией изготовления вина в квеври.' },
  'ავთენტური ქართული სუფრა ადგილობრივი ოჯახის მარანში.': { eng: 'Authentic Georgian feast at a local family wine cellar.', rus: 'Аутентичное грузинское застолье в семейном марани.' },
  'ფასი ერთ პერსონაზე': { eng: 'Price per person', rus: 'Цена за человека' },
  'თარიღი': { eng: 'Date', rus: 'Дата' },
  'სტუმრები': { eng: 'Guests', rus: 'Гости' },

  // Add Place Form
  'ახალი ადგილის დამატება': { eng: 'Add New Place', rus: 'Добавить новое место' },
  'გაზიარეთ თქვენი საყვარელი ლოკაცია': { eng: 'Share your favorite location', rus: 'Поделитесь вашей любимой локацией' },
  'ადგილის დასახელება': { eng: 'Place Name', rus: 'Название места' },
  'მაგ: ბირთვისის კანიონი': { eng: 'e.g. Birtvisi Canyon', rus: 'напр. Каньон Биртвиси' },
  'კატეგორია': { eng: 'Category', rus: 'Категория' },
  'აირჩიეთ კატეგორია': { eng: 'Select Category', rus: 'Выберите категорию' },
  'რეგიონი': { eng: 'Region', rus: 'Регион' },
  'აირჩიეთ რეგიონი': { eng: 'Select Region', rus: 'Выберите регион' },
  'აღწერა / ისტორია': { eng: 'Description / History', rus: 'Описание / История' },
  'მოუყევით სხვებს ამ ადგილის შესახებ...': { eng: 'Tell others about this place...', rus: 'Расскажите другим об этом месте...' },
  'ფასის ტიპი': { eng: 'Price Type', rus: 'Тип цены' },
  'ფასი (₾)': { eng: 'Price (GEL)', rus: 'Цена (GEL)' },
  'მაგ: 50': { eng: 'e.g. 50', rus: 'напр. 50' },
  'ფოტოს ატვირთვა': { eng: 'Upload Photo', rus: 'Загрузить фото' },
  'დააჭირეთ ატვირთვისთვის': { eng: 'Click to upload', rus: 'Нажмите для загрузки' },
  'დამატება': { eng: 'Add Place', rus: 'Добавить' },

  // Auth & Account Forms
  'ავტორიზაცია': { eng: 'Log In', rus: 'Авторизация' },
  'ელფოსტა': { eng: 'Email', rus: 'Эл. почта' },
  'პაროლი': { eng: 'Password', rus: 'Пароль' },
  'დაგავიწყდა პაროლი?': { eng: 'Forgot password?', rus: 'Забыли пароль?' },
  'არ გაქვს ანგარიში?': { eng: 'Don\'t have an account?', rus: 'Нет аккаунта?' },
  'შექმენი ანგარიში': { eng: 'Create account', rus: 'Создать аккаунт' },
  'უკვე გაქვს ანგარიში?': { eng: 'Already have an account?', rus: 'Уже есть аккаунт?' },
  'სახელი და გვარი': { eng: 'Full Name', rus: 'Имя и Фамилия' },
  'პაროლის განმეორება': { eng: 'Repeat Password', rus: 'Повторите пароль' },
  'მინიმუმ 6 სიმბოლო': { eng: 'At least 6 characters', rus: 'Минимум 6 символов' },
  'მინიმუმ ერთი ციფრი': { eng: 'At least one number', rus: 'Минимум одна цифра' },
  'პაროლის აღდგენა': { eng: 'Password Recovery', rus: 'Восстановление пароля' },
  'შეიყვანეთ თქვენი ელფოსტა პაროლის აღსადგენად': { eng: 'Enter your email to recover your password', rus: 'Введите ваш email для восстановления пароля' },
  'გაგზავნა': { eng: 'Send Code', rus: 'Отправить' },
  'შეიყვანეთ კოდი': { eng: 'Enter Code', rus: 'Введите код' },
  'ჩვენ გამოგიგზავნეთ 4 ნიშნა კოდი თქვენს ელფოსტაზე': { eng: 'We sent a 4-digit code to your email', rus: 'Мы отправили 4-значный код на вашу почту' },
  'შეიყვანეთ დადასტურების კოდი': { eng: 'Enter verification code', rus: 'Введите код подтверждения' },
  'დადასტურება': { eng: 'Confirm', rus: 'Подтвердить' },
  'კოდის ხელახლა გაგზავნა': { eng: 'Resend Code', rus: 'Отправить код повторно' },
  'ახალი პაროლი': { eng: 'New Password', rus: 'Новый пароль' },
  'შეიყვანეთ თქვენი ახალი პაროლი': { eng: 'Please enter your new password', rus: 'Введите ваш новый пароль' },
  'დაიწყეთ თქვენი მოგზაურობა. აღმოაჩინეთ უნიკალური ადგილები, კულტურა და ტრადიციები.': { eng: 'Start your journey. Discover unique places, culture, and traditions.', rus: 'Начните свое путешествие. Откройте для себя уникальные места, культуру и традиции.' },

  // Footer & General UI
  'პლატფორმის შესახებ': { eng: 'About Platform', rus: 'О платформе' },
  'კონფიდენციალურობა': { eng: 'Privacy Policy', rus: 'Конфиденциальность' },
  'კონტაქტი': { eng: 'Contact Us', rus: 'Контакты' },
  'ციფრული საქართველო - ყველა ადგილი, ერთ სივრცეში': { eng: 'Digital Georgia - All places in one space', rus: 'Цифровая Грузия - все места в одном пространстве' },

  // Select dropdown options
  'ჩანჩქერი': { eng: 'Waterfall', rus: 'Водопад' },
  'კანიონი': { eng: 'Canyon', rus: 'Каньон' },
  'მღვიმე': { eng: 'Cave', rus: 'Пещера' },
  'ტბა': { eng: 'Lake', rus: 'Озеро' },
  'მდინარე': { eng: 'River', rus: 'Река' },
  'მთა': { eng: 'Mountain', rus: 'Гора' },
  'ტყე': { eng: 'Forest', rus: 'Лес' },
  'ეროვნული პარკი': { eng: 'National Park', rus: 'Национальный парк' },
  'დაცული ტერიტორია': { eng: 'Protected Area', rus: 'Охраняемая территория' },
  'ხეობა': { eng: 'Valley', rus: 'Ущелье' },
  'ზღვის სანაპირო': { eng: 'Sea Coast', rus: 'Мორское побережье' },
  'ბუნებრივი წყარო': { eng: 'Natural Spring', rus: 'Родник' },
  'პარკი': { eng: 'Park', rus: 'Парк' },
  'ბიბლიოთეკა': { eng: 'Library', rus: 'Библиотека' },
  'კაფე': { eng: 'Cafe', rus: 'Кафе' },
  'ისტორიული ადგილი': { eng: 'Historical Site', rus: 'Историческое место' },
  'სწრაფი კვება': { eng: 'Fast Food', rus: 'Фастфуд' },
  'ხედი': { eng: 'Scenic View', rus: 'Видовая площадка' },
  'ღირსშესანიშნაობა': { eng: 'Attraction', rus: 'Достопримечательность' },
  'რესტორანი': { eng: 'Restaurant', rus: 'Ресторан' },
  'მუზეუმი': { eng: 'Museum', rus: 'Музей' },
  'არქეოლოგიური ძეგლი': { eng: 'Archaeological Site', rus: 'Археологический памятник' },
  'ზოოპარკი': { eng: 'Zoo', rus: 'Зоопарк' },
  'ველობილიკი': { eng: 'Bike Path', rus: 'Велодорожка' },
  'გალერეა': { eng: 'Gallery', rus: 'Галерея' },

  // Regions
  'აჭარა': { eng: 'Adjara', rus: 'Аджария' },
  'გურია': { eng: 'Guria', rus: 'Гурия' },
  'იმერეთი': { eng: 'Imereti', rus: 'Имерети' },
  'კახეთი': { eng: 'Kakheti', rus: 'Кахетия' },
  'მცხეთა-მთიანეთი': { eng: 'Mtskheta-Mtianeti', rus: 'Мцхета-Мтианети' },
  'რაჭა-ლეჩხუმი და ქვემო სვანეთი': { eng: 'Racha-Lechkhumi & Kvemo Svaneti', rus: 'Рача-Лечхуми и Нижняя Сванетия' },
  'რაჭა-ლეჩხუმი': { eng: 'Racha-Lechkhumi', rus: 'Рача-Лечхуми' },
  'რაჭა': { eng: 'Racha', rus: 'Рача' },
  'სამეგრელო-ზემო სვანეთი': { eng: 'Samegrelo-Zemo Svaneti', rus: 'Самегрело-Верхняя Сванетия' },
  'სამეგრელო': { eng: 'Samegrelo', rus: 'Самегрело' },
  'სვანეთი': { eng: 'Svaneti', rus: 'Сванетия' },
  'სამცხე-ჯავახეთი': { eng: 'Samtskhe-Javakheti', rus: 'Самцхе-Джавахети' },
  'ქვემო ქართლი': { eng: 'Kvemo Kartli', rus: 'Квемо Картли' },
  'შიდა ქართლი': { eng: 'Shida Kartli', rus: 'Шида Картли' },
  'თბილისი': { eng: 'Tbilisi', rus: 'Тбилиси' },
  'აფხაზეთი': { eng: 'Abkhazia', rus: 'Абхазия' },

  // Tags
  'ერთდღიანი': { eng: 'One-day', rus: 'Однодневный' },
  'კლდეები': { eng: 'Rocks', rus: 'Скалы' },
  'ოჯახური': { eng: 'Family', rus: 'Семейный' },
  'პიკნიკი': { eng: 'Picnic', rus: 'Пикник' },
  'სტუდენტური': { eng: 'Student', rus: 'Студенческий' },
  'სამუშაო სივრცე': { eng: 'Work Space', rus: 'Рабочее пространство' },
  'არქიტექტურა': { eng: 'Architecture', rus: 'Архитектура' },
  'XI საუკუნე': { eng: '11th Century', rus: 'XI век' },
  'ლაშქრობა': { eng: 'Hiking', rus: 'Хайкинг' },
  'სპორტი': { eng: 'Sports', rus: 'Спорт' },
  'ქვევრის ღვინო': { eng: 'Qvevri Wine', rus: 'Вино в квеври' },
  'მრავალდღიანი': { eng: 'Multi-day', rus: 'Многодневный' },
  'ველური ბუნება': { eng: 'Wild Nature', rus: 'Дикая природа' },

  // Place Titles
  'ბათუმის სტრიტ-ფუდის კუთხე': { eng: 'Batumi Street Food Corner', rus: 'Уголок стрит-фуда в Батуми' },
  'ბირთვისის კანიონი': { eng: 'Birtvisi Canyon', rus: 'Каньон Биртвиси' },
  'დედაენის ბაღი': { eng: 'Dedaena Park', rus: 'Парк Дедаэна' },
  'ეროვნული ბიბლიოთეკა': { eng: 'National Library', rus: 'Национальная библиотека' },
  'კაფე „ჩაი და ჩურჩხელა“': { eng: 'Cafe "Tea and Churchkhela"', rus: 'Кафе "Чай и Чурчхела"' },
  'ნიკორწმინდის ტაძარი': { eng: 'Nikortsminda Cathedral', rus: 'Собор Никортсминда' },
  'ოკაცეს კანიონი': { eng: 'Okatse Canyon', rus: 'Каньон Окаце' },
  'რიყის ველობილიკი': { eng: 'Rike Bike Path', rus: 'Велодорожка Рике' },
  'საოჯახო მარანი „ხიხანი“': { eng: 'Family Cellar "Khikhani"', rus: 'Семейный марани "Хихани"' },
  'ტობავარჩხილის ტბები': { eng: 'Tobavarchkhili Lakes', rus: 'Озера Тобаварчхили' },
  'ცისფერი ტბა': { eng: 'Blue Lake', rus: 'Голубое озеро' },
  'ქეთევან იაშვილის გალერეა': { eng: 'Ketevan Iashvili Gallery', rus: 'Галерея Кетеван Иашвили' },
  'ნიკოლაძის კოშკი': { eng: 'Nikoladze Tower', rus: 'Башня Николадзе' },
  'ბირთვისის ციხე': { eng: 'Birtvisi Fortress', rus: 'Крепость Биртвиси' },
  'ნიკო ფიროსმანაშვილის სახელმწიფო მუზეუმი': { eng: 'Niko Pirosmanashvili State Museum', rus: 'Государственный музей Нико Пиросманашвили' },
  'გიორგი ლეონიძის სახელობის ქართული ლიტერატურის სახელმწიფო მუზეუმი': { eng: 'Giorgi Leonidze State Museum of Georgian Literature', rus: 'Музей грузинской литературы им. Георгия Леонидзе' },
  'საყდრისი': { eng: 'Sakdrisi', rus: 'Сакдриси' },
  'ელენე ახვლედიანის სახლ-მუზეუმი': { eng: 'Elene Akhvlediani House Museum', rus: 'Дом-музей Елены Ахвледиани' },
  'მამძიშხა': { eng: 'Mamdzishkha Mountain', rus: 'Гора Мамдзышха' },
  'ტბები ქორულდი': { eng: 'Koruldi Lakes', rus: 'Озера Корульди' },
  'არტ-ვილა „გარიყულა“': { eng: 'Art-Villa "Garikula"', rus: 'Арт-вилла "Гарикула"' },
  'ალაზნის ველის გადმოსახედი': { eng: 'Alazani Valley Viewpoint', rus: 'Смотровая площадка Алазанской долины' },
  'ტახტითეფას ტალახის ვულკანები': { eng: 'Takhti-Tepa Mud Volcanoes', rus: 'Грязевые вулканы Тахти-Тепа' },
  'კინჩხას დიდი ჩანჩქერი': { eng: 'Kinchkha Waterfall', rus: 'Водопад Кинчха' },
  'დალიდაღი': { eng: 'Dalidaghi', rus: 'Далидаг' },

  // Descriptions
  'აჭარული ხაჭაპური და კუბდარი ერთ ქუჩაზე.': { eng: 'Adjarian Khachapuri and Kubdari on one street.', rus: 'Аджарский хачапури и кубдари на одной улице.' },
  'კლდოვანი ლაბირინთი თბილისიდან ერთ საათში.': { eng: 'Rocky labyrinth one hour from Tbilisi.', rus: 'Скальный лабиринт в часе езды от Тбилиси.' },
  'მდინარისპირა პარკი სასეირნო ბილიკებითა და ბავშვთა სივრცით.': { eng: 'Riverside park with walking paths and children\'s area.', rus: 'Прибрежный парк с прогулочными дорожками и детской зоной.' },
  'სამკითხველო დარბაზები და ეზო ქალაქის ცენტრში.': { eng: 'Reading halls and courtyard in the city center.', rus: 'Читальные залы и дворик в центре города.' },
  'პატარა კაფე ცენტრალურ ბაზართან, ადგილობრივი დესერტებით.': { eng: 'Small cafe near the central market with local desserts.', rus: 'Небольшое кафе у центрального рынка с местными десертами.' },
  'ქვის რელიეფებით დაფარული ტაძარი რაჭის მთებში.': { eng: 'Cathedral covered in stone reliefs in the mountains of Racha.', rus: 'Собор, украшенный каменными рельефами, в горах Рачи.' },
  'დაკიდული ბილიკი კანიონის თავზე, ჩანჩქერებითა და ტყის ხედებით.': { eng: 'Hanging path over the canyon with waterfalls and forest views.', rus: 'Подвесная тропа над каньоном с водопадами и видами на лес.' },
  'მტკვრის სანაპიროზე გამავალი ველობილიკი.': { eng: 'Bike path along the Mtkvari riverbank.', rus: 'Велодорожка вдоль набережной Куры.' },
  'ოჯახური მარანი, სადაც ღვინოს დეგუსტაციასთან ერთად სუფრასაც გიშლიან.': { eng: 'Family cellar serving wine degustation with home-cooked Georgian meals.', rus: 'Семейный марани, где подают вино с домашним застольем.' },
  'ვერცხლის ტბები 2650 მეტრზე — ტურისტები აქ თითქმის არ დადიან.': { eng: 'Silver lakes at 2650 meters — untouched wilderness.', rus: 'Серебряные озера на высоте 2650 метров.' },
  'მწვერვალი — ქვემო ქართლი.': { eng: 'Peak — Kvemo Kartli.', rus: 'Вершина — Квемо Картли.' },

  // Errors & Notifications
  'მომხმარებელი ამ მონაცემებით ვერ მოიძებნა': { eng: 'User not found with these credentials', rus: 'Пользователь с такими данными не найден' },
  'პაროლი არასწორია': { eng: 'Incorrect password', rus: 'Неверный пароль' },
  'მომხმარებელი ამ ელფოსტით უკვე არსებობს': { eng: 'User with this email already exists', rus: 'Пользователь с таким email уже существует' },
  'გთხოვთ შეავსოთ ყველა ველი': { eng: 'Please fill in all fields', rus: 'Пожалуйста, заполните все поля' },
  'გთხოვთ შეავსოთ ყველა აუცილებელი ველი': { eng: 'Please fill in all required fields', rus: 'Пожалуйста, заполните все обязательные поля' },
  'პაროლები არ ემთხვევა': { eng: 'Passwords do not match', rus: 'Пароли не совпадают' },
  'პაროლი უნდა შეიცავდეს სულ მცირე 6 სიმბოლოს': { eng: 'Password must be at least 6 characters', rus: 'Пароль должен содержать минимум 6 символов' },
  'ავტორიზაციის შეცდომა': { eng: 'Authentication error', rus: 'Ошибка авторизации' },
  'რეგისტრაციის შეცდომა': { eng: 'Registration error', rus: 'Ошибка регистрации' },
  'გთხოვთ მიუთითოთ ადგილის სახელწოდება': { eng: 'Please specify place name', rus: 'Укажите название места' },
  'გთხოვთ აირჩიოთ კატეგორია': { eng: 'Please select a category', rus: 'Выберите категорию' },
  'გთხოვთ აირჩიოთ რეგიონი': { eng: 'Please select a region', rus: 'Выберите регион' },
  'გთხოვთ შეიყვანოთ ადგილის აღწერა / ისტორია': { eng: 'Please enter place description / history', rus: 'Введите описание / историю места' },
  'ადგილი წარმატებით დაემატა!': { eng: 'Place added successfully!', rus: 'Место успешно добавлено!' },
  'ადგილის დამატებისას დაფიქსირდა შეცდომა': { eng: 'An error occurred while adding place', rus: 'Произошла ошибка при добавлении места' },
  'გთხოვთ შეიყვანოთ ელფოსტა': { eng: 'Please enter email', rus: 'Введите email' },
  'კოდი არასწორია': { eng: 'Code is incorrect', rus: 'Неверный код' },
  'პაროლი წარმატებით შეიცვალა': { eng: 'Password changed successfully', rus: 'Пароль успешно изменен' },
  'გთხოვთ აირჩიოთ ვალიდური ფოტოს ფაილი (JPG, PNG)': { eng: 'Please select a valid image file (JPG, PNG)', rus: 'Выберите правильный файл изображения (JPG, PNG)' }
};

const GEO_TO_ENG_CHAR_MAP: Record<string, string> = {
  'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z',
  'თ': 't', 'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o',
  'პ': 'p', 'ჟ': 'zh', 'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'p',
  'ქ': 'k', 'ღ': 'gh', 'ყ': 'k', 'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz',
  'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh', 'ჯ': 'j', 'ჰ': 'h'
};

const GEO_TO_RUS_CHAR_MAP: Record<string, string> = {
  'ა': 'а', 'ბ': 'б', 'გ': 'г', 'დ': 'д', 'ე': 'е', 'ვ': 'в', 'ზ': 'з',
  'თ': 'т', 'ი': 'и', 'კ': 'к', 'ლ': 'л', 'მ': 'м', 'ნ': 'н', 'ო': 'о',
  'პ': 'п', 'ჟ': 'ж', 'რ': 'р', 'ს': 'с', 'ტ': 'т', 'უ': 'у', 'ფ': 'ф',
  'ქ': 'к', 'ღ': 'г', 'ყ': 'к', 'შ': 'ш', 'ჩ': 'ч', 'ც': 'ц', 'ძ': 'дз',
  'წ': 'ц', 'ჭ': 'ч', 'ხ': 'х', 'ჯ': 'дж', 'ჰ': 'х'
};

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private initialLang(): Language {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('app_lang') as Language;
      if (['geo', 'eng', 'rus'].includes(stored)) {
        return stored;
      }
    }
    return 'geo';
  }

  currentLang = signal<Language>(this.initialLang());

  isGeo = computed(() => this.currentLang() === 'geo');
  isEng = computed(() => this.currentLang() === 'eng');
  isRus = computed(() => this.currentLang() === 'rus');

  toggleLanguage(): void {
    this.currentLang.update((lang) => {
      let next: Language = 'geo';
      if (lang === 'geo') next = 'eng';
      else if (lang === 'eng') next = 'rus';
      else next = 'geo';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('app_lang', next);
      }
      return next;
    });
  }

  setLanguage(lang: Language): void {
    if (['geo', 'eng', 'rus'].includes(lang)) {
      this.currentLang.set(lang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('app_lang', lang);
      }
    }
  }

  t(geo: string, eng?: string, rus?: string): string {
    const lang = this.currentLang();
    if (lang === 'geo') return geo;
    if (lang === 'eng' && eng) return eng;
    if (lang === 'rus' && rus) return rus;
    return this.translate(geo);
  }

  translate(text: string): string {
    if (!text) return '';
    const lang = this.currentLang();
    if (lang === 'geo') return text;

    const trimmed = text.trim();
    if (TRANSLATION_MAP[trimmed]) {
      const item = TRANSLATION_MAP[trimmed];
      if (lang === 'rus' && item.rus) return item.rus;
      if (lang === 'eng' && item.eng) return item.eng;
      return item.eng || text;
    }

    let result = text;
    for (const [geoKey, trans] of Object.entries(TRANSLATION_MAP)) {
      if (geoKey.length > 2 && result.includes(geoKey)) {
        const val = lang === 'rus' ? trans.rus : trans.eng;
        if (val) {
          result = result.replaceAll(geoKey, val);
        }
      }
    }

    if (/[\u10A0-\u10FF]/.test(result)) {
      const map = lang === 'rus' ? GEO_TO_RUS_CHAR_MAP : GEO_TO_ENG_CHAR_MAP;
      result = result.split('').map(ch => map[ch] || ch).join('');
    }

    return result;
  }
}
