#!/bin/bash
set -uo pipefail

exec > >(tee /var/log/mavarra-user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

AWS_REGION="${aws_region}"
CONTAINER_IMAGE="${container_image}"
CONTAINER_NAME="${container_name}"
HOST_PORT="${host_port}"
CONTAINER_PORT="${container_port}"
NODE_ENV_VALUE="${node_env}"
JWT_SECRET_NAME="${jwt_secret_name}"
MONGODB_URI_SECRET_NAME="${mongodb_uri_secret_name}"
MONGODB_DB_SECRET_NAME="${mongodb_db_secret_name}"
GHCR_USERNAME="${ghcr_username}"
GHCR_TOKEN_SECRET_NAME="${ghcr_token_secret_name}"
AUTH_ISSUER="${auth_issuer}"
APP_BASE_URL="${app_base_url}"

ENV_DIR="/etc/mavarra"
ENV_FILE="$ENV_DIR/mavarra.env"
SERVICE_FILE="/etc/systemd/system/mavarra.service"

REGISTRY=""
if [[ "$CONTAINER_IMAGE" == */* ]]; then
  CANDIDATE="${CONTAINER_IMAGE%%/*}"
  if [[ "$CANDIDATE" == *.* || "$CANDIDATE" == *:* || "$CANDIDATE" == "localhost" ]]; then
    REGISTRY="$CANDIDATE"
  fi
fi

log() {
  local message="$1"
  local timestamp
  timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  echo "[bootstrap] $timestamp $message"
}

run_step() {
  local step_name="$1"
  shift
  log "Starting: $step_name"
  if "$@"; then
    log "Completed: $step_name"
    return 0
  else
    local exit_code=$?
    log "FAILED ($exit_code): $step_name"
    return $exit_code
  fi
}

apt_update() {
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
}

install_prereqs() {
  export DEBIAN_FRONTEND=noninteractive
  apt-get install -y ca-certificates curl gnupg lsb-release unzip
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    return 0
  fi
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $VERSION_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
}

install_aws_cli() {
  if command -v aws >/dev/null 2>&1; then
    return 0
  fi
  tmp_dir=$(mktemp -d)
  pushd "$tmp_dir" >/dev/null
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip -q awscliv2.zip
  ./aws/install
  popd >/dev/null
  rm -rf "$tmp_dir"
}

fetch_secret() {
  local secret_name="$1"
  if [[ -z "$secret_name" ]]; then
    echo ""
    return 0
  fi
  aws secretsmanager get-secret-value \
    --region "$AWS_REGION" \
    --secret-id "$secret_name" \
    --query SecretString \
    --output text
}

write_env_file() {
  mkdir -p "$ENV_DIR"
  cat > "$ENV_FILE" <<EOF_ENV
IMAGE=$CONTAINER_IMAGE
CONTAINER_NAME=$CONTAINER_NAME
HOST_PORT=$HOST_PORT
CONTAINER_PORT=$CONTAINER_PORT
NODE_ENV=$NODE_ENV_VALUE
PORT=$CONTAINER_PORT
JWT_SECRET=$JWT_SECRET_VALUE
MONGODB_URI=$MONGODB_URI_VALUE
MONGODB_DB=$MONGODB_DB_VALUE
AUTH_ISSUER=$AUTH_ISSUER
APP_BASE_URL=$APP_BASE_URL
EOF_ENV
  chmod 600 "$ENV_FILE"
}

write_service_file() {
  cat > "$SERVICE_FILE" <<'EOF_SERVICE'
[Unit]
Description=Mavarra Web/API Container
After=network-online.target docker.service
Wants=network-online.target
Requires=docker.service

[Service]
Restart=always
RestartSec=5
EnvironmentFile=/etc/mavarra/mavarra.env
ExecStartPre=-/usr/bin/docker rm ${CONTAINER_NAME}
ExecStartPre=/usr/bin/docker pull ${IMAGE}
ExecStart=/usr/bin/docker run --rm \
  --name ${CONTAINER_NAME} \
  --env-file /etc/mavarra/mavarra.env \
  -p ${HOST_PORT}:${CONTAINER_PORT} \
  ${IMAGE}
ExecStop=/usr/bin/docker stop ${CONTAINER_NAME}

[Install]
WantedBy=multi-user.target
EOF_SERVICE
  chmod 644 "$SERVICE_FILE"
}

registry_login() {
  if [[ -z "$GHCR_TOKEN_VALUE" || -z "$REGISTRY" || -z "$GHCR_USERNAME" ]]; then
    return 0
  fi
  echo "$GHCR_TOKEN_VALUE" | docker login "$REGISTRY" --username "$GHCR_USERNAME" --password-stdin
}

start_service() {
  systemctl daemon-reload
  systemctl enable mavarra.service
  systemctl restart mavarra.service
}

run_step "APT update" apt_update
run_step "Install prerequisites" install_prereqs
run_step "Install Docker" install_docker
run_step "Install AWS CLI" install_aws_cli

JWT_SECRET_VALUE="$(fetch_secret "$JWT_SECRET_NAME")"
MONGODB_URI_VALUE="$(fetch_secret "$MONGODB_URI_SECRET_NAME")"
MONGODB_DB_VALUE="$(fetch_secret "$MONGODB_DB_SECRET_NAME")"
GHCR_TOKEN_VALUE="$(fetch_secret "$GHCR_TOKEN_SECRET_NAME")"

run_step "Write environment file" write_env_file
run_step "Install systemd unit" write_service_file
run_step "Registry login" registry_login || true
run_step "Start service" start_service

log "Bootstrap complete"
