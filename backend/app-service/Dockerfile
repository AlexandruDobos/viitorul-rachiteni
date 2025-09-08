# --- Stage 1: build multi-modul ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# copiem doar poms la început pentru cache mai bun
COPY pom.xml ./pom.xml
COPY common/pom.xml ./common/pom.xml
COPY app-service/pom.xml ./app-service/pom.xml

# preia dependențe offline pentru app-service + dependențele lui (-am)
RUN mvn -q -DskipTests -pl app-service -am dependency:go-offline

# acum copiem tot codul
COPY . .

# build doar pentru app-service (trage și common prin -am)
RUN mvn -q -DskipTests -pl app-service -am package

# --- Stage 2: runtime cu Playwright (include browsere + deps) ---
FROM mcr.microsoft.com/playwright/java:v1.47.1-jammy
WORKDIR /app

# jar-ul rezultat al modulului app-service
COPY --from=build /build/app-service/target/*.jar app.jar

# (opțional) păstrează browserele între redeploy-uri:
# VOLUME ["/root/.cache/ms-playwright", "/ms-playwright"]

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
EXPOSE 8082

# rulează ca user non-root (există în imagine)
USER pwuser

ENTRYPOINT ["bash","-lc","java $JAVA_OPTS -jar /app/app.jar"]
