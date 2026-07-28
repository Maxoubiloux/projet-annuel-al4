use std::env;
use dotenv::dotenv;

#[derive(Debug, Clone)]
pub struct Config {
    pub rabbitmq_url: String,
    pub request_queue: String,
    pub response_queue: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenv().ok();

        let rabbitmq_url = env::var("RABBITMQ_URL")
            .unwrap_or_else(|_| "amqp://user:password@localhost:5672/".to_string());
        
        let request_queue = env::var("RABBITMQ_REQUEST_QUEUE")
            .unwrap_or_else(|_| "backend_to_worker_queue".to_string());
            
        let response_queue = env::var("RABBITMQ_RESPONSE_QUEUE")
            .unwrap_or_else(|_| "worker_to_backend_queue".to_string());

        Config {
            rabbitmq_url,
            request_queue,
            response_queue,
        }
    }
}
