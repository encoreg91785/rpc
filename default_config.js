const config = {
    socket: {
        port: 32123
    },
    http:
    {
        port: 12121
    },
    db:
    {
        schema: "game_server",
        account: "root",
        password: "123456",
        option:
        {
            host: "localhost",
            dialect: "mysql",
            define: {
                charset: "utf8",
                collate: "utf8_unicode_ci"
            },
            /**
             * 單純資料
             */
            query: { raw: true },
            /**
             * 不顯示consle.log
             */
            logging: false,
        }
    },
    /**
     * 用戶中心的ip
     */
    userCenterUrl: "http://localhost:9000/",
}
module.exports = config;