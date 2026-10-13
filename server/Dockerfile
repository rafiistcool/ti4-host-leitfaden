# Hub-API (Rust, axum + SQLite). Gebaut aus dem Ordner server/.
# Kompiliert wird auf der Plattform des Build-Rechners und per xx für die Zielplattform (amd64/arm64)
# cross-kompiliert, statt den ganzen Rust-Build unter QEMU zu emulieren.
FROM --platform=$BUILDPLATFORM tonistiigi/xx:1.6.1 AS xx

FROM --platform=$BUILDPLATFORM rust:1-alpine AS build
COPY --from=xx / /
RUN apk add --no-cache clang lld
ARG TARGETPLATFORM
RUN xx-apk add --no-cache musl-dev gcc
WORKDIR /src
# Abhängigkeiten zuerst, damit sie im Cache bleiben, solange sich nur der Code ändert
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs && touch src/lib.rs \
 && xx-cargo build --release --locked --target-dir /build && rm -rf src
COPY src ./src
RUN touch src/main.rs src/lib.rs \
 && xx-cargo build --release --locked --target-dir /build \
 && xx-verify /build/$(xx-cargo --print-target-triple)/release/ti4-hub \
 && cp /build/$(xx-cargo --print-target-triple)/release/ti4-hub /ti4-hub

FROM alpine:3.22
RUN addgroup -S ti4 && adduser -S ti4 -G ti4 && mkdir /data && chown ti4:ti4 /data
COPY --from=build /ti4-hub /usr/local/bin/ti4-hub
USER ti4
ENV TI4_DATA_DIR=/data
VOLUME /data
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/api/health || exit 1
ENTRYPOINT ["/usr/local/bin/ti4-hub"]
