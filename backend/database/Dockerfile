FROM mysql:8.0

# Set timezone
ENV TZ=America/Sao_Paulo

# Copy initialization scripts
COPY ./init/ /docker-entrypoint-initdb.d/

# Expose MySQL port
EXPOSE 3306