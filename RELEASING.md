# Releasing

Acest document descrie procesul de release pentru **Viitorul Răchiteni**.

## Ramuri (branch-uri)

| Branch | Rol |
|--------|-----|
| `main` | Producție. Fiecare commit aici corespunde unei versiuni stabile (cu tag). Deploy pe `viitorulrachiteni.ro`. |
| `develop` | Integrare. Aici se strâng feature-urile terminate până la un release. |
| `feature/*` | Feature nou. Pornește din `develop`. |
| `fix/*` | Bugfix non-urgent. Pornește din `develop`. |
| `hotfix/*` | Bugfix urgent pentru producție. Pornește din `main`, merge înapoi în `main` **și** `develop`. |
| `chore/*` | Task-uri non-funcționale (CI, docs, dependențe). |

## Regula fundamentală

- **Niciodată** commit direct pe `main`.
- Tot ce ajunge pe `main` vine printr-un Pull Request de pe `develop` (sau `hotfix/*`).

## Semantic Versioning

Format: **`vMAJOR.MINOR.PATCH`**

- **MAJOR** — schimbări incompatibile (schemă DB care rupe backend-ul vechi, API care sparge frontend-ul vechi).
- **MINOR** — feature nou compatibil (pagină nouă, endpoint nou).
- **PATCH** — bugfix, tweaks CSS, mici corecturi fără impact API.

Starea live curentă = **`v1.0.0`**.

## Conventional Commits

Format mesaj: `<tip>(<scope opțional>): <descriere scurtă>`

Tipuri acceptate:

- `feat` — feature nou
- `fix` — bugfix
- `refactor` — restructurare fără schimbare de comportament
- `perf` — optimizare de performanță
- `test` — adăugare/modificare teste
- `docs` — documentație
- `chore` — build, CI, dependențe
- `style` — formatare, whitespace (fără impact logic)

Exemple:

```
feat(player-profile): dedupe seasons by label instead of id
fix(gateway): allow anonymous access on dev profile
chore(ci): add github actions workflow
docs(readme): update deployment steps
refactor(auth): simplify JWT filter
```

## Procesul de release

### 1. Dezvoltare pe branch dedicat

```bash
git checkout develop
git pull
git checkout -b feature/nume-scurt
# ... modificări ...
git add .
git commit -m "feat(scope): descriere"
git push -u origin feature/nume-scurt
```

### 2. Pull Request către `develop`

- Deschide PR pe GitHub din `feature/nume-scurt` → `develop`
- Verifică că testele CI trec (când vor fi configurate)
- Merge (preferabil **Squash and merge** pentru istoric curat)
- Șterge branch-ul

### 3. Când `develop` e gata pentru un release

```bash
git checkout develop
git pull
git checkout main
git pull
git merge --no-ff develop -m "chore(release): merge develop into main for v1.1.0"
```

### 4. Tag versiunea

```bash
# Alege versiunea potrivită după SemVer
git tag -a v1.1.0 -m "Release v1.1.0

- feat(player-profile): dedupe seasons by label
- fix(standings): fix wrapping of points badge
- chore(ci): add basic GitHub Actions workflow"

git push origin main
git push origin v1.1.0
```

### 5. Creează GitHub Release

1. Mergi pe GitHub → **Releases** → **Draft a new release**
2. Alege tag-ul `v1.1.0`
3. Titlu: `v1.1.0 — descriere scurtă`
4. Notele de release: rezumat + lista de commit-uri
5. Publish

### 6. Deploy pe Hetzner

**Automat prin GitHub Actions.**

Când faci `git push origin v1.1.0`, workflow-ul `Backend Deploy (Hetzner)`
pornește automat:

1. Se conectează la Hetzner prin SSH
2. Face `git fetch --tags` și `git checkout v1.1.0`
3. Rebuild-uiește imaginile Docker afectate
4. Rulează `docker compose up -d` pentru services

Poți urmări progresul la:
https://github.com/AlexandruDobos/viitorul-rachiteni/actions

Frontend-ul e deployat automat de **Cloudflare Pages** la push pe `main`.

Pentru detalii complete, vezi [deploy/README.md](./deploy/README.md).

## Hotfix pentru producție

Pentru un bug critic în producție:

```bash
git checkout main
git pull
git checkout -b hotfix/descriere-scurta
# ... fix ...
git commit -m "fix(scope): descriere"

# Merge în main
git checkout main
git merge --no-ff hotfix/descriere-scurta

# Tag patch version
git tag -a v1.1.1 -m "Hotfix v1.1.1"
git push origin main --tags

# Merge înapoi în develop ca să nu se piardă fix-ul
git checkout develop
git merge --no-ff hotfix/descriere-scurta
git push origin develop

# Șterge branch-ul de hotfix
git branch -d hotfix/descriere-scurta
git push origin --delete hotfix/descriere-scurta
```

## Rollback

Dacă un release strică producția:

**Opțiunea 1 — prin GitHub Actions (recomandat):**

Actions → **Backend Deploy (Hetzner)** → **Run workflow** → introduci
`v1.0.0` (sau orice tag anterior) → **Run workflow**.

**Opțiunea 2 — manual pe server:**

```bash
ssh alexadmin@91.98.112.34
cd /srv/viitorul-rachiteni
sudo git fetch --tags
sudo git checkout v1.0.0
cd backend
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Convenții suplimentare

- **Pull Request template** — descrie ce se schimbă, cum s-a testat, screenshots dacă e UI.
- **Șterge branch-urile** după merge (setare recomandată în GitHub: Auto-delete head branches).
- **Nu forța push pe `main` sau `develop`.**
- **Squash merge** pentru feature branches → un singur commit curat pe `develop`.
- **Merge commit** (nu squash) când integrezi `develop` în `main` → păstrează istoricul.
