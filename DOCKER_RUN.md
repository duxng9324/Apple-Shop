# AppleShop Docker Run

## Run all services

```bash
docker compose up --build -d
```

Services:
- Frontend: http://localhost:3000
- Java Backend: http://localhost:8081
- Chatbot API: http://localhost:8000/ai
- MySQL: localhost:3307
- Redis: localhost:6379

## Stop

```bash
docker compose down
```

## Reset data volumes

```bash
docker compose down -v
```

## Notes

- Chatbot is configured to call Ollama at `http://host.docker.internal:11434/api/generate`.
- If your Ollama endpoint or model is different, edit `docker-compose.yml` in the `chatbot.environment` section.
- MySQL host port is mapped to `3307` to avoid conflicts when local MySQL is already using `3306`.
