<?php declare(strict_types=1);

namespace Shopware\Core\Content\Category\Aggregate\CategoryTranslation;

use Shopware\Core\Content\Category\CategoryDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\EntityTranslationDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\AttributesField;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\StringField;
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class CategoryTranslationDefinition extends EntityTranslationDefinition
{
    public static function getEntityName(): string
    {
        return 'category_translation';
    }

    public static function getParentDefinitionClass(): string
    {
        return CategoryDefinition::class;
    }

    public static function getEntityClass(): string
    {
        return CategoryTranslationEntity::class;
    }

    public static function getCollectionClass(): string
    {
        return CategoryTranslationCollection::class;
    }

    protected static function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new StringField('name', 'name'))->addFlags(new Required()),

            new AttributesField(),
        ]);
    }
}
