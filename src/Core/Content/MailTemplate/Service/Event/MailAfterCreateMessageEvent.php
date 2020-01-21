<?php declare(strict_types=1);

namespace Shopware\Core\Content\MailTemplate\Service\Event;

use Monolog\Logger;
use Shopware\Core\Content\MailTemplate\MailTemplateEntity;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\Event\BusinessEventInterface;
use Shopware\Core\Framework\Event\EventData\ArrayType;
use Shopware\Core\Framework\Event\EventData\EventDataCollection;
use Shopware\Core\Framework\Event\EventData\ObjectType;
use Shopware\Core\Framework\Event\EventData\ScalarValueType;
use Shopware\Core\Framework\Log\LogAwareBusinessEventInterface;
use Symfony\Contracts\EventDispatcher\Event;

class MailAfterCreateMessageEvent extends Event implements BusinessEventInterface, LogAwareBusinessEventInterface
{
    public const EVENT_NAME = 'mail.after.create.message';

    /**
     * @var array
     */
    private $data;

    /**
     * @var \Swift_Message
     */
    private $message;

    /**
     * @var Context
     */
    private $context;

    /**
     * @var MailTemplateEntity
     */
    private $mailTemplate;

    public function __construct(array $data, \Swift_Message $message, Context $context, MailTemplateEntity $mailTemplate = null)
    {
        $this->data = $data;
        $this->message = $message;
        $this->context = $context;
        $this->mailTemplate = $mailTemplate;
    }

    public static function getAvailableData(): EventDataCollection
    {
        return (new EventDataCollection())
            ->add('data', new ArrayType(new ScalarValueType(ScalarValueType::TYPE_STRING)))
            ->add('message', new ObjectType())
            ->add('mailTemplate', new ObjectType());
    }

    public function getName(): string
    {
        return self::EVENT_NAME;
    }

    public function getData(): array
    {
        return $this->data;
    }

    public function getMessage(): \Swift_Message
    {
        return $this->message;
    }

    public function getContext(): Context
    {
        return $this->context;
    }

    public function getLogData(): array
    {
        return [
            'data' => $this->getData(),
        ];
    }

    public function getLogLevel(): int
    {
        return Logger::INFO;
    }

    public function getMailTemplate(): ?MailTemplateEntity
    {
        return $this->mailTemplate;
    }

    public function setMailTemplate(MailTemplateEntity $mailTemplate = null): void
    {
        $this->mailTemplate = $mailTemplate;
    }
}
