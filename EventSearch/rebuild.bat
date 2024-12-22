@echo on
call ./mvnw clean package -DskipTests
docker-compose down
docker rmi eventsearch-eventsearchapp
docker-compose up -d