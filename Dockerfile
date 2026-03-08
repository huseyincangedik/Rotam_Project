# Node.js'in hafif bir sürümünü kullanıyoruz
FROM node:22-alpine

# Konteyner içindeki çalışma dizinini belirliyoruz
WORKDIR /app

# Sadece paket dosyalarını kopyalayıp bağımlılıkları kuruyoruz (önbellek avantajı için)
COPY package*.json ./
RUN npm install

# Projenin geri kalan tüm dosyalarını kopyalıyoruz
COPY . .

# Vite'ın varsayılan portunu dışa açıyoruz
EXPOSE 5173

# Projeyi dışarıdan erişilebilir (--host) şekilde başlatıyoruz
CMD ["npm", "run", "dev", "--", "--host"]