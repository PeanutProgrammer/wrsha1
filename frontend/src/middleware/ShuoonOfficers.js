import React from 'react';
import { Outlet,Navigate } from 'react-router-dom';
import { getAuthUser } from '../helper/Storage';

export const ShuoonOfficers = () => {
const auth=getAuthUser();
  return <>{auth && (auth.type=="شؤون ضباط" || auth.type == "admin") ?<Outlet /> :<Navigate to={"/login"}/>}</>;
}

