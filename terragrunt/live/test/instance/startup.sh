#!/bin/bash
sudo exec > /tmp/startup-script.log 2>&1
sed -i 's/\r$//' /tmp/metadata-scripts/startup-script
sudo apt-get update
sudo apt-get install -y git docker.io 
sudo systemctl start docker
sudo rm -f /usr/local/bin/docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo git clone --branch Development https://github.com/BramVerbeirenPXL/IT-Project-Team-07.git /home/repo
cd /home/repo
sudo touch frontend/web/.env
export REACT_APP_EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
sudo chmod 666 frontend/web/.env
sudo echo "REACT_APP_EXTERNAL_IP=${REACT_APP_EXTERNAL_IP}" > frontend/web/.env
sudo find . -type f -name "*.js" -exec sed -i 's|../../../shared|/app/shared|g' {} +
sudo mv Docker-compose.yaml docker-compose.yaml
envsubst < docker-compose.yaml | sudo docker-compose -f - up --build