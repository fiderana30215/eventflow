# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Architecture

```mermaid
graph LR
  U[Utilisateur] -->|HTTPS| FE[Frontend React/Vite<br/>:5173]
  FE -->|REST API| BE[Backend Express/TS<br/>:4000]
  BE --> DB[(PostgreSQL<br/>:5432)]
  BE --> RD[(Redis<br/>:6379)]
  BE -->|BullMQ| WK[Worker Email]
  WK --> SMTP[Mailtrap SMTP]
  BE -->|Checkout/Webhook| ST[Stripe]
  BE -->|Verify ID Token| GO[Google OAuth]
  BE --> SW[Swagger UI<br/>/api-docs]
```

## Schéma de la base de données

```mermaid
erDiagram
  USERS ||--o{ EVENTS : organizes
  USERS ||--o{ TICKETS : buys
  USERS ||--o{ CHECKINS : performs
  EVENTS ||--o{ TICKET_CATEGORIES : has
  TICKET_CATEGORIES ||--o{ TICKETS : sold_as
  TICKETS ||--o| PAYMENTS : paid_by
  TICKETS ||--o{ CHECKINS : validated_by

  USERS {
    int id PK
    string email
    string password_hash
    string full_name
    enum role
    string oauth_provider
    string oauth_id
  }
  EVENTS {
    int id PK
    int organizer_id FK
    string title
    text description
    string location
    timestamp start_date
    timestamp end_date
    enum status
  }
  TICKET_CATEGORIES {
    int id PK
    int event_id FK
    string name
    numeric price
    int quantity_total
    int quantity_sold
  }
  TICKETS {
    int id PK
    int category_id FK
    int user_id FK
    string qr_code
    enum status
  }
  PAYMENTS {
    int id PK
    int ticket_id FK
    string stripe_payment_id
    numeric amount
    enum status
  }
  CHECKINS {
    int id PK
    int ticket_id FK
    timestamp checked_in_at
    int checked_in_by FK
  }
```