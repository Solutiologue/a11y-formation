#!/bin/bash

# Docker Management Script

set -e

COMPOSE_FILE=${COMPOSE_FILE:-"docker-compose.yml"}

case "$1" in
    # View logs
    logs)
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            docker-compose -f $COMPOSE_FILE logs -f --tail=100
        else
            docker-compose -f $COMPOSE_FILE logs -f --tail=100 $SERVICE
        fi
        ;;

    # Stop all services
    stop)
        echo "Stopping services..."
        docker-compose -f $COMPOSE_FILE stop
        echo "✓ Services stopped"
        ;;

    # Start all services
    start)
        echo "Starting services..."
        docker-compose -f $COMPOSE_FILE start
        echo "✓ Services started"
        ;;

    # Restart services
    restart)
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            echo "Restarting all services..."
            docker-compose -f $COMPOSE_FILE restart
            echo "✓ All services restarted"
        else
            echo "Restarting $SERVICE..."
            docker-compose -f $COMPOSE_FILE restart $SERVICE
            echo "✓ $SERVICE restarted"
        fi
        ;;

    # Backup database
    backup)
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_FILE="backups/backup_${TIMESTAMP}.sql"
        mkdir -p backups
        
        echo "Creating database backup..."
        docker-compose -f $COMPOSE_FILE exec -T db mysqldump -uroot -p${DB_ROOT_PASSWORD} ${DB_NAME} > $BACKUP_FILE
        echo "✓ Backup created: $BACKUP_FILE"
        ;;

    # Restore database
    restore)
        if [ -z "$2" ]; then
            echo "Usage: ./docker-manage.sh restore <backup_file>"
            exit 1
        fi
        
        if [ ! -f "$2" ]; then
            echo "✗ Backup file not found: $2"
            exit 1
        fi
        
        echo "Restoring database from $2..."
        docker-compose -f $COMPOSE_FILE exec -T db mysql -uroot -p${DB_ROOT_PASSWORD} ${DB_NAME} < $2
        echo "✓ Database restored"
        ;;

    # Run migrations
    migrate)
        echo "Running database migrations..."
        docker-compose -f $COMPOSE_FILE exec backend npx prisma migrate deploy
        echo "✓ Migrations completed"
        ;;

    # Open Shell in container
    shell)
        SERVICE=${2:-"backend"}
        echo "Opening shell in $SERVICE..."
        docker-compose -f $COMPOSE_FILE exec $SERVICE sh
        ;;

    # Show status
    status)
        docker-compose -f $COMPOSE_FILE ps
        ;;

    # Show resource usage
    stats)
        docker stats
        ;;

    # Clean up
    clean)
        echo "Cleaning up Docker resources..."
        docker system prune -f
        echo "✓ Cleaned up"
        ;;

    # Help
    *)
        echo "Docker Management Script"
        echo ""
        echo "Usage: ./docker-manage.sh <command> [options]"
        echo ""
        echo "Commands:"
        echo "  logs [service]        - View logs (all or specific service)"
        echo "  stop                  - Stop all services"
        echo "  start                 - Start all services"
        echo "  restart [service]     - Restart services"
        echo "  backup                - Backup database"
        echo "  restore <file>        - Restore database from backup"
        echo "  migrate               - Run database migrations"
        echo "  shell [service]       - Open shell in container (default: backend)"
        echo "  status                - Show container status"
        echo "  stats                 - Show resource usage"
        echo "  clean                 - Clean up Docker resources"
        echo ""
        ;;
esac
