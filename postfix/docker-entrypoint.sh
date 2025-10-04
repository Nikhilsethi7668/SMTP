#!/bin/bash
# postfix/docker-entrypoint.sh

set -e

# 1️⃣ Ensure required environment variables are set
: "${POSTFIX_MYHOSTNAME:?POSTFIX_MYHOSTNAME not set}"
: "${POSTFIX_MYDOMAIN:?POSTFIX_MYDOMAIN not set}"
POSTFIX_MYDESTINATION=${POSTFIX_MYDESTINATION:-}   # Allow empty
: "${POSTFIX_INET_PROTOCOLS:?POSTFIX_INET_PROTOCOLS not set}"
: "${POLICY_SERVICE_HOST:?POLICY_SERVICE_HOST not set}"
: "${POLICY_SERVICE_PORT:?POLICY_SERVICE_PORT not set}"

echo "Configuring Postfix with hostname: $POSTFIX_MYHOSTNAME"
echo "Using policy service: $POLICY_SERVICE_HOST:$POLICY_SERVICE_PORT"

# 2️⃣ Replace placeholders in main.cf
sed -i "s|\${POSTFIX_MYHOSTNAME}|$POSTFIX_MYHOSTNAME|g" /etc/postfix/main.cf
sed -i "s|\${POSTFIX_MYDOMAIN}|$POSTFIX_MYDOMAIN|g" /etc/postfix/main.cf
sed -i "s|\${POSTFIX_MYDESTINATION}|$POSTFIX_MYDESTINATION|g" /etc/postfix/main.cf
sed -i "s|\${POSTFIX_INET_PROTOCOLS}|$POSTFIX_INET_PROTOCOLS|g" /etc/postfix/main.cf

# 3️⃣ Replace policy service placeholders in configs
sed -i "s|POLICY_SERVICE_HOST_PLACEHOLDER|$POLICY_SERVICE_HOST|g" /etc/postfix/main.cf
sed -i "s|POLICY_SERVICE_HOST_PLACEHOLDER|$POLICY_SERVICE_HOST|g" /etc/postfix/master.cf
sed -i "s|10030|$POLICY_SERVICE_PORT|g" /etc/postfix/main.cf
sed -i "s|10030|$POLICY_SERVICE_PORT|g" /etc/postfix/master.cf

# 4️⃣ Ensure required directories exist
mkdir -p /var/spool/postfix /var/log
chown -R postfix:postfix /var/spool/postfix /var/log

# 5️⃣ Start Postfix in foreground
exec postfix start-fg
