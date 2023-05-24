'use strict';

require('dotenv').config();
const env = process.env;

module.exports = {
    DEFAULT: {
        DAY_SETTINGS: {
            SCHEDULE_START_TIME: '0900',
            SCHEDULE_END_TIME: '1800'
        },
        SCHEDULE: {
            START_TIME: '0900',
            END_TIME: '1800'
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
        GUEST_PASSWORD: env.GUEST_PASSWORD,
        GUEST_USERNAME: env.GUEST_USERNAME,
        GUEST_DOMAIN: env.GUEST_DOMAIN
    },
    PORT: env.BACKEND_PORT,
    DB: {
        // ローカル
        // HOST: 'postgres',
        // 本番
        HOST: env.DB_HOST,
        DATABASE: env.DB_NAME,
        PORT: env.DB_PORT,
        USER: env.DB_USER,
        PASSWORD: env.DB_PASS
    },
    COOKIE_SECRET: 'cookieSecret'
};
