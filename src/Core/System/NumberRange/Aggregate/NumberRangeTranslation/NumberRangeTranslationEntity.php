<?php declare(strict_types=1);

namespace Shopware\Core\System\NumberRange\Aggregate\NumberRangeTranslation;

use Shopware\Core\Framework\DataAbstractionLayer\TranslationEntity;
use Shopware\Core\System\NumberRange\NumberRangeEntity;

class NumberRangeTranslationEntity extends TranslationEntity
{
    /**
     * @var string
     */
    protected $numberRangeId;

    /**
     * @var string|null
     */
    protected $name;

    /**
     * @var string|null
     */
    protected $description;

    /**
     * @var NumberRangeEntity|null
     */
    protected $numberRange;

    /**
     * @var array|null
     */
    protected $attributes;

    public function getNumberRangeId(): string
    {
        return $this->numberRangeId;
    }

    public function setNumberRangeId(string $numberRangeId): void
    {
        $this->numberRangeId = $numberRangeId;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): void
    {
        $this->name = $name;
    }

    public function getAttributes(): ?array
    {
        return $this->attributes;
    }

    public function setAttributes(?array $attributes): void
    {
        $this->attributes = $attributes;
    }

    public function getNumberRange(): ?NumberRangeEntity
    {
        return $this->numberRange;
    }

    public function setNumberRange(?NumberRangeEntity $numberRange): void
    {
        $this->numberRange = $numberRange;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): void
    {
        $this->description = $description;
    }
}
