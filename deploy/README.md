# Deploy — Backend pe Hetzner

Acest folder conține scripturi și instrucțiuni pentru deploy-ul automat al
backend-ului pe serverul Hetzner.

Frontend-ul este deployat separat de **Cloudflare Pages** (build automat din
GitHub la fiecare push pe `main`).

## Arhitectură

```
GitHub (repo) ──► git tag vX.Y.Z ──► GitHub Actions
                                          │
                    ┌─────────────────────┴──────────────────────┐
                    ▼                                            ▼
             Cloudflare Pages                              Hetzner (SSH)
             (build frontend                              /srv/viitorul-rachiteni
              automat la push                              git checkout vX.Y.Z
              pe main)                                     docker compose build
                    │                                     docker compose up -d
                    ▼                                            │
             viitorulrachiteni.ro                                ▼
             (static)                                    api.viitorulrachiteni.ro
                                                         (gateway → microservicii)
```

## Prerequisites (o singură dată)

### 1. Cheie SSH dedicată pentru GitHub Actions

Pe Mac (nu pe server), generează o cheie separată:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_deploy -N "" -C "github-actions-deploy"
```

### 2. Autorizează cheia pe Hetzner

```bash
cat ~/.ssh/github_actions_deploy.pub | ssh alexadmin@91.98.112.34 \
  "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### 3. Configurează sudo NOPASSWD pentru docker + git

Pe server:

```bash
sudo tee /etc/sudoers.d/alexadmin-deploy <<'EOF'
alexadmin ALL=(root) NOPASSWD: /usr/bin/docker, /usr/bin/git
EOF
sudo chmod 440 /etc/sudoers.d/alexadmin-deploy
```

Testează:

```bash
sudo docker ps        # NU trebuie să ceară parolă
sudo git -C /srv/viitorul-rachiteni status
```

### 4. Adaugă GitHub Secrets

Deschide **https://github.com/AlexandruDobos/viitorul-rachiteni/settings/secrets/actions**
și adaugă:

| Secret name      | Valoare                                                  |
|------------------|----------------------------------------------------------|
| `HETZNER_HOST`   | `91.98.112.34`                                           |
| `HETZNER_USER`   | `alexadmin`                                              |
| `HETZNER_SSH_KEY`| Conținutul complet al `~/.ssh/github_actions_deploy`     |

Pentru `HETZNER_SSH_KEY`, copiază cu:

```bash
cat ~/.ssh/github_actions_deploy | pbcopy
```

Apoi lipește în GitHub — trebuie să includă liniile
`-----BEGIN OPENSSH PRIVATE KEY-----` și `-----END OPENSSH PRIVATE KEY-----`.

### 5. Creează environment "production" în GitHub (opțional dar recomandat)

Setări → Environments → New environment → `production`.

Aici poți adăuga:
- **Required reviewers** — deploy-urile așteaptă aprobarea ta manuală înainte să pornească
- **Deployment branches** — restricționează deploy la tag-uri `v*` (deja e restricționat în workflow, dar redundant e bine)

## Trigger deploy

### Automat — la tag v*

```bash
# pe local, pe branch main
git checkout main
git pull

git tag -a v1.1.0 -m "Release v1.1.0"
git push origin v1.1.0
```

GitHub Actions pornește automat, rulează SSH pe Hetzner, face deploy.

Vezi progresul: **https://github.com/AlexandruDobos/viitorul-rachiteni/actions**

### Manual — de la orice ref

Actions → **Backend Deploy (Hetzner)** → **Run workflow** → introduci un tag,
branch sau commit SHA → **Run workflow**.

## Rollback

Pentru a reveni la o versiune anterioară:

Actions → **Backend Deploy (Hetzner)** → **Run workflow** → introduci
`v1.0.0` (sau orice tag anterior) → **Run workflow**.

Alternativ, ssh manual pe server și rulează:

```bash
cd /srv/viitorul-rachiteni
sudo git fetch --tags
sudo git checkout v1.0.0
cd backend
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml build \
    auth-service app-service donations-service email-service gateway
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d \
    auth-service app-service donations-service email-service gateway
```

## Debugging

Dacă un deploy pică, verifică:

1. **Logs în GitHub Actions** — vezi exact la ce pas a crăpat
2. **SSH pe server** și rulează manual comenzile pe care le-ar fi rulat scriptul
3. **Docker logs**:
   ```bash
   sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f gateway
   ```

## Ce NU face acest deploy

- **NU** atinge `postgres`, `rabbitmq`, `nginx` (containere de infra, nu ale codului tău)
- **NU** rulează migrări DB (Hibernate cu `ddl-auto=update` face automat)
- **NU** deployează frontend-ul (Cloudflare Pages face asta automat la push pe `main`)
- **NU** șterge volumele Docker (datele DB sunt în siguranță)
