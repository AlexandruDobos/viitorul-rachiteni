# Contributing

## Setup local

Vezi [README.md](./README.md) pentru instrucțiuni complete de setup.

## Workflow

1. **Nu lucra direct pe `main` sau `develop`.**
2. Creează un branch cu prefix:
   - `feature/*` pentru feature-uri noi
   - `fix/*` pentru bugfix-uri
   - `chore/*` pentru task-uri non-funcționale (CI, docs, deps)
3. Fă commit-uri mici, cu mesaje în format [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(scope): descriere
   fix(scope): descriere
   ```
4. Push branch-ul și deschide un Pull Request către `develop`.
5. După merge, șterge branch-ul.

Vezi [RELEASING.md](./RELEASING.md) pentru procesul complet de release.

## Standarde de cod

### Backend (Java / Spring Boot)

- Java 17
- Formatare consistentă (folosește un formatter — IntelliJ default e OK)
- Fiecare feature nou vine cu **unit teste** (JUnit 5 + Mockito)
- Rulează `mvn test` înainte de push

### Frontend (React / Vite)

- ESLint fără erori (`npm run lint`)
- Componente în PascalCase, hooks în camelCase
- Fără `console.log` în cod commited (folosește `console.error` doar pentru erori reale)

## Nu commite

- Fișiere `.env`, `.env.dev`, `.env.prod` cu valori reale
- Credentiale, tokens, API keys
- Fișiere `target/`, `node_modules/`, `dist/`
- Fișiere `.DS_Store`, `.idea/`, `.vscode/` (personal)

Dacă un fișier sensibil ajunge accidental în repo, spune-mi imediat.
