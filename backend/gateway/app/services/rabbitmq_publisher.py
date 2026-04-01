from __future__ import annotations

import json
from typing import Any

import aio_pika

from app.config import settings
from _common.schemas.vacancy_index import CvIndexPayload, VacancyIndexPayload


async def _publish_message(routing_key: str, payload: dict[str, Any]) -> None:
    """
    Publish a JSON payload to RabbitMQ.

    Uses a topic exchange so different consumers can subscribe by routing key.
    """
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    try:
        channel = await connection.channel()

        exchange = await channel.declare_exchange(
            settings.rabbitmq_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )

        body = json.dumps(payload).encode("utf-8")
        message = aio_pika.Message(body=body, delivery_mode=aio_pika.DeliveryMode.PERSISTENT)

        await exchange.publish(message, routing_key=routing_key)
    finally:
        await connection.close()


async def publish_cv_index(payload: CvIndexPayload) -> None:
    """
    Send a CV index update event for asynchronous processing by the RAG index service.
    """
    data = payload.model_dump(mode="json")
    await _publish_message(settings.rabbitmq_cv_index_routing_key, data)


async def publish_vacancy_index(payload: VacancyIndexPayload | dict[str, Any]) -> None:
    """
    Send a vacancy index update event for asynchronous processing by the RAG index service.
    Accepts either a Pydantic payload or a plain dict (for convenience in gateway routes).
    """
    if isinstance(payload, VacancyIndexPayload):
        data = payload.model_dump(mode="json")
    else:
        data = dict(payload)
    await _publish_message(settings.rabbitmq_vacancy_index_routing_key, data)


