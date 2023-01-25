import { useEntity } from '@backstage/plugin-catalog-react';

import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import { useEnvsInfo } from '../../hooks/fetchEnvs';
import { Typography, Grid, Select, MenuItem, FormControl, InputLabel } from '@material-ui/core';

import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton
} from '@backstage/core-components';
import { TorqueAnnotationedEntity } from '../../types';
import { TORQUE_SPACE_ANNOTATION } from '../../annotations';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

function getEnvIdFromQueryString(): string | null {
  let [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('environmentId');
  console.log(`query: ${searchParams}`);
  if (id) {
    searchParams.delete('environmentId');
    setSearchParams(searchParams);
  }
  return id;
}

function fetchEnvs() {
  let space: string;
  try {
    const { entity } = useEntity<TorqueAnnotationedEntity>();
    space = entity.metadata.annotations[TORQUE_SPACE_ANNOTATION];
  } catch (e) {
    space = 'devserverY';
  }
  const data = useEnvsInfo(space, space);
  return data;
}

// function getInitialFocusedEnvironmentId(environments: any[] | Error) : string | null {
//   let id: string | null = ''; 
//   id = getEnvIdFromQueryString();
//   console.log(`id value from query: ${id}`);
//   if (!id) {
//     if (Array.isArray(environments) && environments.length > 0)
//       id = environments[0].id;
//   }
//   return id;
// }

function buildDropDownItems(data: any[] | Error) {
  if (Array.isArray(data)) {
    const items = data.map(env => {
      return <MenuItem value={env.id}>{env.details.definition.metadata.name}</MenuItem>
    })
    return items;
  } else {
    return <MenuItem>No</MenuItem>
  }
}

function getEnvById(data: any[] | Error, envId: string | null) {
  if (Array.isArray(data)) {
    return data.find((env) => {
      return env.id == envId;
    })
  } else {
    return null;
  }
}

export const MainComponent = () => {
  const envs = fetchEnvs();
  const [data, setData] = useState(getEnvIdFromQueryString() || 'choose');

  console.log(data);
  const env = getEnvById(envs, data);

  const config = useApi(configApiRef);
  const torqueUrl = config.getString('torque.serverUrl');

  let space = '';

  try {
    const { entity } = useEntity<TorqueAnnotationedEntity>();
    space = entity.metadata.annotations[TORQUE_SPACE_ANNOTATION];
  } catch (e) {
    space = 'Sample';
  }


  const handleChange = (event: { target: { value: any; }; }) => {
    const id = event.target.value;
    setData(id);
  }; 

  const EnvironmentDetailsCard = () => {
    if (env) {
      const envUrl = `${torqueUrl}/${space}/sandboxes/${env.id}?widget=true`;
      return <iframe
              height="100%"
              width="100%"
              src={envUrl}
           ></iframe>
    } else {
        return <Typography>select env</Typography>;
    }
  }

  return <Page themeId={''}>
    <Header title="Torque" subtitle="Backstage Torque plugin developed by Torque">
      <HeaderLabel label="Owner" value="Torque" />
    </Header>
    <Content>
      <ContentHeader title="Torque Backstage dashboard">
        <SupportButton>Torque Plugin provides a list of all environments from Torque.</SupportButton>
      </ContentHeader>
      <Grid container direction="column">
        <Grid item md={3}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Torque Environment</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={data}
              label="Torque Environment"
              onChange={handleChange}
              >
                {buildDropDownItems(envs)}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <EnvironmentDetailsCard />
    </Content>
  </Page>
}