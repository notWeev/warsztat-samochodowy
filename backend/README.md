# Backend - API NestJS

## Technologie
- NestJS z TypeScript
- TypeORM + PostgreSQL
- JWT Authentication
- Swagger dokumentacja
- Jest testy

## Struktura

```
src/
├── modules/         # Moduły funkcjonalne
│   ├── auth/        # Autentykacja JWT
│   ├── users/       # Zarządzanie użytkownikami
│   ├── orders/      # Zlecenia naprawy
│   ├── vehicles/    # Pojazdy
│   ├── parts/       # Części samochodowe
│   └── notifications/ # System powiadomień
├── common/          # Guards, decorators, filters
├── database/        # Konfiguracja DB
└── config/          # Zmienne środowiskowe
```

## Instalacja

```bash
npm install
npm run start:dev
```