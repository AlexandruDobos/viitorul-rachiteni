# Monitoring & health checks

This document describes the endpoints exposed by each backend service and
how to wire them into an external uptime monitor.

## Endpoints

Every backend service now has Spring Boot Actuator on the classpath and
exposes exactly two endpoints:

- `GET /actuator/health` — 200 + `{"status":"UP"}` when the service is up
  and all `HealthIndicator`s are green (DB, disk, mail, RabbitMQ, ...).
  Returns 503 otherwise. Sensitive details are hidden
  (`management.endpoint.health.show-details=never`), so this is safe to
  put behind a public URL.
- `GET /actuator/info` — build metadata. Currently empty; can be enriched
  by adding `info.*` properties or the `git-commit-id` plugin.

Nothing else is exposed. `env`, `beans`, `heapdump`, etc. are NOT
reachable — that's intentional.

## Where each service is reachable

| Service | Internal (Docker network) | Public |
|---|---|---|
| `gateway` | `http://gateway:8080/actuator/health` | **`https://api.viitorulrachiteni.ro/actuator/health`** |
| `auth-service` | `http://auth-service:8081/actuator/health` | not exposed |
| `app-service` | `http://app-service:8082/actuator/health` | not exposed |
| `donations-service` | `http://donations-service:8083/actuator/health` | not exposed |
| `email-service` | `http://email-service:8085/actuator/health` | not exposed |

Only the gateway is proxied by nginx to the outside world. The other
services are only reachable from inside the Docker network — perfect for
Docker healthchecks and internal `curl`s, but they aren't monitored from
the public internet.

## Wiring up an external uptime monitor (free tier)

Any HTTP monitor works. Below are the two most common:

### UptimeRobot (https://uptimerobot.com/)

1. **Dashboard → Add New Monitor**.
2. Monitor Type: `HTTP(s)`
3. Friendly Name: `Viitorul API`
4. URL: `https://api.viitorulrachiteni.ro/actuator/health`
5. Monitoring Interval: `5 minutes` (free tier limit)
6. Alert Contacts To Notify: your email + optionally a Telegram/Discord bot.
7. Save.

Optionally add a second monitor for the site itself:
`https://www.viitorulrachiteni.ro/` (Cloudflare Pages).

### BetterStack / Better Uptime (https://betterstack.com/)

1. **Monitors → Create monitor**.
2. Type: `HTTPS`
3. URL: `https://api.viitorulrachiteni.ro/actuator/health`
4. Expected status codes: `200`
5. Expected keyword: `"status":"UP"` (optional but recommended — catches
   the case where the endpoint returns 200 with a payload that says
   `DOWN`, e.g. when the DB is broken).
6. Check frequency: `1 minute` (free tier: 3 minutes).
7. Save.

## Deployment healthcheck

`deploy/deploy.sh` already runs a health probe against the gateway after
each deploy and warns if it doesn't respond. This is a smoke test that
runs on the host itself; the external monitor above tells you whether
the whole thing is reachable from the public internet.

## Adding more probes later

- **Application-specific**: implement a `HealthIndicator` in the service
  and Spring wires it in automatically. Example:
  ```java
  @Component
  class RabbitHealth implements HealthIndicator {
      public Health health() { return Health.up().build(); }
  }
  ```
- **Metrics**: add `spring-boot-starter-actuator` + `micrometer-registry-*`
  (e.g. Prometheus) and expose `/actuator/prometheus`. Scrape it from a
  Prometheus / Grafana Cloud tier.
- **Logs**: consider shipping container logs to Grafana Loki or Datadog
  free tier; today they only live on the Hetzner host.
