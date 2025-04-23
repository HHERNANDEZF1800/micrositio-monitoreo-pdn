FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV DB_HOST=mariadb_container
ENV DB_PORT=3306
ENV DB_NAME=registros_db
ENV DB_USER=registros_user
ENV DB_PASSWORD=password_segura

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]