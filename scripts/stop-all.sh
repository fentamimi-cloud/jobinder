
pkill -f "react-scripts"
pkill -f "ts-node"
cd /Users/shmunika/Documents/software/ai-projects/jobinder && docker-compose -f docker-compose.dev.yml down
ps aux | grep -E "(node|npm|react|ts-node|docker)" | grep -v grep
lsof -i :3000 :3001 :5432 :6379 :8080 :9200 | head -10
lsof -i :3000 2>/dev/null || echo "Port 3000: Clear"
