#!/bin/bash
cd /home/kavia/workspace/code-generation/collaborate-ai-platform-287250-287259/react_tailwind_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

