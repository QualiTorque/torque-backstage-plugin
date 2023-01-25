import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { useEnvsInfo } from '../../hooks/fetchEnvs';
// // import { makeStyles } from '@material-ui/core/styles';
import { TorqueAnnotationedEntity } from '../../types';
import { TORQUE_SPACE_ANNOTATION, TORQUE_MISSING_ANNOTATION_ERROR } from '../../annotations';
import { Table, TableColumn } from '@backstage/core-components';
import { Typography } from '@material-ui/core';

// import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { Link } from 'react-router-dom';


// const useStyles = makeStyles({
//     avatar: {
//       height: 32,
//       width: 32,
//       borderRadius: '50%',
//     },
//   });

class EnvironmentItem {
    id: string | null = null;
    name: string | null = null;
    blueprint_name: string | null = null;
    state: string | null = null;
    space: string | null = null
}

type DenseTableProps = {
    environments: EnvironmentItem[];
}

export const isTorqueAvailable = (entity: Entity) =>
    Boolean(entity.metadata.annotations?.[TORQUE_SPACE_ANNOTATION])

export const DanseTable = ({ environments }: DenseTableProps) => {
    // const config = useApi(configApiRef);

    // const torqueUrl = config.getString('torque.serverUrl');

    // const classes = useStyles();
    const columns: TableColumn[] = [
        { title: 'Link', field: 'link' },
        { title: 'Name', field: 'name' },
        { title: 'Blueprint', field: 'blueprint_name' },
        { title: 'State', field: 'state' }
    ];

    const data = environments.map(env => { 
        var env_url = `torque?environmentId=${env.id}`;
        // var env_url = `${torqueUrl}/${env.space}/sandboxes/${env.id}`;
        return {
            link: (
                <Link to={env_url}>
                    <img
                        src="https://raw.githubusercontent.com/QualiTorque/torque-vs-code-extensions/master/client/icon/Quali_Q_black.svg"
                        alt="example"
                        width="30"
                    />
                </Link>
            ),
            name: env.name,
            blueprint_name: env.blueprint_name,
            state: env.state,
        };
    });

    return (
        <Table
            title="Torque Environments"
            options={{ search: true, paging: true, pageSize: 5 }}
            columns={columns}
            data={data}
        />
    );
};

export const TorqueCardComponent = () => {
    let space: string;
    try {
        const { entity } = useEntity<TorqueAnnotationedEntity>();
        space = entity.metadata.annotations[TORQUE_SPACE_ANNOTATION];
    } catch (e) {
        space = 'Sample';
    }
    const data = useEnvsInfo(space, space);

    // let content: ReactNode = null;

    if (Array.isArray(data)) {
        const envs = data.map(envItem => {
            let env = new EnvironmentItem();
            env.blueprint_name = envItem.details.definition.metadata.blueprint_name;
            env.id = envItem.id;
            env.name = envItem.details.definition.metadata.name;
            env.state = envItem.details.computed_status;
            env.space = space;
            return env;
        })
        return <DanseTable environments={envs || []} />;
        
      } else if (data instanceof Error && data.message === TORQUE_MISSING_ANNOTATION_ERROR) {
        return <Typography color="error">{data.message}</Typography>
      } else {
        return <Typography>{data.message}</Typography>
      }
}