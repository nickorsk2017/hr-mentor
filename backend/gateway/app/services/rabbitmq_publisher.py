from __future__ import annotations

import json
import logging
from typing import Any

import aio_pika

from app.config import settings
from _common.schemas.vacancy_index import CvIndexPayload, VacancyIndexPayload

logger = logging.getLogger(__name__)

async def _emit_message(routing_key: str, payload: dict[str, Any]) -> None:
    connection = None

    try:
        connection = await aio_pika.connect_robust(settings.rabbitmq_url)
        channel = await connection.channel()

        exchange = await channel.declare_exchange(
            settings.rabbitmq_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )

        body = json.dumps(payload).encode("utf-8")
        message = aio_pika.Message(body=body, delivery_mode=aio_pika.DeliveryMode.PERSISTENT)

        await exchange.publish(message, routing_key=routing_key)
    except Exception:  # noqa: BLE001
        logger.exception("Failed publishing message to RabbitMQ routing_key=%s payload=%s", routing_key, payload)
    finally:
        if connection:
         await connection.close()


async def publish_cv_index(payload: CvIndexPayload) -> None:
    data = payload.model_dump(mode="json")
    await _emit_message(settings.rabbitmq_cv_index_routing_key, data)


async def publish_vacancy_index(payload: VacancyIndexPayload | dict[str, Any]) -> None:
    if isinstance(payload, VacancyIndexPayload):
        data = payload.model_dump(mode="json")
    else:
        data = dict(payload)

    await _emit_message(settings.rabbitmq_vacancy_index_routing_key, data)


