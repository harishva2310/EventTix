@echo on
call ./mvnw clean package -DskipTests
docker-compose down
docker rmi event-eventapp
set SPRING_PROFILES_ACTIVE=dev
docker-compose up -d