#!/bin/bash
echo "=== JOBINDER DEVELOPMENT STATUS ===" && echo "" && echo "🔍 Infrastructure Services:" && curl -s http://localhost:9200 >/dev/null && echo "✅ Elasticsearch: localhost:9200" || echo "❌ Elasticsearch: Not accessible" && curl -s http://localhost:8080 >/dev/null && echo "✅ Adminer: localhost:8080" || echo "❌ Adminer: Not accessible" && curl -s http://localhost:8025 >/dev/null && echo "✅ MailHog: localhost:8025" || echo "❌ MailHog: Not accessible" && curl -s http://localhost:9001 >/dev/null && echo "✅ MinIO: localhost:9001" || echo "❌ MinIO: Not accessible" && echo "" && echo "🔌 Ports in use:" && lsof -i -P | grep LISTEN | grep -E ":(3000|3001|5432|6379|8025|8080|9000|9001|9200)" | awk '{print $1, $9}' | sort -u

# frontend status
curl -s http://localhost:3000 >/dev/null && echo "🎉 SUCCESS: Frontend is running at http://localhost:3000" && echo "🔍 Testing accessibility..." && curl -s "http://localhost:3000" | grep -q "Jobinder" && echo "✅ Jobinder app is loaded and ready!"
