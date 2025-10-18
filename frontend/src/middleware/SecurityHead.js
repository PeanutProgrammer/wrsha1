import React from 'react';
import { Outlet,Navigate } from 'react-router-dom';
import { getAuthUser } from '../helper/Storage';

export const SecurityHead = () => {
const auth=getAuthUser();
  return <>{auth && (auth.type=="قائد الامن" || auth.type == "admin") ?<Outlet /> :<Navigate to={"/login"}/>}</>;
}

