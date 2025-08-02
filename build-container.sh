#!/bin/bash
podman manifest create receptionist-bot
podman build --platform linux/amd64,linux/arm64  -f dockerfile --manifest receptionist-bot