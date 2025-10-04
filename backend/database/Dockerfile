FROM mysql:8.0

# Set timezone
ENV TZ=America/Sao_Paulo

# Configure MySQL for UTF-8
ENV MYSQL_CHARSET=utf8mb4
ENV MYSQL_COLLATION=utf8mb4_unicode_ci

# Copy initialization scripts
COPY ./init/ /docker-entrypoint-initdb.d/

# Copy custom MySQL configuration
COPY ./my.cnf /etc/mysql/conf.d/custom.cnf

# Expose MySQL port
EXPOSE 3306