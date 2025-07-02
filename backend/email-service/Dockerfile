# Stage 1: build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /build

# Copiază tot proiectul multi-modul
COPY . .

# Compilează din root ca să includă și common
RUN mvn clean install -DskipTests

# Stage 2: run
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Înlocuiește `user-service` cu numele corect al folderului tău
COPY --from=build /build/email-service/target/*.jar app.jar

EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
