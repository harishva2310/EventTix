@echo on
call ./mvnw clean package -DskipTests
docker-compose down
docker rmi ticket-ticketapp
set SPRING_PROFILES_ACTIVE=dev
docker-compose up -d --build