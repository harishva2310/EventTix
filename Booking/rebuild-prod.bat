@echo on
call ./mvnw clean package -DskipTests
docker-compose down
docker rmi booking-bookingapp
set SPRING_PROFILES_ACTIVE=prod
docker-compose up -d -e SPRING_PROFILES_ACTIVE=prod