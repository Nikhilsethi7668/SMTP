import asyncio
import os # NEW: Import os for environment variables
from typing import Dict
from .logic import make_policy_decision # Assuming 'logic' module exists and contains this function

# --- Configuration ---
# UPDATED: Read port from environment variable, defaulting to 10030.
# This allows overriding the port for debugging (e.g., using POLICY_SERVER_PORT=10031)
POLICY_SERVER_PORT = int(os.getenv('POLICY_SERVER_PORT', 10030))

def parse_postfix_data(raw_data: str) -> Dict[str, str]:
    """Converts Postfix name=value\n... format to a Python dictionary."""
    data = {}
    for line in raw_data.strip().split('\n'):
        if '=' in line:
            name, value = line.split('=', 1)
            data[name.strip()] = value.strip()
    return data

async def handle_postfix_request(reader, writer):
    raw_data = ""
    # Postfix sends data line by line, terminated by an empty line
    while True:
        line = await reader.readline()
        if not line: # Connection closed
            break
        
        raw_line = line.decode('utf-8').strip()
        if not raw_line: # Empty line signals end of request
            break
        raw_data += raw_line + '\n'

    # 1. Parse the request
    parsed_request = parse_postfix_data(raw_data)
    
    # 2. Get the decision from the core logic
    decision_map = make_policy_decision(parsed_request)
    
    # 3. Format the Postfix response
    response = ""
    for key, value in decision_map.items():
        # Postfix response format is name=value\n
        response += f"{key}={value}\n"
    
    response += "\n" # Termination empty line

    # 4. Write the response back to Postfix
    writer.write(response.encode('utf-8'))
    await writer.drain()
    
    # Postfix expects the policy server to stay open for multiple queries
    # DO NOT close the writer here unless you want to terminate the persistent connection.
    # writer.close() 

async def main():
    try:
        server = await asyncio.start_server(
            handle_postfix_request, '0.0.0.0', POLICY_SERVER_PORT)
        
        host = server.sockets[0].getsockname()
        print(f"Postfix Policy TCP Server listening on {host}")
        
        async with server:
            await server.serve_forever()
            
    except ConnectionRefusedError:
        print("Error: Postfix not able to connect to the policy service.")
    except OSError as e:
        # IMPROVED: Specifically handle the "address already in use" error (Errno 98)
        if e.errno == 98:
            print(f"An error occurred in the policy server: [Errno 98] error while attempting to bind on address ('0.0.0.0', {POLICY_SERVER_PORT}): address already in use")
        else:
            print(f"An OS error occurred in the policy server: {e}")
    except Exception as e:
        print(f"An unexpected error occurred in the policy server: {e}")

if __name__ == "__main__":
    # Ensure this script is the command executed by the Dockerfile CMD
    asyncio.run(main())