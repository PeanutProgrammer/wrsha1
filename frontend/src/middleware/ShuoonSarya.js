import React from 'react';
import { Outlet,Navigate } from 'react-router-dom';
import { getAuthUser } from '../helper/Storage';

export const ShuoonSarya = () => {
const auth=getAuthUser();
  return <>{auth && (auth.type=="شؤون ادارية" || auth.type == "admin") ?<Outlet /> :<Navigate to={"/login"}/>}</>;
}

