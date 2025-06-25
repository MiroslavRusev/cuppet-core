const { setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const config = require('config');
const commonFields = require('./commonComponents/commonFields');
const strings = require('./multilingualStrings/multilingualStrings');

setDefaultTimeout(120 * 1000);

//attach: function used for adding attachments to hooks/steps
class World {
    constructor({ attach }) {
        this.attach = attach;
        this.commonFields = commonFields;
        this.enableMlSupport();
    }

    enableMlSupport() {
        const lang = config.has('language') ? config.get('language') : null;
        if (lang) {
            this.mlStrings = strings.multilingualStrings(lang) ?? {};
        } else {
            this.mlStrings = {};
        }
    }
}
setWorldConstructor(World);
