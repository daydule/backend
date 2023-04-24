'use strict';
// eslint-disable-next-line node/no-unpublished-require
const secret = require('./secret');

module.exports = {
    DEFAULT: {
        DAY_SETTINGS: {
            SCHEDULE_START_TIME: '0900',
            SCHEDULE_END_TIME: '1800'
        },
        SCHEDULE: {
            SCHEDULE_START_TIME: '0900',
            SCHEDULE_END_TIME: '1800'
        }
    },
    SCHEDULE_LOGIC_FILENAME: {
        0: 'simpleScheduleHelper'
    },
    SECTION_MINUTES_LENGTH: 5,
    DAY_LIST: ['日', '月', '火', '水', '木', '金', '土'],
    PLAN_TYPE: {
        PLAN: 0,
        TODO: 1
    },
    GUEST_INIT: {
        AT_MARK: '@',
        GUEST_PASSWORD: secret.guestPassword,
        GUEST_USERNAME: secret.guestUsername,
        GUEST_DOMAIN: secret.guestDomain
    }
};
