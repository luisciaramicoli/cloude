# Usar uma imagem base oficial e leve do Python
FROM python:3.12-slim

# Definir a pasta de trabalho dentro do container
WORKDIR /app

# Copiar apenas o arquivo de dependencias primeiro (para aproveitar o cache do Docker)
COPY requirements.txt .

# Instalar as dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o codigo fonte do projeto para dentro do container
COPY . .

# Informar qual porta o container usa (a porta que configuramos no Flask)
EXPOSE 1755

# Comando padrao para iniciar a aplicacao
CMD ["python", "app.py"]
