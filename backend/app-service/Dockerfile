# --- Stage 1: build ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# 0) Instalează POM-ul părinte în repo local (fără a construi modulele)
COPY pom.xml ./pom.xml
RUN mvn -q -N -f pom.xml install

# 1) Build & install pentru modulul common (devine disponibil în ~/.m2)
COPY common ./common
RUN mvn -q -f common/pom.xml -DskipTests clean install

# 2) Build pentru app-service (va rezolva common din repo local)
COPY app-service ./app-service
RUN mvn -q -f app-service/pom.xml -DskipTests clean package

# --- Stage 2: runtime cu Playwright (include browsere + deps) ---
FROM mcr.microsoft.com/playwright/java:v1.47.0-jammy
WORKDIR /app

COPY --from=build /build/app-service/target/*.jar app.jar

# rulează ca user non-root; imaginea Playwright are 'pwuser'
USER pwuser
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
EXPOSE 8082
ENTRYPOINT ["bash","-lc","java $JAVA_OPTS -jar /app/app.jar"]
