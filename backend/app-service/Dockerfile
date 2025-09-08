# --- Stage 1: build doar modulele necesare ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# Copiem doar ce ne trebuie pentru app-service
COPY pom.xml ./pom.xml
COPY common ./common
COPY app-service ./app-service

# 1) Build & install 'common' in repo local (~/.m2)
RUN mvn -q -f common/pom.xml -DskipTests clean install

# 2) Apoi build pentru app-service (va rezolva common din ~/.m2)
RUN mvn -q -f app-service/pom.xml -DskipTests clean package

# --- Stage 2: runtime cu Playwright (browsere + deps) ---
FROM mcr.microsoft.com/playwright/java:v1.47.0-jammy
WORKDIR /app

# Copiem JAR-ul
COPY --from=build /build/app-service/target/*.jar app.jar

# rulăm ca user non-root (pwuser este în imaginea Playwright)
USER pwuser
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
EXPOSE 8082
ENTRYPOINT ["bash","-lc","java $JAVA_OPTS -jar /app/app.jar"]
