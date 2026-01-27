import React from 'react';
import { Outlet,Navigate } from 'react-router-dom';
import { getAuthUser } from '../helper/Storage';

export const Secretary = () => {
const auth=getAuthUser();
  return <>{auth && (auth.type=="secretary" || auth.type == "admin") ?<Outlet /> :<Navigate to={"/login"}/>}</>;
}

