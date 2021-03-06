import { Component, State, Application, Mixin } from 'src/core/shopware';
import { warn } from 'src/core/service/utils/debug.utils';
import EntityProxy from 'src/core/data/EntityProxy';
import CriteriaFactory from 'src/core/factory/criteria.factory';
import cmsService from 'src/module/sw-cms/service/cms.service';
import cmsState from 'src/module/sw-cms/state/cms-page.state';
import template from './sw-cms-detail.html.twig';
import './sw-cms-detail.scss';

Component.register('sw-cms-detail', {
    template,

    inject: ['loginService', 'cmsPageService'],

    mixins: [
        Mixin.getByName('notification'),
        Mixin.getByName('placeholder')
    ],

    data() {
        return {
            pageId: null,
            page: {
                blocks: []
            },
            salesChannels: [],
            isLoading: false,
            currentSalesChannelKey: null,
            currentDeviceView: 'desktop',
            currentBlock: null,
            currentSkin: 'default',
            currentMappingEntity: null,
            currentMappingEntityStore: null,
            demoEntityId: null,
            styleElement: null
        };
    },

    computed: {
        salesChannelStore() {
            return State.getStore('sales_channel');
        },

        defaultFolderStore() {
            return State.getStore('media_default_folder');
        },

        cmsBlocks() {
            return cmsService.getCmsBlockRegistry();
        },

        cmsElements() {
            return cmsService.getCmsElementRegistry();
        },

        cmsStageClasses() {
            return [
                `is--${this.currentDeviceView}`,
                `sw-cms-skin__${this.currentSkin}`
            ];
        },

        cmsTypeMappingEntities() {
            return {
                product_detail: {
                    entity: 'product',
                    mode: 'single'
                }
            };
        },

        cmsPageTypeSettings() {
            if (this.cmsTypeMappingEntities[this.page.type]) {
                return this.cmsTypeMappingEntities[this.page.type];
            }

            return {
                entity: null,
                mode: 'static'
            };
        },

        cmsSkins() {
            return {
                '06476486f70c499eb8bdd65482a24f63': 'default',
                '20080911ffff4fffafffffff19830531': 'fancy',
                '9a00221baf80421f9383f4fcc7b9457d': 'crazy'
            };
        },

        blockConfigDefaults() {
            return {
                name: null,
                marginBottom: '40px',
                marginTop: '40px',
                marginLeft: '20px',
                marginRight: '20px',
                sizingMode: 'boxed'
            };
        }
    },

    watch: {
        'page.blocks': {
            handler() {
                if (this.page.blocks.length <= 0) {
                    this.currentBlock = null;
                }
            }
        }
    },

    created() {
        this.createdComponent();
    },

    beforeDestroy() {
        this.beforeDestroyedComponent();
    },

    methods: {
        createdComponent() {
            cmsState.currentPage = null;

            if (this.$route.params.id) {
                this.pageId = this.$route.params.id;
                this.isLoading = true;

                this.salesChannelStore.getList({ page: 1, limit: 25 }).then((response) => {
                    this.salesChannels = response.items;

                    if (this.salesChannels.length > 0) {
                        this.currentSalesChannelKey = this.salesChannels[0].id;
                        this.loadSkin(this.currentSalesChannelKey);
                        this.loadPage(this.pageId);
                    }
                });
            }

            this.setPageContext();
        },

        setPageContext() {
            this.getDefaultFolderId().then((folderId) => {
                cmsState.defaultMediaFolderId = folderId;
            });
        },

        getDefaultFolderId() {
            return this.defaultFolderStore.getList({
                limit: 1,
                criteria: CriteriaFactory.equals('entity', cmsState.pageEntityName),
                associations: {
                    folder: {}
                }
            }).then(({ items }) => {
                if (items.length !== 1) {
                    return null;
                }

                const defaultFolder = items[0];
                if (defaultFolder.folder.id) {
                    return defaultFolder.folder.id;
                }

                return null;
            });
        },

        beforeDestroyedComponent() {
            cmsState.currentPage = null;

            if (this.styleElement !== null) {
                this.styleElement.remove();
            }
        },

        loadPage(pageId) {
            this.isLoading = true;

            const initContainer = Application.getContainer('init');
            const httpClient = initContainer.httpClient;
            const currentLanguageId = State.getStore('language').getCurrentId();

            httpClient.get(`/_proxy/storefront-api/${this.currentSalesChannelKey}/v1/cms-page/${pageId}`, {
                headers: {
                    Authorization: `Bearer ${this.loginService.getToken()}`,
                    'x-sw-language-id': currentLanguageId
                }
            }).then((response) => {
                if (response.data.data) {
                    this.page = { blocks: [] };
                    this.page = new EntityProxy('cms_page', this.cmsPageService, response.data.data.id, null);
                    this.page.setData(response.data.data, false, true, false, currentLanguageId);

                    this.page.blocks.forEach((block, index) => {
                        block.position = index;

                        if (block.config === null) {
                            block.config = { ...this.blockConfigDefaults };
                        }
                    });

                    cmsState.currentPage = this.page;

                    this.updateDataMapping();
                    this.isLoading = false;
                }
            }).catch((exception) => {
                this.isLoading = false;

                this.createNotificationError({
                    title: exception.message,
                    message: exception.response.statusText
                });
                warn(this._name, exception.message, exception.response);
                throw exception;
            });
        },

        loadSkin(salesChannelId) {
            let skinType = 'default';

            if (this.cmsSkins[salesChannelId]) {
                skinType = this.cmsSkins[salesChannelId];
            }

            if (this.styleElement === null) {
                this.styleElement = document.createElement('link');
                this.styleElement.rel = 'stylesheet';
                this.styleElement.type = 'text/css';
                this.styleElement.media = 'all';

                const head = document.getElementsByTagName('head')[0];
                head.appendChild(this.styleElement);
            }

            this.styleElement.href = `/administration/static/skins/${skinType}.css`;
            this.currentSkin = skinType;
        },

        updateDataMapping() {
            const mappingEntity = this.cmsPageTypeSettings.entity;

            if (!mappingEntity) {
                cmsState.currentMappingEntity = null;
                cmsState.currentMappingTypes = {};

                this.currentMappingEntity = null;
                this.currentMappingEntityStore = null;
                return;
            }

            cmsState.currentMappingEntity = mappingEntity;
            cmsState.currentMappingTypes = cmsService.getEntityMappingTypes(mappingEntity);

            this.currentMappingEntity = mappingEntity;
            this.currentMappingEntityStore = State.getStore(mappingEntity);
        },

        onDeviceViewChange(view) {
            this.currentDeviceView = view;

            if (view === 'form') {
                this.currentBlock = null;
                this.$refs.blockConfigSidebar.closeContent();
                this.$refs.blockSelectionSidebar.closeContent();
            }
        },

        onChangeLanguage() {
            this.isLoading = true;
            return this.salesChannelStore.getList({ page: 1, limit: 25 }).then((response) => {
                this.salesChannels = response.items;
                return this.loadPage(this.pageId);
            });
        },

        abortOnLanguageChange() {
            return this.page.hasChanges();
        },

        saveOnLanguageChange() {
            return this.onSave();
        },

        onSalesChannelChange() {
            this.loadSkin(this.currentSalesChannelKey);
            this.loadPage(this.pageId);
        },

        onPageTypeChange() {
            this.updateDataMapping();
        },

        onDemoEntityChange(demoEntityId) {
            const demoEntity = this.currentMappingEntityStore.getById(demoEntityId);

            if (!demoEntity) {
                cmsState.currentDemoEntity = null;
                return;
            }

            cmsState.currentDemoEntity = demoEntity;
        },

        onAddBlockSection() {
            this.currentBlock = null;
            this.$refs.blockSelectionSidebar.openContent();
        },

        onBlockSelection(block) {
            this.currentBlock = block;
            this.$refs.blockConfigSidebar.openContent();
        },

        onCloseBlockConfig() {
            this.currentBlock = null;
        },

        onBlockDelete(blockId) {
            const blockStore = this.page.getAssociation('blocks');
            const block = blockStore.getById(blockId);

            block.delete();

            this.page.blocks.splice(this.page.blocks.findIndex(b => b.id === block.id), 1);
            this.updateBlockPositions();
        },

        onBlockStageDrop(dragData, dropData) {
            if (!dropData || !dragData.block || dropData.dropIndex < 0) {
                return;
            }

            const blockStore = this.page.getAssociation('blocks');
            const newBlock = blockStore.create();
            newBlock.type = dragData.block.name;
            newBlock.position = dropData.dropIndex;
            newBlock.pageId = this.page.id;

            Object.assign(newBlock.config, this.blockConfigDefaults);

            const slotStore = newBlock.getAssociation('slots');
            const blockConfig = this.cmsBlocks[newBlock.type];
            Object.keys(blockConfig.slots).forEach((slotName) => {
                const element = slotStore.create();
                element.blockId = newBlock.id;
                element.slot = slotName;
                element.type = blockConfig.slots[slotName];

                newBlock.slots.push(element);
            });

            this.page.blocks.splice(dropData.dropIndex, 0, newBlock);
            this.updateBlockPositions();

            this.onBlockSelection(newBlock);
        },

        onBlockDragSort(dragData, dropData, validDrop) {
            if (validDrop !== true) {
                return;
            }

            const newIndex = dropData.block.position;
            const oldIndex = dragData.block.position;

            if (newIndex === oldIndex) {
                return;
            }

            const movedItem = this.page.blocks.find((item, index) => index === oldIndex);
            const remainingItems = this.page.blocks.filter((item, index) => index !== oldIndex);
            const sortedItems = [
                ...remainingItems.slice(0, newIndex),
                movedItem,
                ...remainingItems.slice(newIndex)
            ];

            sortedItems.forEach((block, index) => {
                block.position = index;
            });

            this.page.blocks = sortedItems;
        },

        onSave() {
            this.isLoading = true;
            return this.page.save(true).then(() => {
                return this.loadPage(this.page.id);
            });
        },

        updateBlockPositions() {
            this.page.blocks.forEach((block, index) => {
                block.position = index;
            });
        }
    }
});
