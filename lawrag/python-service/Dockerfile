FROM python:3.10.19-slim

WORKDIR /app

# Install system dependencies for Milvus/other libs if needed
RUN apt-get update  && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.config/pip && \
    echo "[global]" > /root/.config/pip/pip.conf && \
    echo "index-url = https://mirrors.aliyun.com/pypi/simple/" >> /root/.config/pip/pip.conf && \
    echo "timeout = 300" >> /root/.config/pip/pip.conf && \
    echo "retries = 10" >> /root/.config/pip/pip.conf



COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
