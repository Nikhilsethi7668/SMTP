# Use latest Alpine
FROM alpine:3.18

# Install Postfix and bash
RUN apk update && apk add --no-cache postfix bash openssl

# Set working directory
WORKDIR /etc/postfix

# Copy configuration files
COPY main.cf /etc/postfix/main.cf
COPY master.cf /etc/postfix/master.cf

# Optional TLS
# COPY certs/postfix.crt /etc/ssl/certs/postfix.crt
# COPY certs/postfix.key /etc/ssl/private/postfix.key

# Expose SMTP port
EXPOSE 25

# Start Postfix in foreground
CMD ["sh", "-c", "postfix start-fg"]
