FROM python:3.10-slim

WORKDIR /app

# Copy requirements and package setup
COPY requirements.txt pyproject.toml /app/

# Install base python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy and install the shared common package
COPY common/ /app/common/
RUN pip install --no-cache-dir .

# Copy the service specific files
COPY cog-svc/ /app/cog-svc/

# Set the working directory to the service
WORKDIR /app/cog-svc

# Expose port
EXPOSE 8000

# Start service
CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8000"]