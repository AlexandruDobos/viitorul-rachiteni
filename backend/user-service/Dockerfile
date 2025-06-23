# Dockerfile
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

RUN ./mvnw clean package -DskipTests

CMD ["java", "-jar", "$(find target -name \"*.jar\" | head -n 1)"]
