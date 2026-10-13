# 1) Web-App aus src/ bauen (nur Python-Standardbibliothek)
FROM python:3.12-alpine AS build
WORKDIR /src
COPY build.py ./
COPY src ./src
RUN python3 build.py

# 2) Statisch mit nginx ausliefern
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/site /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
