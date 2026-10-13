# Hub-API (Spring Boot). Gebaut aus dem Ordner server/.
# Das JAR ist plattformunabhängig: auf der Build-Plattform bauen statt unter QEMU emulieren.
FROM --platform=$BUILDPLATFORM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S ti4 && adduser -S ti4 -G ti4 && mkdir /data && chown ti4:ti4 /data
COPY --from=build /src/target/ti4-hub.jar app.jar
USER ti4
ENV TI4_DATA_DIR=/data
VOLUME /data
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/api/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
