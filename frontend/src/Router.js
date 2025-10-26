import { createBrowserRouter } from "react-router-dom";
import App from './App';
import { Guest } from "./middleware/Guest";
import { Admin } from "./middleware/Admin";
import History from './pages/history/History';
import Travel from './pages/Home/Home';
import ProductList from "./pages/product/ProductList";
import ProductInfo from "./pages/product/ProductInfo";
import Login from "./Login";
import Destinations from "./pages/Destinations/Destinations";
import AddDestinations from "./pages/Destinations/AddDestinations";
import UpdateDestinations from "./pages/Destinations/UpdateDestinations";

import Officers from "./pages/Officers/Officers";
import AddOfficers from "./pages/Officers/AddOfficers";
import UpdateOfficers from "./pages/Officers/UpdateOfficers";
import OfficerDetails from "./pages/Officers/OfficerDetails";
import OfficersTmam from "./pages/Officers/OfficersTmam";
import OfficersLog from "./pages/Officers/OfficersLog";
import SearchOfficers from "./pages/Officers/SearchOfficers";
import OfficersTmamDetails from "./pages/Officers/OfficerTmamDeatils";
import OfficersHome from "./pages/Officers/OfficersHome";


import NCOsHome from "./pages/NCOs/NCOsHome";
import NCOs from "./pages/NCOs/NCOs";
import AddNCOs from "./pages/NCOs/AddNCOs";
import UpdateNCOs from "./pages/NCOs/UpdateNCOs";
import NCODetails from "./pages/NCOs/NCODetails";
import NCOsTmam from "./pages/NCOs/NCOsTmam";
import NCOsLog from "./pages/NCOs/NCOsLog";
import SearchNCOs from "./pages/NCOs/SearchNCOs";
import NCOsTmamDetails from "./pages/NCOs/NCOTmamDetails";


import SoldiersHome from "./pages/Soldiers/SoldiersHome";
import Soldiers from "./pages/Soldiers/Soldiers";
import AddSoldiers from "./pages/Soldiers/AddSoldiers";
import UpdateSoldiers from "./pages/Soldiers/UpdateSoldiers";
import SoldierDetails from "./pages/Soldiers/SoldierDetails";
import SoldiersTmam from "./pages/Soldiers/SoldiersTmam";
import SoldiersLog from "./pages/Soldiers/SoldiersLog";
import SearchSoldiers from "./pages/Soldiers/SearchSoldiers";
import SoldiersTmamDetails from "./pages/Soldiers/SoldierTmamDetails";


import CivilliansHome from "./pages/Civillians/CivilliansHome";
import Civillians from "./pages/Civillians/Civillians";
import AddCivillians from "./pages/Civillians/AddCivillians";
import UpdateCivillians from "./pages/Civillians/UpdateCivillians";
import CivillianDetails from "./pages/Civillians/CivillianDetails";
import CivilliansTmam from "./pages/Civillians/CivilliansTmam";
import CivilliansLog from "./pages/Civillians/CivilliansLog";
import SearchCivillians from "./pages/Civillians/SearchCivillians";
import CivilliansTmamDetails from "./pages/Civillians/CivilliansTmamDetails";


import ExpertsHome from "./pages/Experts/ExpertsHome";
import Experts from "./pages/Experts/Experts";
import AddExperts from "./pages/Experts/AddExperts";






import ManageBuses from "./pages/Manage-buses/ManageBuses";
import AddBus from "./pages/Manage-buses/AddBus";
import UpdateBus from "./pages/Manage-buses/UpdateBus";
import Travellers from "./pages/Travellers/Travellers";
import AddTravellers from "./pages/Travellers/AddTravellers";
import UpdateTravellers from "./pages/Travellers/UpdateTravellers";
import Appointements from "./pages/Appointments/ManageAppointment";
import AddAppointments from "./pages/Appointments/AddAppointments";
import UpdateAppointments from "./pages/Appointments/UpdateAppointments";
import Requests from "./pages/Requests/Requests";
import RequestHistory from "./pages/Travellers/History";
import Home from './pages/Home/Home'
import UserDestinations from "./pages/Destinations/UserDestinations";
import UserBusses from "./pages/Manage-buses/UserBusses";
import UserRequests from "./pages/Requests/UserRequests";
import NotFound from "./shared/NotFound";
import { Navigate } from "react-router-dom";


//import Dashboard from "./pages/Dashboard/Dashboard";
//import Card from "./pages/Dashboard/Card";

export const router = createBrowserRouter([
   
    {   
        element:<Guest></Guest>,
        children:[{
            path: "/",
            element: <Login />
        }
        ]
    },
    {
        path: "/dashboard",
        element: <App />,
        //Nesting Children
        children: [
            {
                path: "travel",
                element: <ProductList />,
            },
            {
                path: "product-info/:id",
                element: <ProductInfo />,
            },
            {
                path: "history",
                element: <History />,
            },
            {
                path: "Destinations",
                element: <Destinations/>
            },
            {
                path: "Home",
                element: <Home />,
            },
            {
                path: "All-Requests",
                element: <UserRequests/>
            },
            {
                path: "All-Busses",
                element: <UserBusses/>
            },
            {
                path: "All-Destinations",
                element: <UserDestinations/>
            },
            {
                path: "Destinations",
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Destinations />,
                    },
                    {
                        path:'AddDestinations',
                        element: <AddDestinations />,
                    },
                    {
                        path:':id',
                        element: <UpdateDestinations />,
                    },
                ]
            },
            {   path: "OfficersHome",
                element: <Admin />,
                children: [
                    {
                        path: '',
                        element: <OfficersHome />,
                    },

            
            {
                path: 'Officers',
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Officers />,
                    },
                    {
                        path:'AddOfficers',
                        element: <AddOfficers />,
                    },
                    {
                        path:':id',
                        element: <UpdateOfficers />,
                    },
                    {
                        path: 'details/:id',
                        element: <OfficerDetails />
                        // children: 
                        // [{
                        //     path: ':id',
                        //     element: <OfficerDetails />
                        // }]
                    },
                    {
                        path: 'Tmam',
                        element: <OfficersTmam />,
                    },
                    {
                        path: 'log',
                        element: <OfficersLog/>
                    },
                    {
                        path: 'search',
                        element: <SearchOfficers />
                    },
                    {
                            path: 'Tmam/details/:id',
                            element: <OfficersTmamDetails/>,
                            // children:[{
                            //     path: 'id',
                            //     element: <OfficersTmamDetails/>
                            // }]
                        }
                ]
            }
                ]
            },
            {   path: "NCOsHome",
                element: <Admin />,
                children: [
                    {
                        path: '',
                        element: <NCOsHome />,
                    },

            
            {
                path: 'NCOs',
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <NCOs />,
                    },
                    {
                        path:'AddNCOs',
                        element: <AddNCOs />,
                    },
                    {
                        path:':id',
                        element: <UpdateNCOs />,
                    },
                    {
                        path: 'details/:id',
                        element: <NCODetails />
                        // children: 
                        // [{
                        //     path: ':id',
                        //     element: <OfficerDetails />
                        // }]
                    },
                    {
                        path: 'Tmam',
                        element: <NCOsTmam />,
                    },
                    {
                        path: 'log',
                        element: <NCOsLog/>
                    },
                    {
                        path: 'search',
                        element: <SearchNCOs />
                    },
                    {
                            path: 'Tmam/details/:id',
                            element: <NCOsTmamDetails/>,
                            // children:[{
                            //     path: 'id',
                            //     element: <OfficersTmamDetails/>
                            // }]
                        }
                ]
            }
                ]
            },
            {   path: "SoldiersHome",
                element: <Admin />,
                children: [
                    {
                        path: '',
                        element: <SoldiersHome />,
                    },

            
            {
                path: 'Soldiers',
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Soldiers />,
                    },
                    {
                        path:'AddSoldiers',
                        element: <AddSoldiers />,
                    },
                    {
                        path:':id',
                        element: <UpdateSoldiers />,
                    },
                    {
                        path: 'details/:id',
                        element: <SoldierDetails />
                        // children: 
                        // [{
                        //     path: ':id',
                        //     element: <OfficerDetails />
                        // }]
                    },
                    {
                        path: 'Tmam',
                        element: <SoldiersTmam />,
                    },
                    {
                        path: 'log',
                        element: <SoldiersLog/>
                    },
                    {
                        path: 'search',
                        element: <SearchSoldiers />
                    },
                    {
                            path: 'Tmam/details/:id',
                            element: <SoldiersTmamDetails/>,
                            // children:[{
                            //     path: 'id',
                            //     element: <OfficersTmamDetails/>
                            // }]
                        }
                ]
            }
                ]
            },
            {   path: "CivilliansHome",
                element: <Admin />,
                children: [
                    {
                        path: '',
                        element: <CivilliansHome />,
                    },

            
            {
                path: 'Civillians',
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Civillians />,
                    },
                    {
                        path:'AddCivillians',
                        element: <AddCivillians />,
                    },
                    {
                        path:':id',
                        element: <UpdateCivillians />,
                    },
                    {
                        path: 'details/:id',
                        element: <CivillianDetails />
                        // children: 
                        // [{
                        //     path: ':id',
                        //     element: <OfficerDetails />
                        // }]
                    },
                    {
                        path: 'Tmam',
                        element: <CivilliansTmam />,
                    },
                    {
                        path: 'log',
                        element: <CivilliansLog/>
                    },
                    {
                        path: 'search',
                        element: <SearchCivillians />
                    },
                    {
                            path: 'Tmam/details/:id',
                            element: <CivilliansTmamDetails/>,
                            // children:[{
                            //     path: 'id',
                            //     element: <OfficersTmamDetails/>
                            // }]
                        }
                ]
            }
                ]
            },
            {   path: "ExpertsHome",
                element: <Admin />,
                children: [
                    {
                        path: '',
                        element: <ExpertsHome />,
                    },

            
            {
                path: 'Experts',
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Experts />,
                    },
                    {
                        path:'AddExperts',
                        element: <AddExperts />,
                    },
                    {
                        path:':id',
                        element: <UpdateCivillians />,
                    },
                    {
                        path: 'details/:id',
                        element: <CivillianDetails />
                        // children: 
                        // [{
                        //     path: ':id',
                        //     element: <OfficerDetails />
                        // }]
                    },
                    {
                        path: 'Tmam',
                        element: <CivilliansTmam />,
                    },
                    {
                        path: 'log',
                        element: <CivilliansLog/>
                    },
                    {
                        path: 'search',
                        element: <SearchCivillians />
                    },
                    {
                            path: 'Tmam/details/:id',
                            element: <CivilliansTmamDetails/>,
                            // children:[{
                            //     path: 'id',
                            //     element: <OfficersTmamDetails/>
                            // }]
                        }
                ]
            }
                ]
            },


            {
                path: "ManageBuses",
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <ManageBuses />
                    },
                    {
                        path:'AddBus',
                        element: <AddBus />
                    },
                    {
                        path:':id',
                        element: <UpdateBus />
                    },
                ]
                
            },
            {
                path: "Travellers",
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Travellers />
                    },
                    {
                        path:'AddTravellers',
                        element: <AddTravellers />
                    },
                    {
                        path:':id',
                        element: <UpdateTravellers />
                    },
                    {
                        path: 'History/:id',
                        element: <RequestHistory/>
                    },
                ]
            },
            {
                path: "Appointements",
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Appointements />
                    },
                    {
                        path:'AddAppointments',
                        element: <AddAppointments />
                    },
                    {
                        path:':id',
                        element: <UpdateAppointments />
                    },
                ]
            },
            {
                path: "Requests",
                element:<Admin/>,
                children: [
                    {
                        path:'',
                        element: <Requests />,
                    },
                ]
            },
            {
                path: "*",
                element: <NotFound/>
            },
        ],
    },
    ]);