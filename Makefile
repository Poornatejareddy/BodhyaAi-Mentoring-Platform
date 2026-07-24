.PHONY: init dev stop restart health clean test-integration

init:
	@echo "Initializing developer workspace..."
	./scripts/setup_project.sh

dev:
	@echo "Launching all services..."
	./scripts/run_project.sh

stop:
	@echo "Stopping all active processes..."
	./scripts/stop_project.sh

restart:
	@echo "Restarting services..."
	./scripts/restart_project.sh

health:
	@echo "Running health audit checks..."
	./scripts/health_check.sh

test-integration:
	@echo "Running automated integration tests..."
	./scripts/test_project.sh

clean:
	@echo "Cleaning runtime cache folders, logs, and process markers..."
	./scripts/clean_project.sh
