<?php declare(strict_types=1);

namespace Shopware\Core\Content\MailTemplate\Service;

use Shopware\Core\Framework\Context;
use Shopware\Core\Content\MailTemplate\MailTemplateEntity;

interface MailServiceInterface
{
    public function send(array $data, Context $context, array $templateData = [], MailTemplateEntity $mailTemplate = null): ?\Swift_Message;
}
