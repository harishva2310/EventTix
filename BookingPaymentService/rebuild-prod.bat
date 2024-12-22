@echo on
call ./mvnw clean package -DskipTests
docker-compose down
docker rmi bookingpaymentservice-paymentapp
set SPRING_PROFILES_ACTIVE=prod
docker-compose up -d