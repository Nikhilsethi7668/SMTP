# policy-service/Dockerfile
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy dependencies and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY app/ ./app/

# Run the Policy TCP Server on port 10030
# Note: This is the TCP server script, NOT uvicorn/gunicorn
CMD ["python", "-m", "app.main"]