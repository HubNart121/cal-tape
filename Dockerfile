# Stage 1: Serve the app with Nginx (using prebuilt dist)
FROM nginx:alpine

# Copy the build artifacts from the local dist folder
COPY dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
