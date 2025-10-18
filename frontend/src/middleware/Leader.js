import React from 'react';
import { Outlet,Navigate } from 'react-router-dom';
import { getAuthUser } from '../helper/Storage';

export const Leader = () => {
const auth=getAuthUser();
  return <>{auth && (auth.type=="مبنى القيادة" || auth.type == "admin") ?<Outlet /> :<Navigate to={"/login"}/>}</>;
}

