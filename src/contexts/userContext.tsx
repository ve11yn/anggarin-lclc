import { getAuth, onAuthStateChanged } from "firebase/auth";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import { db } from "../main";

export interface UserState {
    uid: string;
    email: string;
    name: string;
    phone: string;
    location: string;
    organization: string;
    department: string;
    position: string;
    description: string;
    fundCount: number;
    totalFund: number;
    remainingFund: number;
    createdAt: string;
    updatedAt: string;
    // how many plans this user have
    budgetPlans? : string[];
}

const initialState: UserState = {
    uid: "",
    email: "",
    name: "",
    phone: "",
    location: "",
    organization: "",
    department: "",
    position: "",
    description: "",
    fundCount: 0,
    totalFund: 0,
    remainingFund: 0,
    createdAt: "",
    updatedAt: "",
    budgetPlans: [],
};


type UserAction = 
    | { type: "SET_USER"; payload: Partial<UserState> }
    | { type: "ADD_BUDGET_PLAN"; payload: string}
    | { type: "LOGOUT" };

const reducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case "SET_USER":
            return { ...state, ...action.payload };
        case "ADD_BUDGET_PLAN":
            return { 
                ...state, 
                budgetPlans: [...(state.budgetPlans || []), action.payload] 
            };
        case "LOGOUT":
            return initialState;
        default:
            return state;
    }
};

interface UserContextType {
    state: UserState;
    dispatch: React.Dispatch<UserAction>;
    updateUser: (data: Partial<UserState>) => Promise<void>;
    addBudgetPlan: (planId: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
    state: initialState,
    dispatch: () => null,
    updateUser: async () => {},
    addBudgetPlan: async () => {}
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const auth = getAuth();

    // updateUser, addBudgetPlan
    

    const updateUser = async (data: Partial<UserState>) => {
        if (!state.uid) {
            throw new Error("No authenticated user");
        }
    
        try {
            const updateData = {
                ...data,
                updatedAt: new Date().toISOString(),
            };
    
            await updateDoc(doc(db, "users", state.uid), updateData);
            dispatch({ type: "SET_USER", payload: updateData });
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    };



    const addBudgetPlan = async (planId: string) => {
        if (!state.uid) return;
        await updateDoc(doc(db, "users", state.uid), {
            budgetPlans: arrayUnion(planId),
            updatedAt: new Date().toISOString()
        });
        dispatch({ type: "ADD_BUDGET_PLAN", payload: planId });
    };


    useEffect(() => {


        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        dispatch({
                            type: "SET_USER",
                            payload: {
                                uid: user.uid,
                                email: user.email || "",
                                ...data // Spread existing data
                            }
                        });
                    } else {
                        const newUser: UserState = {
                            uid: user.uid,
                            email: user.email || "",
                            name: "",
                            phone: "",
                            location: "",
                            organization: "",
                            department: "",
                            position: "",
                            description: "",
                            fundCount: 0,
                            totalFund: 0,
                            remainingFund: 0,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            budgetPlans: [],
                        };
    
                        await setDoc(doc(db, "users", user.uid), newUser);
                        dispatch({ type: "SET_USER", payload: newUser });
                    }
                } catch (error) {
                    console.error("Error handling auth state:", error);
                }
            } else {
                dispatch({ type: "LOGOUT" });
            }
        });

        return () => unsubscribe();
    }, [auth]);

    return (
        <UserContext.Provider value={{ state, dispatch, updateUser, addBudgetPlan}}>
            {children}
        </UserContext.Provider>
    );
};



export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};