# Guía de Despliegue en AWS - Simpled

## Índice

1. [Preparación de la Instancia EC2](#1-preparación-de-la-instancia-ec2)
2. [Configuración del Servidor](#2-configuración-del-servidor)
3. [Configuración de Nginx](#3-configuración-de-nginx)
4. [Configuración de HTTPS con Certbot](#4-configuración-de-https-con-certbot)
5. [Despliegue del Backend](#5-despliegue-del-backend)
6. [Despliegue del Frontend](#6-despliegue-del-frontend)
7. [Configuración de Variables de Entorno](#7-configuración-de-variables-de-entorno)
8. [Monitoreo y Mantenimiento](#8-monitoreo-y-mantenimiento)

## 1. Preparación de la Instancia EC2

### 1.1 Crear Instancia EC2

- Acceder a la consola de AWS
- Seleccionar EC2 > Instances > Launch Instance
- Configuración recomendada:
  - Tipo de instancia: t2.micro (gratuito en tier gratuito)
  - AMI: Amazon Linux 2023
  - VPC: VPC por defecto
  - Almacenamiento: 30GB gp2

### 1.2 Configurar Security Groups

Crear un nuevo security group con las siguientes reglas:

```
Inbound Rules:
- SSH (22): 0.0.0.0/0 (tu IP)
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (5000): 0.0.0.0/0 (backend .NET)
- Custom TCP (3000): 0.0.0.0/0 (frontend Next.js)
```

### 1.3 Asignar IP Elástica

1. Ir a EC2 > Elastic IPs
2. Asignar nueva IP elástica
3. Asociar a la instancia EC2

## 2. Configuración del Servidor

### 2.1 Conexión SSH

```bash
ssh -i tu-key.pem ec2-user@tu-ip-elastica
```

### 2.2 Actualización del Sistema

```bash
sudo yum update -y
```

### 2.3 Instalación de Dependencias

```bash
# Instalar Node.js y npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18

# Instalar .NET SDK
sudo rpm -Uvh https://packages.microsoft.com/config/amazon/2/packages-microsoft-prod.rpm
sudo yum install -y dotnet-sdk-7.0

# Instalar Nginx
sudo yum install nginx -y
```

## 3. Configuración de Nginx

### 3.1 Configuración Frontend

```bash
sudo nano /etc/nginx/conf.d/frontend.conf
```

Contenido:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.2 Configuración Backend

```bash
sudo nano /etc/nginx/conf.d/backend.conf
```

Contenido:

```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.3 Iniciar Nginx

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 4. Configuración de HTTPS con Certbot

### 4.1 Instalación de Certbot

```bash
sudo yum install certbot python3-certbot-nginx -y
```

### 4.2 Obtención de Certificados SSL

```bash
sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com
```

## 5. Despliegue del Backend

### 5.1 Preparación del Directorio

```bash
mkdir ~/simpled-backend
cd ~/simpled-backend
git clone tu-repositorio-backend .
```

### 5.2 Publicación de la Aplicación

```bash
dotnet publish -c Release
```

### 5.3 Configuración del Servicio

```bash
sudo nano /etc/systemd/system/simpled-backend.service
```

Contenido:

```ini
[Unit]
Description=Simpled Backend

[Service]
WorkingDirectory=/home/ec2-user/simpled-backend/bin/Release/net7.0/publish
ExecStart=/usr/bin/dotnet /home/ec2-user/simpled-backend/bin/Release/net7.0/publish/Simpled.dll
Restart=always
RestartSec=10
SyslogIdentifier=simpled-backend
User=ec2-user
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

### 5.4 Iniciar Servicio

```bash
sudo systemctl start simpled-backend
sudo systemctl enable simpled-backend
```

## 6. Despliegue del Frontend

### 6.1 Preparación del Directorio

```bash
mkdir ~/simpled-frontend
cd ~/simpled-frontend
git clone tu-repositorio-frontend .
```

### 6.2 Construcción de la Aplicación

```bash
npm install
npm run build
```

### 6.3 Configuración del Servicio

```bash
sudo nano /etc/systemd/system/simpled-frontend.service
```

Contenido:

```ini
[Unit]
Description=Simpled Frontend

[Service]
WorkingDirectory=/home/ec2-user/simpled-frontend
ExecStart=/home/ec2-user/.nvm/versions/node/v18.x.x/bin/npm start
Restart=always
RestartSec=10
SyslogIdentifier=simpled-frontend
User=ec2-user
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 6.4 Iniciar Servicio

```bash
sudo systemctl start simpled-frontend
sudo systemctl enable simpled-frontend
```

## 7. Configuración de Variables de Entorno

### 7.1 Backend

Editar el archivo de servicio del backend para incluir las variables de entorno necesarias:

```bash
sudo nano /etc/systemd/system/simpled-backend.service
```

### 7.2 Frontend

Editar el archivo de servicio del frontend para incluir las variables de entorno necesarias:

```bash
sudo nano /etc/systemd/system/simpled-frontend.service
```

## 8. Monitoreo y Mantenimiento

### 8.1 Verificación de Logs

```bash
# Logs del Backend
sudo journalctl -u simpled-backend

# Logs del Frontend
sudo journalctl -u simpled-frontend

# Logs de Nginx
sudo journalctl -u nginx
```

### 8.2 Reinicio de Servicios

```bash
sudo systemctl restart simpled-backend
sudo systemctl restart simpled-frontend
sudo systemctl restart nginx
```

## Consideraciones Importantes

### Seguridad

- Mantener actualizado el sistema operativo
- Configurar correctamente los Security Groups
- Usar contraseñas fuertes
- Mantener las claves SSH seguras

### Backup

- Configurar backups automáticos de la base de datos
- Mantener copias de seguridad de los archivos de configuración

### Monitoreo

- Configurar CloudWatch para monitorear la instancia
- Configurar alertas para uso de CPU, memoria y disco

### Escalabilidad

- Considerar el uso de un balanceador de carga si es necesario
- Configurar auto-scaling según necesidades

## Solución de Problemas

### Verificar Estado de Servicios

```bash
sudo systemctl status simpled-backend
sudo systemctl status simpled-frontend
sudo systemctl status nginx
```

### Verificar Logs de Error

```bash
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u simpled-backend -f
sudo journalctl -u simpled-frontend -f
```

### Verificar Puertos

```bash
sudo netstat -tulpn | grep LISTEN
```

## Recursos Adicionales

- [Documentación de AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentación de Nginx](https://nginx.org/en/docs/)
- [Documentación de .NET](https://docs.microsoft.com/en-us/dotnet/)
- [Documentación de Next.js](https://nextjs.org/docs)
