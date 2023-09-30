#!/bin/bash

#ask the user for input
read -p "Enter your status: " input

# Send a POST request using curl with the entered status
curl -X POST -H "Content-Type: application/json" -d "{\"status\":\"$input\"}" http://localhost/api/status

# Print a newline for clarity after the curl response
echo
