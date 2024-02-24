import logging

# Create a logger instance with a unique name
logger = logging.getLogger("fastotate")

# Set the logger's minimum logging level (e.g., DEBUG, INFO, WARNING, ERROR, CRITICAL)
logger.setLevel(logging.DEBUG)

# Create a console handler to log messages to the console (optional)
console_handler = logging.StreamHandler()

# Define the logging format
formatter = logging.Formatter(
    "[%(asctime)s] p%(process)s {%(pathname)s:%(lineno)d} %(levelname)s - %(message)s",
    "%m-%d %H:%M:%S",
)
console_handler.setFormatter(formatter)

logger.addHandler(console_handler)  # Optional for logging to the console
