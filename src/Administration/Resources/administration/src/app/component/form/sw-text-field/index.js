import { Mixin, State } from 'src/core/shopware';
import utils from 'src/core/service/util.service';
import template from './sw-text-field.html.twig';


/**
 * @protected
 * @description Base input field component which extends all other sw-xxx-field components and is used as default/text.
 * @status ready
 * @example-type dynamic
 * @component-example
 * <sw-text-field type="text" label="Name" placeholder="placeholder goes here..."></sw-text-field>
 */
export default {
    name: 'sw-text-field',
    template,

    mixins: [
        Mixin.getByName('validation'),
        Mixin.getByName('sw-inline-snippet')
    ],

    /**
     * All additional passed attributes are bound explicit to the correct child element.
     */
    inheritAttrs: false,

    props: {
        type: {
            type: String,
            required: false,
            default: 'text'
        },
        label: {
            type: [Object, String],
            required: false,
            default: ''
        },
        value: {
            required: false
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        size: {
            type: String,
            required: false,
            default: 'default',
            validValues: ['default', 'small'],
            validator(value) {
                if (!value.length) {
                    return true;
                }
                return ['default', 'small'].includes(value);
            }
        },
        errorMessage: {
            type: [Object, String],
            required: false,
            default: null
        },
        placeholder: {
            type: [Object, String],
            required: false,
            default: ''
        },
        helpText: {
            type: [Object, String],
            required: false,
            default: ''
        },
        tooltipText: {
            type: [Object, String],
            required: false,
            default: ''
        },
        tooltipPosition: {
            type: String,
            required: false,
            default: 'top',
            validValues: ['top', 'bottom', 'left', 'right'],
            validator(value) {
                return ['top', 'bottom', 'left', 'right'].includes(value);
            }
        },
        copyAble: {
            type: Boolean,
            required: false,
            default: false
        },
        copyAbleTooltip: {
            type: Boolean,
            required: false,
            default: false
        },
        suffix: {
            type: String,
            required: false,
            default: ''
        },
        prefix: {
            type: String,
            required: false,
            default: ''
        }
    },

    data() {
        return {
            currentValue: null,
            boundExpression: '',
            boundExpressionPath: [],
            formError: {},
            utilsId: utils.createId()
        };
    },

    computed: {
        locale() {
            return this.$root.$i18n.locale;
        },
        fallbackLocale() {
            return this.$root.$i18n.fallbackLocale;
        },
        id() {
            return `sw-field--${this.utilsId}`;
        },

        containSuffix() {
            return !!this.$scopedSlots.suffix || !!this.$slots.suffix || !!this.suffix;
        },

        containPrefix() {
            return !!this.$scopedSlots.prefix || !!this.$slots.prefix || !!this.prefix;
        },

        displayName() {
            if (this.$attrs.name && this.$attrs.name.length > 0) {
                return this.$attrs.name;
            }
            if (!this.boundExpression) {
                return `sw-field--${this.utilsId}`;
            }
            return `sw-field--${this.boundExpression.replace('.', '-')}`;
        },

        errorStore() {
            return State.getStore('error');
        },

        hasError() {
            return (this.errorMessage !== null && this.errorMessage.length > 0) ||
                (this.formError.detail && this.formError.detail.length > 0);
        },

        hasErrorCls() {
            return !this.isValid || this.hasError;
        },

        additionalEventListeners() {
            const listeners = {};

            /**
             * Do not pass "change" or "input" event listeners to the form elements
             * because the component implements its own listeners for this event types.
             * The callback methods will emit the corresponding event to the parent.
             */
            Object.keys(this.$listeners).forEach((key) => {
                if (!['change', 'input'].includes(key)) {
                    listeners[key] = this.$listeners[key];
                }
            });

            return listeners;
        },

        typeFieldClass() {
            return `sw-field--${this.type}`;
        },

        sizeFieldClass() {
            return `sw-field--${this.size}`;
        },

        fieldClasses() {
            return [
                this.typeFieldClass,
                this.sizeFieldClass,
                {
                    'has--error': !!this.hasErrorCls,
                    'has--suffix': !!this.copyAble || !!this.containSuffix,
                    'has--prefix': !!this.containPrefix,
                    'has--tooltip': !!this.tooltipText,
                    'is--disabled': !!this.$props.disabled
                }];
        }
    },

    watch: {
        value(value) {
            this.currentValue = value;
        }
    },

    created() {
        this.componentCreated();
    },

    methods: {
        componentCreated() {
            this.currentValue = this.value;

            if (this.$vnode.data && this.$vnode.data.model) {
                this.boundExpression = this.$vnode.data.model.expression;
                this.boundExpressionPath = this.boundExpression.split('.');

                if (this.errorStore) {
                    this.formError = this.errorStore.registerFormField(this.boundExpression);
                }
            }
        },

        onChange() {
            if (!this.currentValue) {
                this.currentValue = null;
            }
            this.$emit('change', this.currentValue);

            if (this.hasError) {
                this.errorStore.deleteError(this.formError);
            }
        },

        onInput(event) {
            this.currentValue = event.target.value;
            if (!this.currentValue) {
                this.currentValue = null;
            }

            this.$emit('input', this.currentValue);

            if (this.hasError) {
                this.errorStore.deleteError(this.formError);
            }
        }
    }
};
