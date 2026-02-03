import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Guest } from "./middleware/Guest";
import { ProtectedRoute } from "./middleware/ProtectedRoute";
import { Admin } from "./middleware/Admin";

import Login from "./Login";
import NotFound from "./shared/NotFound";
import NotAuthorized from "./shared/NotAuthorized";

// Home Pages
import Home from "./pages/Home/Home";
import OfficersHome from "./pages/Officers/OfficersHome";
import NCOsHome from "./pages/NCOs/NCOsHome";
import SoldiersHome from "./pages/Soldiers/SoldiersHome";
import CivilliansHome from "./pages/Civillians/CivilliansHome";
import ExpertsHome from "./pages/Experts/ExpertsHome";
import GuestsHome from "./pages/Guests/GuestsHome";
import DelegatesHome from "./pages/Delegates/DelegatesHome";
import PastWorkersHome from "./pages/Past_Workers/PastWorkersHome";

// Officers
import Officers from "./pages/Officers/Officers";
import AddOfficers from "./pages/Officers/AddOfficers";
import UpdateOfficers from "./pages/Officers/UpdateOfficers";
import OfficerDetails from "./pages/Officers/OfficerDetails";
import OfficersTmam from "./pages/Officers/OfficersTmam";
import OfficersLog from "./pages/Officers/OfficersLog";
import SearchOfficers from "./pages/Officers/SearchOfficers";
import OfficersTmamDetails from "./pages/Officers/OfficerTmamDeatils";
import OfficerArrival from "./pages/Officers/arrival";
import OfficerDeparture from "./pages/Officers/departure";
import ManageOfficers from "./pages/Officers/ManageOfficers";
import ManageTmam from "./pages/Officers/ManageTmam";
import UpdateTmam from "./pages/Officers/UpdateTmam";
import AddTmam from "./pages/Officers/AddTmam";
import ManageVacation from "./pages/Officers/ManageVacation";
import ManageMission from "./pages/Officers/ManageMission";
import ManageCourse from "./pages/Officers/ManageCourse";
import LeaderOfficers from "./pages/Officers/LeaderOfficers";
import LeaderOfficersVacations from "./pages/Officers/LeaderVacations";
import OfficerVacationLog from "./pages/Officers/OfficersVacationLog";
import OfficerDutyForm from "./pages/Officers/OfficersDuty";
import OfficerDutyViewer from "./pages/Officers/LeaderOfficerDuty";
import OfficersView from "./pages/Officers/OfficersView";
// NCOs
import NCOs from "./pages/NCOs/NCOs";
import AddNCOs from "./pages/NCOs/AddNCOs";
import UpdateNCOs from "./pages/NCOs/UpdateNCOs";
import NCODetails from "./pages/NCOs/NCODetails";
import NCOsTmam from "./pages/NCOs/NCOsTmam";
import NCOsLog from "./pages/NCOs/NCOsLog";
import SearchNCOs from "./pages/NCOs/SearchNCOs";
import NCOsTmamDetails from "./pages/NCOs/NCOTmamDetails";
import NCOArrival from "./pages/NCOs/arrival";
import NCODeparture from "./pages/NCOs/departure";
import ManageNCOs from "./pages/NCOs/ManageNCOs";
import ManageNCOTmam from "./pages/NCOs/ManageTmam";
import AddNCOTmam from "./pages/NCOs/AddTmam";
import UpdateNCOTmam from "./pages/NCOs/UpdateTmam";
import LeaderNCOs from "./pages/NCOs/LeaderNCOs";
import LeaderNCOsVacations from "./pages/NCOs/LeaderVacations";
import NCOsView from "./pages/NCOs/NCOsView";
// Soldiers
import Soldiers from "./pages/Soldiers/Soldiers";
import AddSoldiers from "./pages/Soldiers/AddSoldiers";
import UpdateSoldiers from "./pages/Soldiers/UpdateSoldiers";
import SoldierDetails from "./pages/Soldiers/SoldierDetails";
import SoldiersTmam from "./pages/Soldiers/SoldiersTmam";
import SoldiersLog from "./pages/Soldiers/SoldiersLog";
import SearchSoldiers from "./pages/Soldiers/SearchSoldiers";
import SoldiersTmamDetails from "./pages/Soldiers/SoldierTmamDetails";
import SoldierArrival from "./pages/Soldiers/arrival";
import SoldierDeparture from "./pages/Soldiers/departure";
import ManageSoldiers from "./pages/Soldiers/ManageSoldiers";
import ManageSoldierTmam from "./pages/Soldiers/ManageTmam";
import AddSoldierTmam from "./pages/Soldiers/AddTmam";
import UpdateSoldierTmam from "./pages/Soldiers/UpdateTmam";
import LeaderSoldiers from "./pages/Soldiers/LeaderSoldiers";
import LeaderSoldiersVacations from "./pages/Soldiers/LeaderVacations";
import SoldiersView from "./pages/Soldiers/SoldiersView";
// import RealTimeMonitor from "./pages/Soldiers/RealTimeMonitor";

// Civillians
import Civillians from "./pages/Civillians/Civillians";
import AddCivillians from "./pages/Civillians/AddCivillians";
import UpdateCivillians from "./pages/Civillians/UpdateCivillians";
import CivillianDetails from "./pages/Civillians/CivillianDetails";
import CivilliansTmam from "./pages/Civillians/CivilliansTmam";
import CivilliansLog from "./pages/Civillians/CivilliansLog";
import SearchCivillians from "./pages/Civillians/SearchCivillians";
import CivilliansTmamDetails from "./pages/Civillians/CivilliansTmamDetails";
import CivillianArrival from "./pages/Civillians/arrival";
import CivillianDeparture from "./pages/Civillians/departure";
import LeaderCivillians from "./pages/Civillians/LeaderCivillians";

// Experts
import Experts from "./pages/Experts/Experts";
import AddExperts from "./pages/Experts/AddExperts";
import UpdateExperts from "./pages/Experts/UpdateExperts";
import ExpertDetails from "./pages/Experts/ExpertDetails";
import ExpertsLog from "./pages/Experts/ExpertsLog";
import SearchExperts from "./pages/Experts/SearchExperts";
import ExpertArrival from "./pages/Experts/arrival";
import ExpertDeparture from "./pages/Experts/departure";
import LeaderExperts from "./pages/Experts/LeaderExperts";

// Guests
import Guests from "./pages/Guests/Guests";
import AddGuests from "./pages/Guests/AddGuests";
import GuestArrival from "./pages/Guests/arrival";
import GuestDeparture from "./pages/Guests/departure";
import LeaderGuests from "./pages/Guests/LeaderGuests";

//Delegates
import Delegates from "./pages/Delegates/Delegates";
import AddDelegates from "./pages/Delegates/AddDelegates";
import DelegateArrival from "./pages/Delegates/arrival";
import DelegateDeparture from "./pages/Delegates/departure";
import LeaderDelegates from "./pages/Delegates/LeaderDelegates";

// Past Workers
import PastOfficers from "./pages/Past_Workers/PastOfficers";
import PastOfficerDetails from "./pages/Past_Workers/PastOfficerDetails";
import PastNCOs from "./pages/Past_Workers/PastNCOs";
import PastNCODetails from "./pages/Past_Workers/PastNCODetails";
import SearchPastWorkers from "./pages/Past_Workers/SearchPastWorkers";

// Users
import Users from "./pages/Users/Users";
import AddUsers from "./pages/Users/AddUsers";
import UpdateUsers from "./pages/Users/UpdateUsers";

// Security
import SecurityOfficers from "./pages/Officers/SecurityOfficers";
import SecurityNCOs from "./pages/NCOs/SecurityNCOs";
import SecuritySoldiers from "./pages/Soldiers/SecuritySoldiers";
import SecurityCivillians from "./pages/Civillians/SecurityCivillians";
import SecurityExperts from "./pages/Experts/SecurityExperts";
import SecurityGuests from "./pages/Guests/SecurityGuests";
import SecurityDelegates from "./pages/Delegates/SecurityDelegates";
import AllInUnit from "./pages/Unit/AllInUnit";
import LeaderUnits from "./pages/Unit/LeaderUnits";
import LeaderVacations from "./pages/Unit/LeaderVacations";
import MonthlyReport from "./pages/Experts/MonthlyReport";
import LeaderMissions from "./pages/Unit/LeaderMissions";

import ManageShuoonVacation from "./pages/Shuoon/ManageVacation";
import ManageShuoonMission from "./pages/Shuoon/ManageMission";
import ManageShuoonCourse from "./pages/Shuoon/ManageCourse";

import Calendar from "./pages/Events/Calendar";

export const router = createBrowserRouter([
  {
    element: <Guest />,
    children: [{ path: "/", element: <Login /> }],
  },
  {
    path: "/not-authorized",
    element: <NotAuthorized />,
  },
  {
    path: "/dashboard",
    element: <App />,
    children: [
      { path: "home", element: <Home /> },

      // Leader Routes
      {
        path: "leader-officers",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderOfficers /> }],
      },
      {
        path: "leader-ncos",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderNCOs /> }],
      },
      {
        path: "leader-soldiers",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderSoldiers /> }],
      },
      {
        path: "leader-civillians",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderCivillians /> }],
      },
      {
        path: "leader-units",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderUnits /> }],
      },
      {
        path: "leader-delegates",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderDelegates /> }],
      },
      {
        path: "leader-guests",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderGuests /> }],
      },
      {
        path: "leader-experts",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderExperts /> }],
      },
      {
        path: "leader-vacations",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderVacations /> }],
      },
      {
        path: "calendar",
        element: (
          <ProtectedRoute
            allowedTypes={["admin", "مبنى القيادة", "secretary"]}
          />
        ),
        children: [{ path: "", element: <Calendar /> }],
      },
      {
        path: "officers-vacations",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderOfficersVacations /> }],
      },
      {
        path: "ncos-vacations",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderNCOsVacations /> }],
      },
      {
        path: "soldiers-vacations",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderSoldiersVacations /> }],
      },
      {
        path: "leader-missions",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin"]}
          />
        ),
        children: [{ path: "", element: <LeaderMissions /> }],
      },
      {
        path: "officer-vacation-log/:id",
        element: (
          <ProtectedRoute
            allowedTypes={["admin", "مبنى القيادة", "secretary", "شؤون ضباط"]}
          />
        ),
        children: [{ path: "", element: <OfficerVacationLog /> }],
      },
      {
        path: "leader-officer-duty",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin", "شؤون ضباط"]}
          />
        ),
        children: [{ path: "", element: <OfficerDutyViewer /> }],
      },
      {
        path: "officer-view",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin", "شؤون ضباط"]}
          />
        ),
        children: [{ path: "", element: <OfficersView /> }],
      },
      {
        path: "nco-view",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin", "شؤون ضباط"]}
          />
        ),
        children: [{ path: "", element: <NCOsView /> }],
      },
      {
        path: "soldier-view",
        element: (
          <ProtectedRoute
            allowedTypes={["مبنى القيادة", "secretary", "admin", "شؤون ضباط"]}
          />
        ),
        children: [{ path: "", element: <SoldiersView /> }],
      },

      // Security Routes
      {
        path: "security-officers",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <SecurityOfficers /> }],
      },
      {
        path: "security-ncos",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <SecurityNCOs /> }],
      },
      {
        path: "security-soldiers",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <SecuritySoldiers /> }],
      },
      {
        path: "security-civillians",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <SecurityCivillians /> }],
      },
      {
        path: "security-experts",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <SecurityExperts /> }],
      },
      {
        path: "security-guests",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <SecurityGuests /> }],
      },
      {
        path: "security-delegates",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <SecurityDelegates /> }],
      },
      {
        path: "security-unit",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <AllInUnit /> }],
      },
      {
        path: "security-experts-report",
        element: <ProtectedRoute allowedTypes={["قائد الامن"]} />,
        children: [{ path: "", element: <MonthlyReport /> }],
      },

      // Officers Routes
      {
        path: "officers",
        element: (
          <ProtectedRoute
            allowedTypes={["admin", "بوابة", "شؤون ضباط", "مبنى القيادة"]}
          />
        ),
        children: [
          { path: "", element: <OfficersHome /> },
          {
            path: "list",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <Officers /> }],
          },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ضباط"]} />,
            children: [{ path: "", element: <AddOfficers /> }],
          },
          {
            path: ":id",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ضباط"]} />,
            children: [{ path: "", element: <UpdateOfficers /> }],
          },
          {
            path: "details/:id",
            element: (
              <ProtectedRoute
                allowedTypes={["admin", "شؤون ضباط", "مبنى القيادة"]}
              />
            ),
            children: [{ path: "", element: <OfficerDetails /> }],
          },
          {
            path: "tmam",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <OfficersTmam /> }],
          },
          {
            path: "tmam/details/:id",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ضباط"]} />,
            children: [{ path: "", element: <OfficersTmamDetails /> }],
          },
          {
            path: "log",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <OfficersLog /> }],
          },
          {
            path: "search",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <SearchOfficers /> }],
          },
          {
            path: "arrival",
            element: <ProtectedRoute allowedTypes={["بوابة"]} />,
            children: [{ path: "", element: <OfficerArrival /> }],
          },
          {
            path: "departure",
            element: <ProtectedRoute allowedTypes={["بوابة"]} />,
            children: [{ path: "", element: <OfficerDeparture /> }],
          },
          {
            path: "manage",
            element: <ProtectedRoute allowedTypes={"شؤون ضباط"} />,
            children: [{ path: "", element: <ManageOfficers /> }],
          },
          {
            path: "manage-tmam",
            element: <ProtectedRoute allowedTypes={"شؤون ضباط"} />,
            children: [{ path: "", element: <ManageTmam /> }],
          },
          {
            path: "manage-duty",
            element: <ProtectedRoute allowedTypes={"شؤون ضباط"} />,
            children: [{ path: "", element: <OfficerDutyForm /> }],
          },
          {
            path: "manage-vacation",
            element: <ProtectedRoute allowedTypes={"شؤون ضباط"} />,
            children: [{ path: "", element: <ManageVacation /> }],
          },
          {
            path: "manage-mission",
            element: <ProtectedRoute allowedTypes={"شؤون ضباط"} />,
            children: [{ path: "", element: <ManageMission /> }],
          },
          {
            path: "manage-course",
            element: <ProtectedRoute allowedTypes={"شؤون ضباط"} />,
            children: [{ path: "", element: <ManageCourse /> }],
          },
          {
            path: "tmam/:id",
            element: <ProtectedRoute allowedTypes={["شؤون ضباط"]} />,
            children: [{ path: "", element: <UpdateTmam /> }],
          },
          {
            path: "tmam/add",
            element: <ProtectedRoute allowedTypes={["شؤون ضباط"]} />,
            children: [{ path: "", element: <AddTmam /> }],
          },
        ],
      },

      // Shuoon Routes
      {
        path: "shuoon/manage-vacation",
        element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
        children: [{ path: "", element: <ManageShuoonVacation /> }],
      },
      {
        path: "shuoon/manage-mission",
        element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
        children: [{ path: "", element: <ManageShuoonMission /> }],
      },
      {
        path: "shuoon/manage-course",
        element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
        children: [{ path: "", element: <ManageShuoonCourse /> }],
      },

      // NCOs Routes
      {
        path: "ncos",
        element: (
          <ProtectedRoute
            allowedTypes={["admin", "بوابة", "شؤون ادارية", "مبنى القيادة"]}
          />
        ),
        children: [
          { path: "", element: <NCOsHome /> },
          {
            path: "list",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <NCOs /> }],
          },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <AddNCOs /> }],
          },
          {
            path: ":id",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <UpdateNCOs /> }],
          },
          {
            path: "details/:id",
            element: (
              <ProtectedRoute
                allowedTypes={["admin", "شؤون ادارية", "مبنى القيادة"]}
              />
            ),
            children: [{ path: "", element: <NCODetails /> }],
          },
          {
            path: "tmam",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <NCOsTmam /> }],
          },
          {
            path: "tmam/add",
            element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
            children: [{ path: "", element: <AddNCOTmam /> }],
          },
          {
            path: "tmam/details/:id",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <NCOsTmamDetails /> }],
          },
          {
            path: "tmam/:id",
            element: <ProtectedRoute allowedTypes={["شؤون ادارية"]} />,
            children: [{ path: "", element: <UpdateNCOTmam /> }],
          },
          {
            path: "log",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <NCOsLog /> }],
          },
          {
            path: "search",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <SearchNCOs /> }],
          },
          { path: "arrival", element: <NCOArrival /> },
          { path: "departure", element: <NCODeparture /> },
          {
            path: "manage",
            element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
            children: [{ path: "", element: <ManageNCOs /> }],
          },
          {
            path: "manage-tmam",
            element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
            children: [{ path: "", element: <ManageNCOTmam /> }],
          },
        ],
      },

      // Soldiers Routes
      {
        path: "soldiers",
        element: (
          <ProtectedRoute allowedTypes={["admin", "بوابة", "شؤون ادارية", "مبنى القيادة"]} />
        ),
        children: [
          { path: "", element: <SoldiersHome /> },
          {
            path: "list",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <Soldiers /> }],
          },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <AddSoldiers /> }],
          },
          {
            path: ":id",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <UpdateSoldiers /> }],
          },
          {
            path: "details/:id",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية", "مبنى القيادة"]} />,
            children: [{ path: "", element: <SoldierDetails /> }],
          },
          {
            path: "tmam",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <SoldiersTmam /> }],
          },
          {
            path: "tmam/add",
            element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
            children: [{ path: "", element: <AddSoldierTmam /> }],
          },

          {
            path: "tmam/details/:id",
            element: <ProtectedRoute allowedTypes={["admin", "شؤون ادارية"]} />,
            children: [{ path: "", element: <SoldiersTmamDetails /> }],
          },
          {
            path: "tmam/:id",
            element: <ProtectedRoute allowedTypes={["شؤون ادارية"]} />,
            children: [{ path: "", element: <UpdateSoldierTmam /> }],
          },
          {
            path: "log",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <SoldiersLog /> }],
          },
          {
            path: "search",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <SearchSoldiers /> }],
          },
          // {
          //   path: "monitor",
          //   element: <ProtectedRoute allowedTypes={["بوابة","admin"]} />,
          //   children: [{ path: "", element: <RealTimeMonitor /> }],

          // },
          { path: "arrival", element: <SoldierArrival /> },
          { path: "departure", element: <SoldierDeparture /> },
          {
            path: "manage",
            element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
            children: [{ path: "", element: <ManageSoldiers /> }],
          },
          {
            path: "manage-tmam",
            element: <ProtectedRoute allowedTypes={"شؤون ادارية"} />,
            children: [{ path: "", element: <ManageSoldierTmam /> }],
          },
        ],
      },

      // Civillians Routes
      {
        path: "civillians",
        element: <ProtectedRoute allowedTypes={["admin", "بوابة"]} />,
        children: [
          { path: "", element: <CivilliansHome /> },
          {
            path: "list",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <Civillians /> }],
          },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <AddCivillians /> }],
          },
          {
            path: ":id",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <UpdateCivillians /> }],
          },
          {
            path: "details/:id",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <CivillianDetails /> }],
          },
          {
            path: "tmam",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <CivilliansTmam /> }],
          },
          {
            path: "tmam/details/:id",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <CivilliansTmamDetails /> }],
          },
          {
            path: "log",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <CivilliansLog /> }],
          },
          {
            path: "search",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <SearchCivillians /> }],
          },
          { path: "arrival", element: <CivillianArrival /> },
          { path: "departure", element: <CivillianDeparture /> },
        ],
      },

      // Experts Routes
      {
        path: "experts",
        element: (
          <ProtectedRoute allowedTypes={["admin", "بوابة", "قائد الامن"]} />
        ),
        children: [
          { path: "", element: <ExpertsHome /> },
          {
            path: "list",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <Experts /> }],
          },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={["admin", "قائد الامن"]} />,
            children: [{ path: "", element: <AddExperts /> }],
          },
          {
            path: ":id",
            element: <ProtectedRoute allowedTypes={["admin", "قائد الامن"]} />,
            children: [{ path: "", element: <UpdateExperts /> }],
          },
          {
            path: "details/:id",
            element: <ProtectedRoute allowedTypes={["admin", "قائد الامن"]} />,
            children: [{ path: "", element: <ExpertDetails /> }],
          },
          {
            path: "log",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <ExpertsLog /> }],
          },
          {
            path: "search",
            element: <ProtectedRoute allowedTypes={["admin", "قائد الامن"]} />,
            children: [{ path: "", element: <SearchExperts /> }],
          },
          { path: "arrival", element: <ExpertArrival /> },
          { path: "departure", element: <ExpertDeparture /> },
        ],
      },

      // Guests Routes
      {
        path: "guests",
        element: <ProtectedRoute allowedTypes={["admin", "بوابة"]} />,
        children: [
          { path: "", element: <GuestsHome /> },
          {
            path: "list",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <Guests /> }],
          },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <AddGuests /> }],
          },
          { path: "arrival", element: <GuestArrival /> },
          { path: "departure", element: <GuestDeparture /> },
        ],
      },

      // Delegates Routes

      {
        path: "delegates",
        element: (
          <ProtectedRoute allowedTypes={["admin", "بوابة", "قائد الامن"]} />
        ),
        children: [
          { path: "", element: <DelegatesHome /> },
          {
            path: "list",
            element: <ProtectedRoute allowedTypes={["admin", "قائد الامن"]} />,
            children: [{ path: "", element: <Delegates /> }],
          },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <AddDelegates /> }],
          },
          {
            path: "arrival",
            element: <ProtectedRoute allowedTypes={"بوابة"} />,
            children: [{ path: "", element: <DelegateArrival /> }],
          },
          {
            path: "departure",
            element: <ProtectedRoute allowedTypes={"بوابة"} />,
            children: [{ path: "", element: <DelegateDeparture /> }],
          },
        ],
      },

      // Past Workers
      {
        path: "past-workers",
        element: <ProtectedRoute allowedTypes={["admin", "مبنى القيادة"]} />,
        children: [
          { path: "", element: <PastWorkersHome /> },
          {
            path: "officers",
            element: (
              <ProtectedRoute allowedTypes={["admin", "مبنى القيادة"]} />
            ),
            children: [{ path: "", element: <PastOfficers /> }],
          },
          {
            path: "officers/:id",
            element: (
              <ProtectedRoute allowedTypes={["admin", "مبنى القيادة"]} />
            ),
            children: [{ path: "", element: <PastOfficerDetails /> }],
          },
          {
            path: "ncos",
            element: (
              <ProtectedRoute allowedTypes={["admin", "مبنى القيادة"]} />
            ),
            children: [{ path: "", element: <PastNCOs /> }],
          },
          {
            path: "ncos/:id",
            element: (
              <ProtectedRoute allowedTypes={["admin", "مبنى القيادة"]} />
            ),
            children: [{ path: "", element: <PastNCODetails /> }],
          },
          {
            path: "search",
            element: (
              <ProtectedRoute allowedTypes={["admin", "مبنى القيادة"]} />
            ),
            children: [{ path: "", element: <SearchPastWorkers /> }],
          },
        ],
      },

      // Users
      {
        path: "users",
        element: <Admin />,
        children: [
          { path: "", element: <Users /> },
          {
            path: "add",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <AddUsers /> }],
          },
          {
            path: ":id",
            element: <ProtectedRoute allowedTypes={"admin"} />,
            children: [{ path: "", element: <UpdateUsers /> }],
          },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
