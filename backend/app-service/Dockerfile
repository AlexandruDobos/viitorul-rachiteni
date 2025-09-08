# --- Stage 1: build doar app-service (+ deps locale) ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# Copiem DOAR ce trebuie pentru a construi app-service:
# - pom-ul root (parent)
# - modulul common (dacă e dependency)
# - modulul app-service (codul nostru)
COPY pom.xml ./pom.xml
COPY common ./common
COPY app-service ./app-service

# (opțional) prefetează dep-urile pentru arborele app-service
RUN mvn -q -f app-service/pom.xml -DskipTests -am dependency:go-offline

# Build efectiv al modulului
RUN mvn -q -f app-service/pom.xml -DskipTests -am package

# --- Stage 2: runtime cu Playwright (browsere + deps gata instalate) ---
FROM mcr.microsoft.com/playwright/java:v1.47.0-jammy
WORKDIR /app

# Copiem JAR-ul rezultat al app-service
COPY --from=build /build/app-service/target/*.jar app.jar

# Rulează ca user non-root; headless merge fără X
USER pwuser
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
EXPOSE 8082
ENTRYPOINT ["bash","-lc","java $JAVA_OPTS -jar /app/app.jar"]
