import { Module } from 'src/core/shopware';
import './component/structure/sw-admin-menu-extension';
import './component/structure/sw-sales-channel-menu';
import './component/sw-sales-channel-modal';
import './page/sw-sales-channel-detail';
import './page/sw-sales-channel-create';
import './view/sw-sales-channel-detail-base';
import './view/sw-sales-channel-create-base';

import deDE from './snippet/de_DE.json';
import enGB from './snippet/en_GB.json';

Module.register('sw-sales-channel', {
    type: 'core',
    name: 'sales-channels',
    description: 'The module for managing sales channels.',
    version: '1.0.0',
    targetVersion: '1.0.0',
    color: '#14D7A5',
    icon: 'default-device-server',
    entity: 'sales_channel',

    snippets: {
        'de-DE': deDE,
        'en-GB': enGB
    },

    routes: {
        detail: {
            component: 'sw-sales-channel-detail',
            path: 'detail/:id',
            redirect: {
                name: 'sw.sales.channel.detail.base'
            },
            children: {
                base: {
                    component: 'sw-sales-channel-detail-base',
                    path: 'base'
                }
            }
        },

        create: {
            component: 'sw-sales-channel-create',
            path: 'create/:typeId',
            redirect: {
                name: 'sw.sales.channel.create.base'
            },
            children: {
                base: {
                    component: 'sw-sales-channel-create-base',
                    path: 'base'
                }
            }
        }
    }
});
