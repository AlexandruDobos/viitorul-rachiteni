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

# --- Stage 2: runtime cu Playwright (include browsere + deps) ---
FROM mcr.microsoft.com/playwright/java:v1.47.0-jammy
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar

USER pwuser
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
EXPOSE 8082
ENTRYPOINT ["bash","-lc","java $JAVA_OPTS -jar /app/app.jar"]

