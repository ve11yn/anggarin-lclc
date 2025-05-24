import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UserProvider } from "./contexts/userContext";
import { BudgetPlanProvider } from "./contexts/budgetPlanContext";
import { FundRequestProvider } from "./contexts/fundRequestContext";
import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "./tsx-file/login";
import Dashboard from "./tsx-file/dashboard";
import Register from "./tsx-file/register";
import Landing from "./tsx-file/landing";
import Details from "./tsx-file/details";
import Profile from "./tsx-file/profile";
import BudgetPlanPage from "./tsx-file/budgetPlan";
import FundRequest from "./tsx-file/fundRequest";
import Inbox from "./tsx-file/inbox";
import PublicBudgetPlanPage from "./tsx-file/budgetPlanPublic";
import BudgetPlanDetailsPage from "./tsx-file/budgetPlanDetails";
import CreateFundRequest from "./tsx-file/fundRequestCreate";


const firebaseConfig = {
  apiKey: "AIzaSyD4BolheSft4GjYAYCg9MDgp2_69ICOBsU",
  authDomain: "anggarin-23d30.firebaseapp.com",
  projectId: "anggarin-23d30",
  storageBucket: "anggarin-23d30.firebasestorage.app",
  messagingSenderId: "521467913214",
  appId: "1:521467913214:web:e25a403e57152e66b616af",
  measurementId: "G-EL7WMXMQT0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 

// import CreateBudgetPlan from './createBudgetPlan.tsx'
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Offline persistence can only be enabled in one tab at a time.");
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support offline persistence");
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <BudgetPlanProvider>
        <FundRequestProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />  
            <Route path="/" element={<Navigate to="/landing" />} />
            <Route path="/home" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/details" element={<Details />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/budgetPlan" element={<BudgetPlanPage />} />
            <Route path="/fundRequest/:planId" element={<FundRequest />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/publicBudgetPlan" element={<PublicBudgetPlanPage/>}/>
            <Route path="/budgetPlan/:planId" element={<BudgetPlanDetailsPage />}   />
            <Route path="/fund-requests/:planId/create" element={<CreateFundRequest />} />
          </Routes>
        </BrowserRouter>
        </FundRequestProvider>
      </BudgetPlanProvider>
    </UserProvider>
  </StrictMode>,
)