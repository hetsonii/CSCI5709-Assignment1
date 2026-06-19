FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root1234
ENV MYSQL_DATABASE=tenanttrails

COPY init.sql /docker-entrypoint-initdb.d/init.sql