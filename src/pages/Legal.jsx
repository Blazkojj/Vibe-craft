import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './Landing.css'; // Reuse landing styling

function Legal() {
  const location = useLocation();
  const path = location.pathname;

  let title = "Dokument Prawny";
  let content = "Trwa ładowanie dokumentu...";

  if (path === '/regulamin') {
    title = "Regulamin Sklepu";
    content = `
      1. Postanowienia ogólne
      Niniejszy regulamin określa zasady świadczenia usług drogą elektroniczną w ramach serwisu Zenexcode (zwanego dalej „Serwisem”). 
      Korzystanie z Serwisu oznacza akceptację niniejszego regulaminu. 
      Zenexcode zastrzega sobie prawo do wprowadzania zmian w regulaminie, o czym użytkownicy będą informowani.

      2. Usługi i Płatności
      Serwis Zenexcode umożliwia automatyczne generowanie kodu (pluginów Minecraft) przy użyciu sztucznej inteligencji.
      Dostęp do funkcji premium wymaga doładowania wirtualnego portfela (kredyty w walucie $) lub wykupienia pakietu.
      Płatności są obsługiwane wyłącznie przez certyfikowanego operatora - platformę Suppi.pl.
      Wszystkie ceny podane w Serwisie są cenami brutto i zawierają odpowiednie podatki.

      3. Odpowiedzialność
      Użytkownik przyjmuje do wiadomości, że kod generowany przez AI może zawierać błędy lub luki w zabezpieczeniach. 
      Zenexcode nie ponosi odpowiedzialności za ewentualne straty, uszkodzenia serwerów, ani utratę danych wynikające z użycia wygenerowanych pluginów.

      4. Prawa Autorskie
      Wygenerowany kod staje się własnością użytkownika. Zastrzegamy jednak prawo do anonimizacji i wykorzystania zapytań (promptów) w celu ulepszania naszych modeli.

      5. Zwroty i Reklamacje
      Z uwagi na cyfrowy charakter świadczonych usług oraz natychmiastowe ich realizowanie (generowanie za pomocą API), 
      użytkownikowi co do zasady nie przysługuje prawo do zwrotu kosztów za zużyte kredyty. 
      Reklamacje dotyczące błędów w działaniu samego panelu prosimy kierować na nasz serwer Discord.
    `;
  } else if (path === '/polityka-prywatnosci') {
    title = "Polityka Prywatności";
    content = `
      1. Kto przetwarza Twoje dane?
      Administratorem Twoich danych osobowych jest zespół Zenexcode. 
      Dbamy o to, by Twoje dane były bezpieczne i przetwarzane zgodnie z RODO (GDPR).

      2. Jakie dane zbieramy?
      - Adres e-mail (w celu logowania i weryfikacji konta za pomocą systemu Supabase).
      - Twój pseudonim (nick) z platformy Suppi.pl (w celu przypisania zakupionych pakietów do Twojego konta).
      - Historię zapytań (prompty) do naszego AI w celu świadczenia usługi.

      3. Udostępnianie danych
      Twoje dane nie są sprzedawane podmiotom trzecim. Część zapytań może być przetwarzana przez zewnętrzne usługi AI (np. Google Gemini, Anthropic) w ramach świadczonej usługi.
      Używamy zewnętrznych operatorów do logowania (Supabase) oraz płatności (Suppi.pl).

      4. Ciasteczka (Cookies)
      Serwis wykorzystuje wyłącznie niezbędne pliki cookies, które służą do utrzymania sesji logowania użytkownika. 
      Nie używamy cookies śledzących w celach reklamowych.

      5. Twoje prawa
      Masz prawo wglądu do swoich danych, ich poprawiania, a także całkowitego usunięcia konta ("prawo do bycia zapomnianym"). 
      W tym celu skontaktuj się z nami na naszym serwerze Discord.
    `;
  } else if (path === '/warunki') {
    title = "Warunki Korzystania (Terms of Service)";
    content = `
      1. Zasady korzystania z AI
      Użytkownik zobowiązuje się do niegenerowania treści niezgodnych z prawem, propagujących przemoc, 
      oprogramowania złośliwego (tzw. malware, backdoory, force-op pluginy). 
      Zastrzegamy sobie prawo do natychmiastowego zablokowania konta w przypadku wykrycia takich prób.

      2. Fair Use Policy (Polityka Uczciwego Korzystania)
      Pakiety "Nielimitowane" podlegają zasadzie Fair Use. 
      Oznacza to, że nielimitowany dostęp dotyczy normalnego użytkowania przez jednego człowieka. 
      Używanie botów, skryptów automatyzujących zapytania lub współdzielenie konta z innymi osobami jest zabronione.
      W przypadku wykrycia nienormalnie wysokiego zużycia zasobów, Zenexcode może czasowo ograniczyć prędkość generowania na danym koncie.

      3. Dostępność Usługi (SLA)
      Dokładamy wszelkich starań, aby Zenexcode był dostępny 24/7. 
      Jednakże ze względu na zależność od zewnętrznych dostawców API (LLM) mogą wystąpić czasowe przestoje.
    `;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="dev-landing" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="dev-container" style={{ textAlign: 'left', alignItems: 'flex-start', flex: 1, padding: '4rem 2rem' }}>
        
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem' }}>
          <ArrowLeft size={18} /> Wróć na stronę główną
        </Link>
        
        <h1 style={{ fontFamily: 'var(--font-main)', fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3rem', letterSpacing: '-0.025em' }}>
          {title}
        </h1>
        
        <div style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
          {content}
        </div>
      </div>
    </div>
  );
}

export default Legal;
