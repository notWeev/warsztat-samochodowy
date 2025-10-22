# Serwis internetowy wspierający funkcjonowanie warsztatu samochodowego

> **Praca inżynierska** - System webowy do kompleksowego zarządzania warsztatem samochodowym

## 📋 Opis projektu

Aplikacja webowa wspierająca codzienne funkcjonowanie warsztatu samochodowego - od przyjęcia zlecenia, przez zarządzanie magazynem części, aż po wydanie gotowego pojazdu klientowi. System obejmuje panel administratora dla pracowników warsztatu oraz portal klienta do śledzenia statusu naprawy.

## 🎯 Funkcjonalności

### Zarządzanie zleceniami
- ✅ Przyjmowanie zgłoszenia (formularz z danymi klienta, pojazdu, opisem usterki)
- ✅ Automatyczne generowanie numeru zlecenia
- ✅ Przepływ statusów: `przyjęte` → `w trakcie diagnozy` → `oczekuje na akceptację kosztorysu` → `w naprawie` → `zakończone` → `wydane`

### Baza klientów
- ✅ Zarządzanie danymi kontaktowymi
- ✅ Historia wizyt i napraw
- ✅ Preferencje klienta
- ✅ System wiadomości

### Magazyn części
- ✅ Katalog części (kod, nazwa, dostawca, ceny)
- ✅ Zarządzanie stanem magazynowym
- ✅ Rezerwacje części na zlecenia
- ✅ Integracja z zewnętrznymi hurtowniami (symulacja API)

### Panel klienta
- ✅ Logowanie i rejestracja
- ✅ Historia zleceń
- ✅ Śledzenie statusu naprawy w czasie rzeczywistym
- ✅ Powiadomienia email o zmianach statusu

## 🛠️ Stack technologiczny

### Frontend
- **React** 18+ z TypeScript
- **React Query** (TanStack Query) - zarządzanie stanem serwera
- **React Router** - routing
- **Material UI v6** - komponenty UI
- **React Hook Form + Zod** - formularze i walidacja
- **Axios** - komunikacja HTTP
- **Vite** - bundler i dev server

### Backend
- **NestJS** - framework Node.js z TypeScript
- **TypeORM** - ORM dla PostgreSQL
- **PostgreSQL** - baza danych
- **JWT** - autentykacja i autoryzacja
- **Nodemailer** - wysyłanie powiadomień email
- **Swagger** - dokumentacja API

### DevOps i narzędzia
- **Docker + Docker Compose** - konteneryzacja
- **Git + GitHub** - kontrola wersji
- **Jest + Supertest** - testy jednostkowe i E2E
- **ESLint + Prettier** - jakość kodu
- **VS Code** - środowisko deweloperskie

## 📁 Struktura projektu

```
warsztat-samochodowy/
├── docs/                          # Dokumentacja pracy inżynierskiej
│   ├── analiza-wymagan/          # Wymagania funkcjonalne i niefunkcjonalne
│   ├── projektowanie/            # Diagramy UML, ERD, architektura
│   ├── implementacja/            # Opis implementacji, testy
│   ├── podsumowanie/             # Wnioski, bibliografia
│   └── assets/                   # Obrazy, diagramy, zrzuty ekranu
├── frontend/                      # Aplikacja React
│   ├── src/
│   │   ├── components/           # Komponenty UI
│   │   ├── pages/                # Strony aplikacji
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API calls
│   │   ├── utils/                # Funkcje pomocnicze
│   │   ├── types/                # TypeScript typy
│   │   └── assets/               # Statyczne zasoby
│   ├── public/                   # Publiczne pliki
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                       # API NestJS
│   ├── src/
│   │   ├── modules/              # Moduły funkcjonalne
│   │   │   ├── auth/             # Autentykacja
│   │   │   ├── users/            # Zarządzanie użytkownikami
│   │   │   ├── orders/           # Zlecenia naprawy
│   │   │   ├── vehicles/         # Pojazdy
│   │   │   ├── parts/            # Części samochodowe
│   │   │   ├── notifications/    # Powiadomienia
│   │   │   └── external-api/     # Integracja z hurtowniami
│   │   ├── common/               # Wspólne elementy
│   │   ├── database/             # Konfiguracja DB, migracje
│   │   └── config/               # Konfiguracja aplikacji
│   ├── test/                     # Testy E2E
│   ├── package.json
│   └── tsconfig.json
├── database/                      # Skrypty bazy danych
│   ├── migrations/               # Migracje TypeORM
│   ├── seeds/                    # Dane testowe
│   └── docker-compose.yml        # PostgreSQL w kontenerze
├── docker-compose.yml             # Orkiestracja całego systemu
├── .gitignore
└── README.md
```

## 🚀 Instalacja i uruchomienie

### Wymagania wstępne
- Node.js 18+
- Docker i Docker Compose
- Git

### Kroki instalacji

1. **Klonowanie repozytorium**
```bash
git clone https://github.com/notWeev/warsztat-samochodowy.git
cd warsztat-samochodowy
```

2. **Uruchomienie całego systemu**
```bash
# Uruchomienie wszystkich kontenerów (frontend, backend, database)
docker-compose up -d

# Alternatywnie - rozwój lokalny:
# Terminal 1 - Backend
cd backend
npm install
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev

# Terminal 3 - Baza danych
cd database
docker-compose up -d
```

3. **Inicjalizacja bazy danych**
```bash
cd backend
npm run migration:run
npm run seed:run
```

### Dostęp do aplikacji
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Swagger docs**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432

## 📊 Diagramy i dokumentacja

Pełna dokumentacja techniczna znajduje się w folderze `docs/`:
- Analiza wymagań funkcjonalnych i niefunkcjonalnych
- Diagramy UML (przypadki użycia, sekwencji, klas)
- Schemat ERD bazy danych
- Architektura systemu
- Dokumentacja API
- Testy i rezultaty

## 🔐 Bezpieczeństwo

- Autentykacja JWT z refresh tokens
- Walidacja danych wejściowych (Zod)
- Szyfrowanie haseł (bcrypt)
- Ochrona przed atakami CSRF, XSS
- Rate limiting dla API

## 🧪 Testowanie

```bash
# Testy jednostkowe backend
cd backend
npm run test

# Testy E2E
npm run test:e2e

# Testy frontend
cd frontend  
npm run test
```

## 📝 Praca inżynierska

Projekt jest realizowany jako praca inżynierska z zakresu inżynierii oprogramowania. Dokumentacja w folderze `docs/` zawiera wszystkie wymagane elementy pracy dyplomowej zgodnie ze standardami akademickimi.

## 👥 Autor

**[Twoje Imię i Nazwisko]**
- GitHub: [@notWeev](https://github.com/notWeev)
- Email: [twój-email@example.com]

## 📄 Licencja

Projekt edukacyjny - Praca inżynierska