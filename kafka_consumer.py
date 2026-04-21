import os
import json
import logging
from dotenv import load_dotenv
from kafka import KafkaConsumer

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("swms-consumer")

# Load environment variables
load_dotenv()

BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
USER = os.getenv("KAFKA_USER")
PASS = os.getenv("KAFKA_PASS")
TOPIC = os.getenv("KAFKA_TOPIC", "waste.bin.telemetry")

def run_consumer():
    logger.info(f"🚀 Starting SWMS Application Consumer...")
    logger.info(f"Connecting to Kafka at {BROKER}...")
    
    try:
        # Initialize the Consumer
        # Note: We use SASL_PLAINTEXT because the EKS cluster is configured with SCRAM-SHA-256
        consumer = KafkaConsumer(
            TOPIC,
            bootstrap_servers=[BROKER],
            security_protocol="SASL_PLAINTEXT",
            sasl_mechanism="SCRAM-SHA-256",
            sasl_plain_username=USER,
            sasl_plain_password=PASS,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='swms-app-group',
            value_deserializer=lambda v: json.loads(v.decode('utf-8'))
        )
        
        logger.info(f"✅ Successfully subscribed to topic: {TOPIC}")
        logger.info("Waiting for messages... (Run the simulator to see data flow)")

        for message in consumer:
            payload = message.value
            logger.info("--- New Message Received ---")
            logger.info(f"Topic: {message.topic}")
            logger.info(f"Key: {message.key.decode('utf-8') if message.key else 'None'}")
            
            # Print the data in a pretty format
            print(json.dumps(payload, indent=2))
            
            # Example logic: Trigger alert if bin is nearly full
            fill_level = payload.get("payload", {}).get("sensors", {}).get("fill_level_percent", 0)
            if fill_level > 80:
                logger.warning(f"🚨 ALERT: Bin {message.key.decode('utf-8')} is {fill_level}% full!")

    except Exception as e:
        logger.error(f"❌ Kafka Error: {e}")
        logger.info("TIP: Make sure you are running 'kubectl port-forward svc/kafka 9092:9092 -n messaging'")

if __name__ == "__main__":
    run_consumer()
