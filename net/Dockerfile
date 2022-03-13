FROM python:slim

COPY . .
RUN pip install -r requirements.txt

EXPOSE 8081

CMD ["python", "src/app.py"]