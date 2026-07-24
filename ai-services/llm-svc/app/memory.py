"""Best-effort conversation memory for the LLM service.

Memory must never prevent an AI response. The connection string is supplied by
deployment configuration; no database credentials belong in source code.
"""
import logging
import os

from pymongo import MongoClient
from pymongo.errors import PyMongoError

logger = logging.getLogger(__name__)

_client = MongoClient(
    os.getenv(
        "LLM_MEMORY_MONGO_URI",
        os.getenv("MONGO_URI", "mongodb://localhost:27017/bodhyai"),
    ),
    serverSelectionTimeoutMS=int(os.getenv("MONGO_SERVER_SELECTION_TIMEOUT_MS", "3000")),
)
_conversations = _client[os.getenv("LLM_MEMORY_DB", "bodhyai")]["conversations"]


def save_message(user_id: str, role: str, message: str, reply: str) -> None:
    try:
        _conversations.insert_one({
            "userId": user_id,
            "role": role,
            "message": message,
            "reply": reply,
        })
    except PyMongoError as error:
        logger.warning("Conversation memory write skipped: %s", error)


def get_recent(user_id: str, limit: int = 3) -> list[str]:
    try:
        messages = _conversations.find({"userId": user_id}).sort("_id", -1).limit(limit)
        return [f"User: {message['message']} | Bot: {message['reply']}" for message in messages]
    except PyMongoError as error:
        logger.warning("Conversation memory read skipped: %s", error)
        return []
