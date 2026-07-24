FROM python:3.10-slim

WORKDIR /app

# Copy requirements and package setup
COPY requirements.txt pyproject.toml /app/

# Install core dependencies (no local model weights needed)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy and install the shared common package
COPY common/ /app/common/
RUN pip install --no-cache-dir .

# Copy the service specific files
COPY llm-svc/ /app/llm-svc/

# Set the working directory to the service
WORKDIR /app/llm-svc

# Expose port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8003/health')" || exit 1

# Start service
CMD ["python", "run.py"]