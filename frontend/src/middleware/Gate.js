import React from 'react';
import { Outlet,Navigate } from 'react-router-dom';
import { getAuthUser } from '../helper/Storage';

export const Gate = () => {
const auth=getAuthUser();
  return <>{auth && (auth.type=="بوابة" || auth.type == "admin") ?<Outlet /> :<Navigate to={"/login"}/>}</>;
}

