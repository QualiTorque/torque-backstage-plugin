import { configApiRef, discoveryApiRef, useApi } from '@backstage/core-plugin-api';
import type { FetchEnvsInfoResponse } from '@qtorque/backstage-plugin-torque-common';
import { useEffect, useState } from 'react';
import { TORQUE_MISSING_ANNOTATION_ERROR } from '../annotations';


export function useEnvsInfo(space : string, environment_name: string = '') {
    const [data, setData] = useState<FetchEnvsInfoResponse | Error>([]);
    const config = useApi(configApiRef);
    const discovery = useApi(discoveryApiRef); 

    useEffect(() => {
        let source: EventSource;

        if (space) {
            createUrl().then((url) => {
                source = new EventSource(url);

                source.addEventListener('update-success', (message) => {
                    try {
                        if (message instanceof MessageEvent) {
                            setData(JSON.parse(message.data));
                        }
                    } catch (e) {
                        console.error(e);
                    }
                });
          
                source.addEventListener('update-failure', (message) => {
                    if (message instanceof MessageEvent) {
                        setData(new Error(message.data))
                    }
                })
            });
        } else {
            setData(new Error(TORQUE_MISSING_ANNOTATION_ERROR))
        }
          
        return () => {
            if (source) {
                source.close();
            }
        };

        async function createUrl() {
            const url = `${await discovery.getBaseUrl('torque')}/environments`;
            const params = new URLSearchParams({space, environment_name});
            return `${url}?${params}`;
        }
    }, [config, discovery, space]);

    return data;
}
