# Serwis internetowy wspierający funkcjonowanie warsztatu samochodowego

> **Praca inżynierska** - System webowy do kompleksowego zarządzania warsztatem samochodowym

## 📋 Opis projektu

Aplikacja webowa wspierająca codzienne funkcjonowanie warsztatu samochodowego - od przyjęcia zlecenia, przez zarządzanie magazynem części, aż po wydanie gotowego pojazdu klientowi. System obejmuje panel administratora dla pracowników warsztatu oraz portal klienta do śledzenia statusu naprawy.

## 🛠️ Stack technologiczny

### Frontend
- **React** 19+ z TypeScript
- **React Query** (TanStack Query) - zarządzanie stanem serwera
- **Material UI v6** - komponenty UI
- **Axios** - komunikacja HTTP


### Backend
- **NestJS** - framework Node.js z TypeScript
- **TypeORM** - ORM dla PostgreSQL
- **PostgreSQL** - baza danych
- **JWT** - autentykacja i autoryzacja
- **Nodemailer** - wysyłanie powiadomień email
- **Swagger** - dokumentacja API

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
