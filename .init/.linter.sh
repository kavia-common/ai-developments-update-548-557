#!/bin/bash
cd /home/kavia/workspace/code-generation/ai-developments-update-548-557/ai_developments_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

