# Use a slim Python image as a base
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip -r /app/requirements.txt

# Copy the application code into the container
COPY . /app

# The command to run when the container starts
# The host must be 0.0.0.0 to be accessible from other containers
CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8001"]