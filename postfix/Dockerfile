FROM debian:bullseye-slim

# Install Postfix + networking tools
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        postfix \
        curl \
        iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Default environment variables (can be overridden by .env)
ENV POSTFIX_MYHOSTNAME=relay.example.com \
    POSTFIX_MYDOMAIN=example.com \
    POSTFIX_MYDESTINATION= \
    POSTFIX_INET_PROTOCOLS=ipv4 \
    POLICY_SERVICE_HOST=policy-service \
    POLICY_SERVICE_PORT=10030

# Copy configs
COPY main.cf /etc/postfix/
COPY master.cf /etc/postfix/

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["postfix", "start-fg"]
