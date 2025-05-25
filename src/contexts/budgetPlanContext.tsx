import { arrayUnion, collection, doc, getDoc, getDocs, increment, query, setDoc, updateDoc, where } from "firebase/firestore";
import { createContext, ReactNode, useContext, useReducer } from "react";
import { db } from "../main";
import { FundRequest } from "./fundRequestContext";


export interface BudgetPlanContext {
  planId: string;
  ownerId: string;
  userId: string; 
  title: string;
  description: string;
  members: string[]; 
  totalFund: number;
  remainingFund: number;
  createdAt: string;
  fundRequests?: string[]; 
}

interface BudgetPlanState {
    plans: BudgetPlanContext[];
    currentPlan: BudgetPlanContext | null;
}

type BudgetPlanAction = 
    | { type: "SET_PLANS"; payload: BudgetPlanContext[] }
    | { type: "SET_CURRENT_PLAN"; payload: BudgetPlanContext }
    | { type: "ADD_PLAN"; payload: BudgetPlanContext }
    | { type: "UPDATE_PLAN"; payload: BudgetPlanContext }
    | { type: "ADD_MEMBER"; payload: { planId: string; userId: string } }
    | { type: "ADD_FUND_REQUEST"; payload: { planId: string; requestId: string } }
    | { type: "UPDATE_FUNDS"; payload: { planId: string; amount: number } };

const BudgetPlanContext = createContext<{
    state: BudgetPlanState;
    createPlan: (plan: Omit<BudgetPlanContext, "planId" | "createdAt">) => Promise<string>;
    getPlan: (planId: string) => Promise<BudgetPlanContext | null>;
    addMember: (planId: string, userId: string) => Promise<void>;
    addFundRequest: (planId: string, requestId: string) => Promise<void>;
    updateFunds: (planId: string, amount: number) => Promise<void>;
    getUserPlans: (userId: string) => Promise<BudgetPlanContext[]>;
    getAllPlans: () => Promise<BudgetPlanContext[]>; // Added this line
}>(null!);

// reducer function
// Updates the state based on the action dispatched (adds plans, updates funds, etc.).
const budgetPlanReducer = (state: BudgetPlanState, action: BudgetPlanAction): BudgetPlanState => {
    switch (action.type) {
      case "SET_PLANS":
        return { ...state, plans: action.payload };
      case "SET_CURRENT_PLAN":
        return { ...state, currentPlan: action.payload };
      case "ADD_PLAN":
        return { ...state, plans: [...state.plans, action.payload] };
      case "UPDATE_PLAN":
        return {
          ...state,
          plans: state.plans.map(plan =>
            plan.planId === action.payload.planId ? action.payload : plan
          ),
          currentPlan: state.currentPlan?.planId === action.payload.planId 
            ? action.payload 
            : state.currentPlan
        };
      case "ADD_MEMBER":
        return {
          ...state,
          plans: state.plans.map(plan =>
            plan.planId === action.payload.planId
              ? { ...plan, members: [...plan.members, action.payload.userId] }
              : plan
          )
        };
      case "ADD_FUND_REQUEST":
        return {
          ...state,
          plans: state.plans.map(plan =>
            plan.planId === action.payload.planId
              ? { 
                  ...plan, 
                  fundRequests: [...(plan.fundRequests || []), action.payload.requestId]
                }
              : plan
          )
        };
      case "UPDATE_FUNDS":
        return {
          ...state,
          plans: state.plans.map(plan =>
            plan.planId === action.payload.planId
              ? { 
                  ...plan, 
                  remainingFund: plan.remainingFund + action.payload.amount 
                }
              : plan
          )
        };
      default:
        return state;
    }
  };
  
  export const BudgetPlanProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(budgetPlanReducer, {
        plans: [],
        currentPlan: null
    });

    const createPlan = async (planData: Omit<BudgetPlanContext, "planId" | "createdAt">) => {
        const planRef = doc(collection(db, "budgetPlan")); // Singular
        const newPlan: BudgetPlanContext = {
            ...planData,
            planId: planRef.id,
            ownerId: planData.userId,
            createdAt: new Date().toISOString(),
            remainingFund: planData.totalFund,
            fundRequests: []
        };
        
        await setDoc(planRef, newPlan);
        dispatch({ type: "ADD_PLAN", payload: newPlan });
        
        await updateDoc(doc(db, "users", planData.userId), { // Singular
            budgetPlans: arrayUnion(planRef.id)
        });
        
        return planRef.id;
    };

    const getPlan = async (planId: string) => {
      const planSnap = await getDoc(doc(db, "budgetPlan", planId));
      if (planSnap.exists()) {
        const plan = planSnap.data() as BudgetPlanContext;
        dispatch({ type: "SET_CURRENT_PLAN", payload: plan });
        return plan;
      }
      return null;
    };

    const getAllPlans = async () => {
        const snapshot = await getDocs(collection(db, "budgetPlan")); // Singular
        const plans = snapshot.docs.map(doc => doc.data() as BudgetPlanContext);
        dispatch({ type: "SET_PLANS", payload: plans });
        return plans;
    };

    const addMember = async (planId: string, userId: string) => {
      try {
        await updateDoc(doc(db, "budgetPlan", planId), {
          members: arrayUnion(userId),
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error adding member:", error);
        throw error;
      }
    };

    const addFundRequest = async (planId: string, requestId: string) => {
      await updateDoc(doc(db, "budgetPlan", planId), {
        fundRequests: arrayUnion(requestId),
        updatedAt: new Date().toISOString()
      });
      dispatch({ 
        type: "ADD_FUND_REQUEST", 
        payload: { planId, requestId } 
      });
    };

    // In BudgetPlanContext.tsx
    const updateFunds = async (planId: string, amount: number) => {
      await updateDoc(doc(db, "budgetPlan", planId), {
        remainingFund: increment(amount),
        updatedAt: new Date().toISOString()
      });
      dispatch({ type: "UPDATE_FUNDS", payload: { planId, amount } });
    };

    const getUserPlans = async (userId: string) => {
        const q = query(
            collection(db, "budgetPlan"), // Singular
            where("members", "array-contains", userId)
        );
        const snapshot = await getDocs(q);
        const plans = snapshot.docs.map(doc => doc.data() as BudgetPlanContext);
        dispatch({ type: "SET_PLANS", payload: plans });
        return plans;
    };

    return (
        <BudgetPlanContext.Provider value={{
            state,
            createPlan,
            getPlan,
            addMember,
            addFundRequest,
            updateFunds,
            getUserPlans,
            getAllPlans
        }}>
            {children}
        </BudgetPlanContext.Provider>
    );
};

export const useBudgetPlans = () => useContext(BudgetPlanContext);