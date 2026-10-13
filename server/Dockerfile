# Hub-API (Rust, axum + SQLite). Gebaut aus dem Ordner server/.
FROM rust:1-alpine AS build
RUN apk add --no-cache musl-dev
WORKDIR /src
# Abhängigkeiten zuerst, damit sie im Cache bleiben, solange sich nur der Code ändert
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs && echo '' > src/lib.rs && cargo build --release --locked && rm -rf src
COPY src ./src
RUN touch src/main.rs src/lib.rs && cargo build --release --locked

FROM alpine:3.22
RUN addgroup -S ti4 && adduser -S ti4 -G ti4 && mkdir /data && chown ti4:ti4 /data
COPY --from=build /src/target/release/ti4-hub /usr/local/bin/ti4-hub
USER ti4
ENV TI4_DATA_DIR=/data
VOLUME /data
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/api/health || exit 1
ENTRYPOINT ["/usr/local/bin/ti4-hub"]
