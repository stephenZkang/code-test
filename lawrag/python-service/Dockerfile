FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for Milvus/other libs if needed
RUN apt-get update  -o Acquire::Sources::List="deb https://mirrors.aliyun.com/debian/ bookworm main contrib non-free non-free-firmware; deb https://mirrors.aliyun.com/debian-security/ bookworm-security main contrib non-free non-free-firmware; deb https://mirrors.aliyun.com/debian/ bookworm-updates main contrib non-free non-free-firmware" \
    && apt-get install -y \
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
