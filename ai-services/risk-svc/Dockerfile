# Stage 1: Build stage with build dependencies
FROM python:3.9-slim as builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN pip install --no-cache-dir --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Stage 2: Final stage with runtime dependencies
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /app /app

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8000"]