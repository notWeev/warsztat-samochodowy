# Baza danych PostgreSQL

## Struktura

```
database/
├── migrations/      # Migracje TypeORM
├── seeds/           # Dane testowe
└── docker-compose.yml # PostgreSQL container
```

## Uruchomienie

```bash
# Uruchomienie PostgreSQL w Docker
docker-compose up -d

# Migracje (z katalogu backend/)
npm run migration:run

# Dane testowe
npm run seed:run
```

## Połączenie
- **Host**: localhost
- **Port**: 5432  
- **Database**: warsztat_db
- **User**: postgres
- **Password**: postgres123