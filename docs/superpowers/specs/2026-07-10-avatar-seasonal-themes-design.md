# Stałe „złe zachowanie”, ulepszone avatary i rodzinne motywy świąteczne

Data: 2026-07-10

## Cel

Zmiana ma osiągnąć trzy powiązane rezultaty:

1. Funkcja rejestrowania złego zachowania ma być stałą częścią aplikacji i nie może zależeć od flagi funkcjonalnej.
2. Edytor avatarów oraz same rysunki avatarów, dodatków i zwierząt mają wyglądać atrakcyjniej, zachowując istniejące konfiguracje użytkowników.
3. Zwykłe motywy kolorystyczne mają realnie zmieniać interfejs użytkownika, a rodzic lub administrator ma móc ręcznie włączyć nadrzędny motyw Wielkanocy albo Bożego Narodzenia dla całej rodziny.

## Zakres i założenia

- Instalacja ChoreQuest reprezentuje jedną rodzinę. Obecny model danych nie rozdziela użytkowników na gospodarstwa domowe, dlatego ustawienie rodzinne jest ustawieniem całej instalacji.
- Dziecko wybiera własny zwykły motyw kolorystyczny.
- Rodzice i administratorzy również zachowują własne zwykłe preferencje wyglądu.
- Aktywny motyw specjalny nadpisuje zwykły motyw wszystkich zalogowanych użytkowników do chwili ręcznego wyłączenia.
- Wyłączenie motywu specjalnego natychmiast przywraca każdemu użytkownikowi jego poprzedni zwykły motyw.
- Nie powstaje harmonogram ani automatyczne daty aktywacji motywów świątecznych.
- Format istniejącego `avatar_config` i identyfikatory elementów avatarów pozostają zgodne wstecznie.

## Poza zakresem

- Wiele rodzin w jednej instalacji.
- Automatyczne włączanie motywów według kalendarza.
- Zastąpienie avatarów bitmapami lub zewnętrzną biblioteką avatarów.
- Zmiana mechaniki punktów, kar lub naliczania powtórzeń funkcji złego zachowania.

## 1. Stała funkcja złego zachowania

Funkcja pozostaje dostępna rodzicom i administratorom bez flagi plikowej.

Zmiana obejmuje:

- usunięcie strażnika `is_bad_behavior_enabled()` ze wszystkich endpointów `/api/bad-behaviors`;
- bezwarunkowe renderowanie `BadBehaviorPanel` na panelu rodzica;
- usunięcie `bad_behavior_enabled` z kontekstu ustawień frontendu oraz odpowiedzi ustawień funkcjonalnych;
- usunięcie serwisu flag plikowych, testów parsera flag, pliku `srv/chorequest/features.json`, zmiennej `FEATURE_FLAGS_PATH` i powiązanego wolumenu z konfiguracji Docker Compose;
- zachowanie istniejących kontroli roli `parent`/`admin` na backendzie.

Nie zmienia się kalkulacja kar, wpisy kalendarza, powiadomienia ani log audytowy.

## 2. Model zwykłych i specjalnych motywów

### Dane

Aktywny motyw specjalny jest zapisany jako rekord `AppSetting`:

- klucz: `special_theme`;
- wartości: `none`, `easter`, `christmas`;
- wartość domyślna: `none`.

Zwykły motyw pozostaje w `avatar_config.color_theme` użytkownika. Dzięki temu włączenie motywu świątecznego nie modyfikuje ani nie usuwa preferencji osobistych.

### API i uprawnienia

Dedykowane API wyglądu rodzinnego:

- `GET /api/theme/special` — dostępne każdemu zalogowanemu użytkownikowi; zwraca aktualny motyw specjalny;
- `PUT /api/theme/special` — dostępne wyłącznie rolom `parent` i `admin`; przyjmuje jedną z trzech dozwolonych wartości.

Backend odrzuca nieznane wartości. Po udanym zapisie wysyła istniejącym kanałem WebSocket zdarzenie `data_changed` z encją `special_theme`, aby wszystkie otwarte sesje odświeżyły wygląd.

### Rozstrzyganie motywu na frontendzie

Kontekst motywu przechowuje osobno:

- `personalTheme` — zwykły wybór bieżącego użytkownika;
- `specialTheme` — ustawienie rodzinne pobrane z backendu;
- `effectiveTheme` — wynik reguły `specialTheme !== 'none' ? specialTheme : personalTheme`.

Klasa na elemencie `document.documentElement` zawsze odpowiada motywowi efektywnemu. Zmiana zwykłego motywu aktualizuje natychmiast stan lokalny, zapisuje `avatar_config.color_theme` i aktualizuje użytkownika w kontekście uwierzytelnienia. Eliminuje to sytuację, w której panel pokazuje nowy wybór, ale ekran nadal korzysta ze starego stanu użytkownika.

Kontekst nasłuchuje komunikatów WebSocket i ponownie pobiera `specialTheme` po zmianie ustawienia. Przy wylogowaniu czyści stan rodzinny, aby nie przenieść go do niezalogowanego widoku.

### Interfejs sterowania

W ustawieniach rodziny powstaje sekcja „Motyw świąteczny” z trzema dużymi kafelkami: brak, Wielkanoc i Boże Narodzenie. Sekcja jest dostępna tylko rodzicom i administratorom, tak jak pozostałe ustawienia rodzinne.

Profil użytkownika nadal zawiera wybór zwykłych motywów. Gdy motyw specjalny jest aktywny:

- wybór osobisty pozostaje widoczny i zapisany;
- interfejs jasno informuje, że rodzinny motyw świąteczny tymczasowo go nadpisuje;
- dziecko nie otrzymuje żadnej kontroli pozwalającej zmienić lub wyłączyć motyw świąteczny.

Przy błędzie zapisu rodzinnego motywu interfejs wraca do poprzedniego stanu i pokazuje komunikat błędu.

## 3. Wizualne motywy sezonowe

Motywy sezonowe obejmują zmienne kolorystyczne oraz dekoracyjną warstwę renderowaną raz w głównym layoucie. Warstwa ma `pointer-events: none`, nie przechwytuje kliknięć i pozostaje poza semantycznym drzewem dostępności.

### Boże Narodzenie

- głęboka zieleń, świąteczna czerwień, ciepłe złoto i zimowe błękity;
- lekki opad śniegu na całym ekranie;
- girlanda z delikatnymi lampkami przy górnej krawędzi;
- gałązki, bombki i prezenty jako narożne akcenty wybranych paneli;
- subtelna poświata, bez zmniejszania kontrastu treści.

### Wielkanoc

- pastelowa mięta, błękit, róż, lila i wiosenna zieleń;
- wolno unoszące się płatki;
- pisanki, królicze uszy i wiosenne gałązki przy nagłówkach;
- delikatna dekoracja trawy przy dolnej krawędzi;
- jasne, miękkie akcenty z zachowaniem czytelności tekstu.

Na małych ekranach liczba cząsteczek jest ograniczona. Przy `prefers-reduced-motion: reduce` animacje zostają wyłączone, ale statyczne dekoracje i paleta nadal są widoczne.

## 4. Kierunek graficzny avatarów

System pozostaje oparty na istniejących, kodowych SVG. Wszystkie dotychczasowe identyfikatory części są zachowane, więc zapisane avatary automatycznie otrzymują odświeżony wygląd.

### Styl ilustracji

- miękkie, bardziej naturalne sylwetki i proporcje;
- spójny, subtelny obrys rozdzielający nakładające się części;
- delikatne światło, cień i refleksy zamiast płaskich prymitywów;
- czytelniejsza mimika i większa różnorodność wizualna oczu oraz ust;
- dopracowane pasma i bryły fryzur;
- bardziej szczegółowe nakrycia głowy, stroje, wzory, dodatki twarzy i ekwipunek;
- zwierzęta oraz ich akcesoria narysowane w tym samym stylu co główny avatar.

Efekty muszą korzystać z kolorów wybranych przez użytkownika. Nie mogą zastępować ich stałymi paletami poza drobnymi neutralnymi refleksami, obrysami i detalami.

### Edytor avatara

Edytor zostaje uporządkowany w mniejsze jednostki:

- `AvatarStage` — duży, centralny, animowany podgląd na dekoracyjnej scenie;
- `AvatarCategoryNav` — kategorie z ikonami i czytelnymi nazwami;
- `AvatarOptionGrid` — siatka kafelków pokazujących prawdziwą miniaturę danej części;
- `AvatarColorPalette` — większe próbki z aktywnym stanem, etykietą i obsługą klawiatury;
- `PetCustomizer` — wybór zwierzęcia, jego poziomu, kolorów, położenia i dodatków.

Na telefonie kategorie tworzą przewijany poziomy pasek, podgląd pozostaje widoczny, a opcje są prezentowane w wygodnej siatce dotykowej. Na większych ekranach nawigacja i opcje wykorzystują panel boczny, a podgląd pozostaje obok.

Zablokowane opcje nadal można tymczasowo podejrzeć. Kafelek otrzymuje czytelną nakładkę z kłódką i nie zapisuje zablokowanego wyboru. Wszystkie interakcje mają etykiety dostępności i widoczne stany fokusu.

Animacje pozostają subtelne. Systemowe `prefers-reduced-motion` wyłącza ruch avatara i zwierząt.

## 5. Przepływ danych

1. Po zalogowaniu frontend pobiera użytkownika oraz globalny motyw specjalny.
2. Resolver wybiera motyw efektywny i nakłada jego klasę na dokument.
3. Zmiana zwykłego motywu zapisuje tylko profil bieżącego użytkownika.
4. Zmiana motywu specjalnego zapisuje `AppSetting`, a backend rozsyła zdarzenie WebSocket.
5. Każda otwarta sesja odświeża globalne ustawienie i ponownie wylicza motyw efektywny.
6. Wyłączenie motywu specjalnego odsłania niezmieniony motyw osobisty każdego użytkownika.

## 6. Obsługa błędów i stany przejściowe

- Początkowe ładowanie specjalnego motywu nie blokuje całej aplikacji; do czasu odpowiedzi stosowany jest osobisty motyw użytkownika.
- Nieudany odczyt zachowuje ostatni poprawny stan w bieżącej sesji i nie usuwa wyboru osobistego.
- Nieudany zapis zwykłego lub specjalnego motywu pokazuje komunikat i synchronizuje UI z ostatnim stanem potwierdzonym przez serwer.
- Nieznany identyfikator motywu z danych historycznych bezpiecznie wraca do `default` albo `none` zależnie od rodzaju ustawienia.
- Błędy pobrania katalogu elementów avatara nie blokują edycji elementów domyślnych.

## 7. Testy i weryfikacja

### Backend

- endpointy złego zachowania nie korzystają z flagi i pozostają chronione rolą rodzica/admina;
- `special_theme` przyjmuje wyłącznie `none`, `easter`, `christmas`;
- odczyt jest dostępny każdemu zalogowanemu użytkownikowi;
- zapis jest odrzucany dla dziecka i dozwolony dla rodzica/admina;
- zapis emituje oczekiwane zdarzenie odświeżenia.

### Frontend

- resolver przyznaje motywowi specjalnemu pierwszeństwo;
- wyłączenie motywu specjalnego przywraca motyw osobisty;
- zwykły motyw aktualizuje klasę dokumentu oraz profil użytkownika;
- kontrola motywu specjalnego nie jest dostępna dziecku;
- katalog avatarów zachowuje dotychczasowe identyfikatory;
- kafelki opcji nie pozwalają zapisać zablokowanego elementu;
- warstwy dekoracyjne nie przechwytują zdarzeń i respektują ograniczenie ruchu.

### Weryfikacja końcowa

- pełne testy backendu;
- testy frontendu;
- produkcyjny build Vite;
- uruchomienie aplikacji i kontrola ekranów rodzica oraz dziecka;
- kontrola responsywności na szerokościach telefonu i desktopu;
- kontrola konsoli przeglądarki oraz podstawowych przepływów: wybór zwykłego motywu, włączenie i wyłączenie obu motywów specjalnych, zapis avatara i stała dostępność złego zachowania.
