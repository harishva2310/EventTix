@echo on
call ./mvnw clean package -DskipTests
docker-compose down
docker rmi bookingnotificationservice-bookingnotificationapp
set SPRING_PROFILES_ACTIVE=dev
docker-compose up -d