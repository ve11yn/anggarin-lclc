import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { createContext, ReactNode, useContext, useReducer } from "react";
import { db } from "../main";


export interface FundRequest {
    requestId: string;
    planId: string;
    requesterId: string; // user uid who made the request
    requesterName: string;
    fundAmount: number;  // Changed from string to number for monetary value
    description: string;    
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: string;
    updatedAt: string;
    approvedAt?: string;
    approverId?: string;
    transactionHash?: string; // blockchain hash 
    rejectionReason?: string; // Added for rejected requests
}

interface FundRequestState {
    requests: FundRequest[];
    currentRequest: FundRequest | null;
}

type FundRequestAction =
    | { type: "SET_REQUESTS"; payload: FundRequest[] }
    | { type: "SET_CURRENT_REQUEST"; payload: FundRequest }
    | { type: "ADD_REQUEST"; payload: FundRequest }
    | { type: "UPDATE_REQUEST"; payload: FundRequest }
    | { type: "DELETE_REQUEST"; payload: string }; // requestId

const FundRequestContext = createContext<{
    state: FundRequestState;
    createRequest: (request: Omit<FundRequest, "requestId" | "status" | "createdAt" | "updatedAt"> & {requesterName: string}) => Promise<string>;
    getRequest: (requestId: string) => Promise<FundRequest | null>;
    approveRequest: (requestId: string, approverId: string) => Promise<void>;
    rejectRequest: (requestId: string, rejectorId: string, reason?: string) => Promise<void>;
    completeRequest: (requestId: string, txHash: string) => Promise<void>;
    getPlanRequests: (planId: string) => Promise<FundRequest[]>;
    getUserRequests: (userId: string) => Promise<FundRequest[]>;
    deleteRequest: (requestId: string) => Promise<void>;
}>(null!);

const fundRequestReducer = (state: FundRequestState, action: FundRequestAction): FundRequestState => {
    switch (action.type) {
        case "SET_REQUESTS":
            return { ...state, requests: action.payload };
        case "SET_CURRENT_REQUEST":
            return { ...state, currentRequest: action.payload };
        case "ADD_REQUEST":
            return { ...state, requests: [...state.requests, action.payload] };
        case "UPDATE_REQUEST":
            return {
                ...state,
                requests: state.requests.map(req =>
                    req.requestId === action.payload.requestId ? action.payload : req
                ),
                currentRequest: state.currentRequest?.requestId === action.payload.requestId 
                    ? action.payload 
                    : state.currentRequest
            };
        case "DELETE_REQUEST":
            return {
                ...state,
                requests: state.requests.filter(req => req.requestId !== action.payload),
                currentRequest: state.currentRequest?.requestId === action.payload 
                    ? null 
                    : state.currentRequest
            };
        default:
            return state;
    }
};

export const FundRequestProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(fundRequestReducer, {
        requests: [],
        currentRequest: null

        
    });

    const createRequest = async (request: Omit<FundRequest, "requestId" | "status" | "createdAt" | "updatedAt">) => {
        const requestRef = doc(collection(db, "fundRequest"));
        const newRequest: FundRequest = {
            ...request,
            requestId: requestRef.id,
            requesterName: request.requesterName,
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await setDoc(requestRef, newRequest);
        dispatch({ type: "ADD_REQUEST", payload: newRequest });
        return requestRef.id;
    };

    const getRequest = async (requestId: string) => {
        const requestSnap = await getDoc(doc(db, "fundRequest", requestId));
        if (requestSnap.exists()) {
            const request = requestSnap.data() as FundRequest;
            dispatch({ type: "SET_CURRENT_REQUEST", payload: request });
            return request;
        }
        return null;
    };

    const approveRequest = async (requestId: string, approverId: string) => {
        const requestRef = doc(db, "fundRequest", requestId);
        await updateDoc(requestRef, {
          status: "approved",
          approverId,
          approvedAt: new Date().toISOString()
        });
        // Add blockchain integration here
      };
      
      const rejectRequest = async (requestId: string, rejectorId: string, reason: string) => {
        const requestRef = doc(db, "fundRequest", requestId);
        await updateDoc(requestRef, {
          status: "rejected",
          approverId: rejectorId,
          rejectionReason: reason,
          updatedAt: new Date().toISOString()
        });
      };

    const completeRequest = async (requestId: string, txHash: string) => {
        const update: Partial<FundRequest> = {
            status: "completed",
            transactionHash: txHash,
            updatedAt: new Date().toISOString()
        };
        
        await updateDoc(doc(db, "fundRequest", requestId), update);
        const updatedRequest = await getRequest(requestId);
        if (updatedRequest) {
            dispatch({ type: "UPDATE_REQUEST", payload: updatedRequest });
        }
    };

    const getPlanRequests = async (planId: string) => {
        const q = query(
            collection(db, "fundRequest"),
            where("planId", "==", planId)
        );
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => doc.data() as FundRequest);
        dispatch({ type: "SET_REQUESTS", payload: requests });
        return requests;
    };

    const getUserRequests = async (userId: string) => {
        const q = query(
            collection(db, "fundRequest"),
            where("requesterId", "==", userId)
        );
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => doc.data() as FundRequest);
        dispatch({ type: "SET_REQUESTS", payload: requests });
        return requests;
    };

    const deleteRequest = async (requestId: string) => {
        await deleteDoc(doc(db, "fundRequest", requestId));
        dispatch({ type: "DELETE_REQUEST", payload: requestId });
    };

    return (
        <FundRequestContext.Provider value={{
            state,
            createRequest,
            getRequest,
            approveRequest,
            rejectRequest,
            completeRequest,
            getPlanRequests,
            getUserRequests,
            deleteRequest
        }}>
            {children}
        </FundRequestContext.Provider>
    );
};

export const useFundRequests = () => useContext(FundRequestContext);