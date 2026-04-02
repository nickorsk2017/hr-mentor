from __future__ import annotations

import json
import logging
from typing import Any

import aio_pika
from aio_pika.abc import AbstractExchange, AbstractIncomingMessage

from _common.schemas.vacancy_index import (
    CvIndexDeletePayload,
    CvIndexPayload,
    VacancyIndexDeletePayload,
    VacancyIndexPayload,
)
from app.config import settings
from app.services import cv_vector_index_service, vacancy_vector_index_service

logger = logging.getLogger(__name__)


class RabbitMQSubscriber:
    def __init__(self) -> None:
        self.connection: aio_pika.RobustConnection | None = None
        self.channel: aio_pika.abc.AbstractChannel | None = None

    async def start(self) -> None:
        logger.info("RabbitMQ subscriber starting")
        self.connection = await aio_pika.connect_robust(settings.rabbitmq_url)
        self.channel = await self.connection.channel()

        exchange = await self.channel.declare_exchange(
            settings.rabbitmq_exchange,
            aio_pika.ExchangeType.TOPIC,
            durable=True,
        )

        await self._subscribe_cv_index(exchange)
        await self._subscribe_vacancy_index(exchange)
        await self._subscribe_cv_index_delete(exchange)
        await self._subscribe_vacancy_index_delete(exchange)

        logger.info(
            "RabbitMQ subscriber ready exchange=%s cv_queue=%s vacancy_queue=%s "
            "cv_delete_queue=%s vacancy_delete_queue=%s",
            settings.rabbitmq_exchange,
            settings.rabbitmq_cv_index_queue,
            settings.rabbitmq_vacancy_index_queue,
            settings.rabbitmq_cv_index_delete_queue,
            settings.rabbitmq_vacancy_index_delete_queue,
        )

    async def stop(self) -> None:
        logger.info("RabbitMQ subscriber stopping")
        if self.channel and not self.channel.is_closed:
            await self.channel.close()
        if self.connection and not self.connection.is_closed:
            await self.connection.close()
        logger.info("RabbitMQ subscriber stopped")

    async def _subscribe_cv_index(self, exchange: AbstractExchange) -> None:
        assert self.channel is not None
        queue = await self.channel.declare_queue(settings.rabbitmq_cv_index_queue, durable=True)
        await queue.bind(exchange, routing_key=settings.rabbitmq_cv_index_routing_key)
        await queue.consume(self._on_cv_index_message, no_ack=False)

    async def _subscribe_vacancy_index(self, exchange: AbstractExchange) -> None:
        assert self.channel is not None
        queue = await self.channel.declare_queue(
            settings.rabbitmq_vacancy_index_queue,
            durable=True,
        )
        await queue.bind(exchange, routing_key=settings.rabbitmq_vacancy_index_routing_key)
        await queue.consume(self._on_vacancy_index_message, no_ack=False)

    async def _subscribe_cv_index_delete(self, exchange: AbstractExchange) -> None:
        assert self.channel is not None
        queue = await self.channel.declare_queue(
            settings.rabbitmq_cv_index_delete_queue,
            durable=True,
        )
        await queue.bind(exchange, routing_key=settings.rabbitmq_cv_index_delete_routing_key)
        await queue.consume(self._on_cv_index_delete_message, no_ack=False)

    async def _subscribe_vacancy_index_delete(self, exchange: AbstractExchange) -> None:
        assert self.channel is not None
        queue = await self.channel.declare_queue(
            settings.rabbitmq_vacancy_index_delete_queue,
            durable=True,
        )
        await queue.bind(
            exchange,
            routing_key=settings.rabbitmq_vacancy_index_delete_routing_key,
        )
        await queue.consume(self._on_vacancy_index_delete_message, no_ack=False)

    async def _on_cv_index_message(self, message: AbstractIncomingMessage) -> None:
        payload: dict[str, Any] | None = None
        try:
            payload = self._decode_body(message.body)
            event = CvIndexPayload.model_validate(payload)
            await cv_vector_index_service.add_to_index(event)
            logger.info("Processed cv index event user_id=%s", event.user_id)
            await message.ack()
        except Exception:  # noqa: BLE001
            logger.exception("Failed processing cv index event payload=%s", payload)
            await message.reject(requeue=False)

    async def _on_vacancy_index_message(self, message: AbstractIncomingMessage) -> None:
        payload: dict[str, Any] | None = None
        try:
            payload = self._decode_body(message.body)
            event = VacancyIndexPayload.model_validate(payload)
            await vacancy_vector_index_service.add_vacancy_to_index(event)
            logger.info(
                "Processed vacancy index event user_id=%s vacancy_id=%s",
                event.user_id,
                event.vacancy_id,
            )
            await message.ack()
        except Exception:  # noqa: BLE001
            logger.exception("Failed processing vacancy index event payload=%s", payload)
            await message.reject(requeue=False)

    async def _on_cv_index_delete_message(self, message: AbstractIncomingMessage) -> None:
        payload: dict[str, Any] | None = None
        try:
            payload = self._decode_body(message.body)
            event = CvIndexDeletePayload.model_validate(payload)
            await cv_vector_index_service.delete_cv_index(event.user_id)
            logger.info("Processed cv index delete event user_id=%s", event.user_id)
            await message.ack()
        except Exception:  # noqa: BLE001
            logger.exception("Failed processing cv index delete event payload=%s", payload)
            await message.reject(requeue=False)

    async def _on_vacancy_index_delete_message(self, message: AbstractIncomingMessage) -> None:
        payload: dict[str, Any] | None = None
        try:
            payload = self._decode_body(message.body)
            event = VacancyIndexDeletePayload.model_validate(payload)
            await vacancy_vector_index_service.delete_vacancy_index(event.vacancy_id)
            logger.info("Processed vacancy index delete event vacancy_id=%s", event.vacancy_id)
            await message.ack()
        except Exception:  # noqa: BLE001
            logger.exception("Failed processing vacancy index delete event payload=%s", payload)
            await message.reject(requeue=False)

    @staticmethod
    def _decode_body(body: bytes) -> dict[str, Any]:
        decoded = json.loads(body.decode("utf-8"))
        if not isinstance(decoded, dict):
            raise ValueError("RabbitMQ payload must be a JSON object")
        return decoded

