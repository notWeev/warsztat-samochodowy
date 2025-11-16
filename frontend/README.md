# Frontend - Aplikacja React

## Technologie

- React 18+ z TypeScript
- Material UI v6
- React Query (TanStack Query)
- React Router
- React Hook Form + Zod
- Vite

## Struktura

```
src/
├── App.tsx # Główny komponent aplikacji
├── main.tsx # Punkt wejścia aplikacji z providerami (React Query, MUI Theme)
│
├── features/ # Moduły biznesowe aplikacji
│ ├── auth/ # Autentykacja i autoryzacja
│ ├── dashboard/ # Panel główny z statystykami
│ ├── orders/ # Zarządzanie zleceniami naprawczymi
│ ├── customers/ # Zarządzanie klientami
│ ├── vehicles/ # Zarządzanie pojazdami
│ ├── inventory/ # Zarządzanie magazynem części
│ └── invoices/ # Generowanie i zarządzanie fakturami
│
├── layout/ # Komponenty layoutu
│ ├── NavBar.tsx # Menu boczne
│ ├── Footer.tsx # Stopka aplikacji
│
│
├── routes/ # Konfiguracja routingu
│ ├── AppRouter.tsx # Główna konfiguracja tras
│ ├── ProtectedRoute.tsx # Guard dla tras chronionych
│
│
├── shared/ # Zasoby współdzielone
└── theme/  # Globalne style
```

## Instalacja

```bash
npm install
npm run dev
```
