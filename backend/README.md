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
│   ├── customers/   # Zarządzanie klientami
│   ├── users/       # Zarządzanie użytkownikami
│   ├── orders/      # Zlecenia naprawy
│   ├── parts/       # Części samochodowe
│   ├── vehicles/    # Pojazdy
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

## Testy

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```