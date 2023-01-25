interface Config {
    torque: {
        
        token: string;

        executionHost: string;

        /**
         * @visibility frontend
         */
        serverUrl?: string

        ghAccessToken: string;
    }
}