import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Terminal, Code, Cpu, Shield, Zap, Lightbulb, AlertTriangle, Info, Check, X } from 'lucide-react';
import './Docs.css';

const TABS = [
  { id: 'getting-started',  group: 'WPROWADZENIE',          label: 'Jak zacząć?' },
  { id: 'architecture',     group: 'WPROWADZENIE',          label: 'Architektura AI' },
  { id: 'prompts',          group: 'TWORZENIE PLUGINÓW',    label: 'Pisanie Promptów' },
  { id: 'compilation',      group: 'TWORZENIE PLUGINÓW',    label: 'Proces Kompilacji' },
  { id: 'debugging',        group: 'TWORZENIE PLUGINÓW',    label: 'Debugowanie Błędów' },
  { id: 'models',           group: 'API I MODELE',          label: 'Dostępne modele' },
  { id: 'api',              group: 'API I MODELE',          label: 'Własne API (np. Claude Code)' },
  { id: 'tokens',           group: 'API I MODELE',          label: 'System Tokenów' },
];

const TAB_LABELS = Object.fromEntries(TABS.map(t => [t.id, t.label]));

const Callout = ({ type = 'info', title, children }) => {
  const map = {
    info:    { icon: Info,          cls: 'info',    title: 'Informacja' },
    tip:     { icon: Lightbulb,     cls: 'tip',     title: 'Wskazówka' },
    warn:    { icon: AlertTriangle, cls: 'warn',    title: 'Uwaga' },
    success: { icon: Check,         cls: 'success', title: 'Dobra praktyka' },
  };
  const { icon: Icon, cls, title: defTitle } = map[type] || map.info;
  return (
    <div className={`docs-callout ${cls}`}>
      <div className="docs-callout-head">
        <Icon size={15}/> <span>{title || defTitle}</span>
      </div>
      <div className="docs-callout-body">{children}</div>
    </div>
  );
};

const CodeBlock = ({ title, children }) => (
  <div className="docs-code-block">
    {title && <div className="code-header"><span>{title}</span></div>}
    <pre><code>{children}</code></pre>
  </div>
);

function Docs() {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [query, setQuery] = useState('');

  const filteredTabs = useMemo(() => {
    if (!query.trim()) return TABS;
    const q = query.toLowerCase();
    return TABS.filter(t => t.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="docs-layout">
      {/* Sidebar */}
      <aside className="docs-sidebar">
        <div className="sidebar-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Szukaj w dokumentacji..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <nav className="sidebar-nav">
          {Array.from(new Set(filteredTabs.map(t => t.group))).map(group => (
            <div className="nav-group" key={group}>
              <h3>{group}</h3>
              <ul className="nav-links">
                {filteredTabs.filter(t => t.group === group).map(t => (
                  <li key={t.id}>
                    <button
                      className={activeTab === t.id ? 'active' : ''}
                      onClick={() => setActiveTab(t.id)}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {filteredTabs.length === 0 && (
            <p className="docs-no-results">Brak wyników dla "{query}".</p>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="docs-content">
        <div className="docs-breadcrumbs">
          <span>Dokumentacja</span> <ChevronRight size={14} /> <span className="active">{TAB_LABELS[activeTab]}</span>
        </div>

        {activeTab === 'getting-started' && (
          <section className="docs-section">
            <h1>Jak zacząć pracę z Zenexcode?</h1>
            <p className="docs-lead">
              Zenexcode to rewolucyjne podejście do tworzenia rozszerzeń serwerów Minecraft.
              Dzięki naszemu środowisku nie musisz znać Javy ani konfigurować środowiska programistycznego.
            </p>

            <h2>Krok 1: Wybór silnika</h2>
            <p>
              Przed wygenerowaniem pierwszego kodu musisz określić cel (środowisko docelowe).
              Obecnie Zenexcode oficjalnie wspiera:
            </p>
            <ul className="docs-list">
              <li><strong>PaperMC</strong> — zalecane dla najnowszych wersji (1.20+), najlepsza kompatybilność z Adventure API.</li>
              <li><strong>Purpur</strong> — dla serwerów zoptymalizowanych pod wydajność.</li>
              <li><strong>Spigot</strong> — wersje starsze, np. 1.8.8 (legacy ChatColor).</li>
            </ul>

            <h2>Krok 2: Konfiguracja Promptu</h2>
            <p>
              Gdy jesteś w projekcie, dolny pasek (przypominający czat w ChatGPT lub Claude)
              służy do wpisywania poleceń. Im precyzyjniej określisz cel, tym lepszy i bezpieczniejszy
              kod wygeneruje nasz model AI.
            </p>

            <CodeBlock title="Przykład dobrego promptu">{`"Stwórz plugin dodający komendę /heal.
Wymagane uprawnienie: zenexcode.heal.
Komenda ma leczyć gracza do pełna, karmić go i odtwarzać dźwięk LEVEL_UP."`}</CodeBlock>

            <Callout type="tip">
              Po opisaniu funkcji kliknij <strong>Buduj JAR</strong> na dole ekranu.
              Plik <code>.jar</code> gotowy do wrzucenia do folderu <code>plugins/</code> pobierze się automatycznie.
            </Callout>

            <h2>Krok 3: Kompilacja i instalacja</h2>
            <ol className="docs-list-ordered">
              <li>W prawym dolnym rogu kliknij <strong>Buduj JAR</strong>.</li>
              <li>Pobrany plik <code>.jar</code> wrzuć do folderu <code>plugins/</code> na serwerze.</li>
              <li>Zrestartuj serwer lub wykonaj <code>/reload</code> (jeśli obsługiwane).</li>
              <li>Sprawdź konsolę — w przypadku błędów użyj przycisku <strong>Auto-Naprawa</strong>.</li>
            </ol>
          </section>
        )}

        {activeTab === 'architecture' && (
          <section className="docs-section">
            <h1>Architektura AI</h1>
            <p className="docs-lead">
              Nasz system składa się z warstw zapewniających, że wygenerowany kod nie tylko
              kompiluje się poprawnie, ale też jest zoptymalizowany pod kątem wydajności na serwerze.
            </p>

            <h2>Przepływ przetwarzania</h2>
            <ol className="docs-list-ordered">
              <li><strong>Pre-processing</strong> — Twój prompt jest formatowany i wzbogacany o kontekst (wiedzę o aktualnym API PaperMC).</li>
              <li><strong>Generowanie (LLM)</strong> — model analizuje logikę i rozbija ją na mniejsze klasy (np. Main.java, CommandHandler.java).</li>
              <li><strong>AST Validation</strong> — system weryfikuje strukturę wygenerowanego kodu Java jeszcze przed próbą kompilacji.</li>
              <li><strong>Budowanie (Maven/Gradle)</strong> — ostateczny kod jest kompilowany w kontenerze, a wynikowy plik <code>.jar</code> zwracany do interfejsu.</li>
            </ol>

            <h2>Tryb hybrydowy</h2>
            <p>
              W trybie hybrydowym proces jest dzielony na dwa etapy. Najpierw model klasy Claude
              generuje krótki plan (sekcję myślową), a następnie model GLM 5.2 zamienia go na pełny
              kod. Pozwala to zachować wysoką jakość rozumowania przy jednoczesnej oszczędności tokenów.
            </p>

            <Callout type="info" title="Myślenie AI">
              Sekcja <code>&lt;think&gt;</code> to wewnętrzny proces modelu.
              Możesz ją włączyć przełącznikiem <strong>"Pokaż myślenie AI"</strong> pod paskiem wprowadzania.
            </Callout>

            <h2>Struktura plików projektu</h2>
            <CodeBlock title="Typowa struktura generowanego pluginu">{`PluginName/
├─ pom.xml
└─ src/main/
   ├─ java/com/zenexcode/pluginname/
   │  ├─ Main.java
   │  ├─ commands/
   │  └─ listeners/
   └─ resources/
      ├─ plugin.yml
      └─ config.yml`}</CodeBlock>
          </section>
        )}

        {activeTab === 'prompts' && (
          <section className="docs-section">
            <h1>Pisanie Promptów</h1>
            <p className="docs-lead">
              Jakość wygenerowanego pluginu zależy bezpośrednio od precyzji Twojego opisu.
              Poniższe zasady pomogą uzyskać profesjonalny kod klasy premium.
            </p>

            <h2>Anatomia dobrego promptu</h2>
            <ol className="docs-list-ordered">
              <li><strong>Funkcja</strong> — co ma robić plugin (np. "system skrzynek losujących").</li>
              <li><strong>Mechanika</strong> — jak działa (animacja, dźwięki, klucze na PDC).</li>
              <li><strong>Komendy i uprawnienia</strong> — nazwy komend + permisje.</li>
              <li><strong>Konfiguracja</strong> — co ma być konfigurowalne w <code>config.yml</code>.</li>
            </ol>

            <h2>Dobre vs złe prompty</h2>
            <div className="docs-compare">
              <div className="docs-compare-col bad">
                <div className="docs-compare-head"><X size={14}/> Słaby prompt</div>
                <CodeBlock>{`"zrób plugin na skrzynki"`}</CodeBlock>
                <p>AI zgaduje założenia — wynik może być niekompletny lub niespójny.</p>
              </div>
              <div className="docs-compare-col good">
                <div className="docs-compare-head"><Check size={14}/> Mocny prompt</div>
                <CodeBlock>{`"Stwórz system 3 skrzynek losujących (common, rare, legendary).
Animacja otwarcia trwa 5s (BukkitRunnable), klucze na PDC.
Komendy: /crates give <gracz> <typ>, /crates reload.
Uprawnienia: zenexcode.crates.give, zenexcode.crates.reload.
Konfiguracja w config.yml z sekcją nagród per skrzynka."`}</CodeBlock>
              </div>
            </div>

            <h2>Najlepsze praktyki</h2>
            <ul className="docs-list">
              <li>Używaj języka polskiego — model lepiej rozumie złożone wymagania.</li>
              <li>Podawaj wersję MC i silnik — zapobiega błędom API (np. <code>WOOD_SWORD</code> vs <code>WOODEN_SWORD</code>).</li>
              <li>Wymagaj PDC zamiast nazw wyświetlanych — zapobiega oszustwom.</li>
              <li>Proś o Adventure API + MiniMessage dla nowszych wersji (1.18+).</li>
              <li>Nie proś o "cały kod od nowa" — popisuj iteracyjnie, co zmienić.</li>
            </ul>

            <Callout type="warn" title="Unikaj">
              Pisania "zrób to dobrze", "ma być optymalnie", "najlepszy możliwy". To nie wpływa na jakość —
              lepiej opisać konkretne mechaniki i ich zachowanie.
            </Callout>
          </section>
        )}

        {activeTab === 'compilation' && (
          <section className="docs-section">
            <h1>Proces Kompilacji</h1>
            <p className="docs-lead">
              Zenexcode kompiluje plugin w izolowanym kontenerze Maven. Wystarczą pliki
              wygenerowane przez AI — nie musisz instalować JDK ani Mavena lokalnie.
            </p>

            <h2>Wymagania pliku pom.xml</h2>
            <p>
              Każdy projekt musi zawierać <code>pom.xml</code> z zależnością Spigot/PaperMC.
              AI generuje go automatycznie, ale warto znać kluczowe elementy:
            </p>
            <CodeBlock title="pom.xml (fragment)">{`<project>
  <groupId>com.zenexcode</groupId>
  <artifactId>MyPlugin</artifactId>
  <version>1.0</version>
  <packaging>jar</packaging>

  <repositories>
    <repository>
      <id>spigot-repo</id>
      <url>https://hub.spigotmc.org/nexus/content/repositories/snapshots/</url>
    </repository>
  </repositories>

  <dependencies>
    <dependency>
      <groupId>org.spigotmc</groupId>
      <artifactId>spigot-api</artifactId>
      <version>1.21.4-R0.1-SNAPSHOT</version>
      <scope>provided</scope>
    </dependency>
  </dependencies>

  <build>
    <finalName>\${project.artifactId}-\${project.version}</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.11.0</version>
        <configuration>
          <source>17</source>
          <target>17</target>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>`}</CodeBlock>

            <h2>Wymagany plugin.yml</h2>
            <CodeBlock title="src/main/resources/plugin.yml">{`name: MyPlugin
version: '1.0'
main: com.zenexcode.myplugin.Main
api-version: '1.21'
author: Zenexcode
commands:
  heal:
    description: Leczy gracza
    permission: zenexcode.heal
permissions:
  zenexcode.heal:
    description: Pozwala użyć /heal
    default: op`}</CodeBlock>

            <Callout type="warn" title="Brak rejestracji komendy">
              Jeśli komenda nie jest wpisana w <code>plugin.yml</code> w sekcji <code>commands</code>,
              serwer wyrzuci <code>NullPointerException</code> przy <code>getCommand()</code>.
            </Callout>

            <h2>Krok po kroku</h2>
            <ol className="docs-list-ordered">
              <li>AI generuje <code>pom.xml</code>, <code>plugin.yml</code> i klasy Javy w tagach <code>&lt;file&gt;</code>.</li>
              <li>Lista plików pojawia się w polu "ZMIENIONE PLIKI" pod wiadomością AI.</li>
              <li>Klikasz <strong>Buduj JAR</strong> — kod trafia do kontenera Maven.</li>
              <li>Plik <code>.jar</code> pobiera się automatycznie z poprawną nazwą.</li>
            </ol>
          </section>
        )}

        {activeTab === 'debugging' && (
          <section className="docs-section">
            <h1>Debugowanie Błędów</h1>
            <p className="docs-lead">
              Jeśli kompilacja się nie powiedzie, Zenexcode pokaże log błędu i zaproponuje
              automatyczną naprawę. Poniżej najczęstsze problemy i ich przyczyny.
            </p>

            <h2>Auto-Naprawa</h2>
            <p>
              Gdy kompilacja zwróci błąd, pod statusem pojawi się przycisk <strong>Auto-Naprawa</strong>.
              Kliknięcie wyśle logi do AI z prefiksem <code>[SYSTEM-AUTO-FIX]</code> — model przeanalizuje
              błąd i wygeneruje poprawiony plik w tagu <code>&lt;file&gt;</code>.
            </p>

            <Callout type="tip" title="Skuteczna auto-naprawa">
              Po kliknięciu Auto-Naprawa, odbuduj plugin ponownie. Jeśli błąd nadal występuje,
              skopiuj pełny log z konsoli serwera i wklej go w czacie z komentarzem "napraw to".
            </Callout>

            <h2>Najczęstsze błędy</h2>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Błąd</th><th>Przyczyna</th><th>Rozwiązanie</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>NullPointerException: getCommand()</code></td>
                    <td>Komenda nie zarejestrowana w <code>plugin.yml</code></td>
                    <td>Dodaj wpis w sekcji <code>commands</code></td>
                  </tr>
                  <tr>
                    <td><code>cannot find symbol: WOOD_SWORD</code></td>
                    <td>Stare API (pre-1.13) na nowym serwerze</td>
                    <td>Zmień na <code>WOODEN_SWORD</code></td>
                  </tr>
                  <tr>
                    <td><code>NoClassDefFoundError: Component</code></td>
                    <td>Brak zależności Adventure API</td>
                    <td>Upewnij się, że używasz PaperMC, nie Spigot</td>
                  </tr>
                  <tr>
                    <td><code>ClassCastException: String to Component</code></td>
                    <td>Mieszanie legacy <code>ChatColor</code> z Adventure</td>
                    <td>Używaj wyłącznie <code>MiniMessage.miniMessage().deserialize()</code></td>
                  </tr>
                  <tr>
                    <td><code>IllegalArgumentException: Sound</code></td>
                    <td>Nieistniejący enum dźwięku w tej wersji</td>
                    <td>Sprawdź <code>Sound</code> dla docelowej wersji MC</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Czytanie logów</h2>
            <p>
              Najważniejsze linie w logu Maven to te zawierające <code>[ERROR]</code> z nazwą pliku
              i numerem linii, np.:
            </p>
            <CodeBlock title="Przykład logu błędu">{`[ERROR] /Main.java:[42,15] cannot find symbol
  symbol:   variable player
  location: class com.zenexcode.myplugin.Main`}</CodeBlock>
            <p>
              Liczba <code>[42,15]</code> oznacza <strong>linia 42, kolumna 15</strong>. Wskaż AI ten
              fragment, aby naprawił dokładnie ten punkt.
            </p>
          </section>
        )}

        {activeTab === 'models' && (
          <section className="docs-section">
            <h1>Dostępne modele</h1>
            <p className="docs-lead">
              Wybierz model z menu w nagłówku czatu. Dostępność zależy od planu — w trybie Free
              używany jest Sonnet 4.6 w trybie hybrydowym dla oszczędności tokenów.
            </p>

            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Model</th><th>Moc</th><th>Szybkość</th><th>Koszt</th><th>Zalecane do</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Claude Opus 4.8</strong></td>
                    <td>★★★★★</td>
                    <td>★★</td>
                    <td>Wysoki</td>
                    <td>Złożone architektury, duże pluginy</td>
                  </tr>
                  <tr>
                    <td><strong>Claude Opus 4.7</strong></td>
                    <td>★★★★★</td>
                    <td>★★</td>
                    <td>Wysoki</td>
                    <td>Złożone logiki biznesowe</td>
                  </tr>
                  <tr>
                    <td><strong>Claude Sonnet 4.6</strong></td>
                    <td>★★★★</td>
                    <td>★★★</td>
                    <td>Średni</td>
                    <td>Codzienna praca, Free plan</td>
                  </tr>
                  <tr>
                    <td><strong>Claude Haiku 4.5</strong></td>
                    <td>★★★</td>
                    <td>★★★★★</td>
                    <td>Niski</td>
                    <td>Szybkie poprawki, proste komendy</td>
                  </tr>
                  <tr>
                    <td><strong>GLM 5.2</strong></td>
                    <td>★★★★</td>
                    <td>★★★★</td>
                    <td>Bardzo niski</td>
                    <td>Tryb hybrydowy, Fair Use</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Callout type="info" title="Tryb hybrydowy">
              W trybie hybrydowym Claude generuje plan myślowy, a GLM 5.2 zamienia go na kod.
              Daje to jakość Claude'a przy koszcie zbliżonym do GLM. Domyślnie włączony w planie Free.
            </Callout>

            <h2>Jak zmienić model?</h2>
            <ol className="docs-list-ordered">
              <li>W nagłówku czatu kliknij przycisk z nazwą modelu (prawy górny róg).</li>
              <li>Wybierz model z rozwijanej listy.</li>
              <li>Wybór jest zapisywany per projekt — nie musisz powtarzać przy powrocie.</li>
            </ol>

            <Callout type="warn" title="Limit 429">
              Jeśli model zwraca błąd <code>429</code>, odczekaj ~1 minutę lub przełącz się na
              inny model. Haiku i GLM mają znacznie wyższe limity.
            </Callout>
          </section>
        )}

        {activeTab === 'api' && (
          <section className="docs-section">
            <h1>Integracja własnego API</h1>
            <p className="docs-lead">
              Zenexcode pozwala generować własne klucze API, co umożliwia podłączenie naszego
              asystenta do zewnętrznych narzędzi i edytorów kodu (np. Claude Code, Cursor, VSCode).
            </p>

            <h2>Jak wygenerować klucz?</h2>
            <ol className="docs-list-ordered">
              <li>Przejdź do <strong>Ustawień konta</strong> w prawym górnym rogu.</li>
              <li>Wybierz zakładkę <strong>Klucze API</strong>.</li>
              <li>Kliknij <strong>Wygeneruj nowy klucz</strong> i skopiuj go w bezpieczne miejsce.</li>
            </ol>

            <h2>Integracja z Claude Code / Cursor</h2>
            <p>
              Nasze API jest kompatybilne ze standardem OpenAI, dzięki czemu możesz użyć go wszędzie tam,
              gdzie obsługiwane są niestandardowe punkty końcowe (Base URL).
            </p>

            <CodeBlock title="Konfiguracja środowiska (.env lub ustawienia edytora)">{`OPENAI_API_BASE="https://api.zenexcode.pl/v1"
OPENAI_API_KEY="vc-twój-unikalny-klucz-api"
# Możesz użyć modelu GLM-5.2 wpisując go w pole nazwy modelu
MODEL="glm-5.2-coder"`}</CodeBlock>

            <Callout type="warn" title="Rozliczenie">
              Korzystanie z własnego klucza API pobiera kredyty ze wspólnego portfela przypisanego
              do Twojego konta Zenexcode — niezależnie od tego, czy generujesz przez stronę, czy przez edytor.
            </Callout>

            <h2>Przykład zapytania (curl)</h2>
            <CodeBlock title="Test połączenia">{`curl https://api.zenexcode.pl/v1/chat/completions \\
  -H "Authorization: Bearer vc-twój-klucz" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "glm-5.2-coder",
    "messages": [
      { "role": "user", "content": "Napisz komendę /fly w Javie dla PaperMC" }
    ]
  }'`}</CodeBlock>
          </section>
        )}

        {activeTab === 'tokens' && (
          <section className="docs-section">
            <h1>System Tokenów</h1>
            <p className="docs-lead">
              Każde zapytanie do AI zużywa tokeny, które przeliczane są na kredyty (USD).
              Poniżej zasady rozliczeń oraz jak optymalizować koszty.
            </p>

            <h2>Jak liczone są tokeny?</h2>
            <ul className="docs-list">
              <li><strong>Tokeny wejściowe</strong> — Twój prompt + system prompt + historia rozmowy.</li>
              <li><strong>Tokeny wyjściowe</strong> — odpowiedź modelu (kod + tekst).</li>
              <li>W przybliżeniu 1 token ≈ 3 znaki tekstu + stała narzut (input ~+150, output ~+50).</li>
              <li>Tryb hybrydowy zapisuje ~30% tokenów wejściowych dzięki cache'owaniu planu.</li>
            </ul>

            <h2>Cennik modeli (USD / 1M tokenów)</h2>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Model</th><th>Wejście</th><th>Wyjście</th><th>Mnożnik*</th></tr>
                </thead>
                <tbody>
                  <tr><td>Claude Opus 4.8 / 4.7</td><td>$5.00</td><td>$25.00</td><td>×1.4</td></tr>
                  <tr><td>Claude Sonnet 4.6</td><td>$15.00</td><td>$75.00</td><td>×1.4</td></tr>
                  <tr><td>Claude Haiku 4.5</td><td>$1.00</td><td>$5.00</td><td>×1.4</td></tr>
                  <tr><td>GLM 5.2</td><td>$1.00</td><td>$3.00</td><td>×2.0</td></tr>
                </tbody>
              </table>
            </div>
            <p className="docs-table-footnote">*Mnożnik uwzględnia koszty proxy i utrzymania infrastruktury.</p>

            <h2>Plany</h2>
            <div className="docs-table-wrap">
              <table className="docs-table">
                <thead>
                  <tr><th>Plan</th><th>Limity</th><th>Modele</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Free</strong></td><td>5 zapytań/dzień</td><td>Sonnet 4.6 (hybryda)</td></tr>
                  <tr><td><strong>Starter</strong></td><td>$10 portfel</td><td>Wszystkie</td></tr>
                  <tr><td><strong>Pro</strong></td><td>$50 portfel + zniżki</td><td>Wszystkie + priorytet</td></tr>
                  <tr><td><strong>Unlimited+</strong></td><td>Bez limitów zapytań</td><td>Wszystkie</td></tr>
                </tbody>
              </table>
            </div>

            <Callout type="tip" title="Optymalizacja kosztów">
              <ul className="docs-list" style={{ margin: 0 }}>
                <li>Proś o <strong>diff/patch</strong> zamiast pełnego pliku przy poprawkach.</li>
                <li>Używaj trybu hybrydowego dla dużych zadań.</li>
                <li>Wybieraj Haiku/GLM dla szybkich, prostych poprawek.</li>
                <li>Krótkie prompty = mniej tokenów wejściowych.</li>
              </ul>
            </Callout>

            <h2>Saldo i zużycie</h2>
            <p>
              Twoje saldo widoczne jest w stopce bocznego panelu projektu oraz w Dashboardzie.
              Format: <code>Wydano $X / $Y</code>, gdzie <strong>$X</strong> to skumulowane zużycie,
              a <strong>$Y</strong> to kwota zakupionych kredytów.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default Docs;
