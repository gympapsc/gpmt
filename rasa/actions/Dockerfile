FROM rasa/rasa-sdk:3.0.5

WORKDIR /app/actions
USER root
COPY . .
RUN pip install -r ./requirements.txt

WORKDIR /app
USER 1001
