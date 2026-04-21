FROM maven:3.9.9-eclipse-temurin-8 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests clean compile dependency:copy-dependencies -DincludeScope=runtime

FROM eclipse-temurin:8-jre
WORKDIR /app

COPY --from=build /app/target/classes /app/classes
COPY --from=build /app/target/dependency /app/dependency
EXPOSE 8081

ENTRYPOINT ["java", "-cp", "/app/classes:/app/dependency/*", "com.business.Application"]
