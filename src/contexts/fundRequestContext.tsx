// fundRequestContext.tsx - Fixed Version
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { createContext, ReactNode, useContext, useReducer } from "react";
import { db } from "../main";

export interface FundRequest {
  requestId: string;
  planId: string;
  requesterId: string;
  requesterName: string;
  fundAmount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approverId?: string;
  transactionHash?: string;
  rejectionReason?: string;
  notes?: string; // Added missing notes property
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
  | { type: "DELETE_REQUEST"; payload: string };

const FundRequestContext = createContext<{
  state: FundRequestState;
  createRequest: (request: Omit<FundRequest, "requestId" | "status" | "createdAt" | "updatedAt">) => Promise<string>;
  getRequest: (requestId: string) => Promise<FundRequest | null>;
  approveRequest: (requestId: string, approverId: string, updatePlanFunds: (planId: string, amount: number) => Promise<void>) => Promise<void>;
  rejectRequest: (requestId: string, rejectorId: string, reason?: string) => Promise<void>;
  completeRequest: (requestId: string, txHash: string) => Promise<void>;
  getPlanRequests: (planId: string) => Promise<FundRequest[]>;
  getUserRequests: (userId: string) => Promise<FundRequest[]>;
  deleteRequest: (requestId: string) => Promise<void>;
  updateRequestStatus: (requestId: string, status: 'approved' | 'rejected') => Promise<void>; // Added missing function
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
    try {
      // Validate required fields
      if (!request.planId || !request.requesterId || !request.requesterName) {
        throw new Error('Missing required fields');
      }
      if (!request.fundAmount || request.fundAmount <= 0) {
        throw new Error('Invalid fund amount');
      }
      if (!request.description || request.description.trim() === '') {
        throw new Error('Description is required');
      }

      const requestRef = doc(collection(db, "fundRequest"));
      const now = new Date().toISOString();

      const newRequest: FundRequest = {
        ...request,
        requestId: requestRef.id,
        requesterName: request.requesterName.trim(),
        description: request.description.trim(),
        status: "pending",
        createdAt: now,
        updatedAt: now
      };

      console.log('Saving request to Firestore:', newRequest);
      await setDoc(requestRef, newRequest);
      dispatch({ type: "ADD_REQUEST", payload: newRequest });
      return requestRef.id;
    } catch (error) {
      console.error('Error in createRequest:', error);
      throw error;
    }
  };

  const getRequest = async (requestId: string) => {
    try {
      const requestSnap = await getDoc(doc(db, "fundRequest", requestId));
      if (requestSnap.exists()) {
        const request = requestSnap.data() as FundRequest;
        dispatch({ type: "SET_CURRENT_REQUEST", payload: request });
        return request;
      }
      return null;
    } catch (error) {
      console.error('Error getting request:', error);
      throw error;
    }
  };

  const completeRequest = async (requestId: string, txHash: string) => {
    try {
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
    } catch (error) {
      console.error('Error completing request:', error);
      throw error;
    }
  };

  const approveRequest = async (
    requestId: string,
    approverId: string,
    updatePlanFunds: (planId: string, amount: number) => Promise<void>
  ) => {
    try {
      const requestRef = doc(db, "fundRequest", requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error('Request not found');
      }

      const request = requestSnap.data() as FundRequest;

      // Update request status
      await updateDoc(requestRef, {
        status: "approved",
        approverId,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update plan funds using injected function
      await updatePlanFunds(request.planId, -request.fundAmount);

      // Refresh the request data
      const updatedRequest = await getRequest(requestId);
      if (updatedRequest) {
        dispatch({ type: "UPDATE_REQUEST", payload: updatedRequest });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  };

  const rejectRequest = async (
    requestId: string,
    rejectorId: string,
    reason?: string
  ) => {
    try {
      const requestRef = doc(db, "fundRequest", requestId);
      await updateDoc(requestRef, {
        status: "rejected",
        approverId: rejectorId,
        rejectionReason: reason || "No reason provided",
        updatedAt: new Date().toISOString()
      });

      // Refresh the request data
      const updatedRequest = await getRequest(requestId);
      if (updatedRequest) {
        dispatch({ type: "UPDATE_REQUEST", payload: updatedRequest });
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  };

  // Added the missing updateRequestStatus function
  const updateRequestStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        await approveRequest(requestId, "admin123", () => Promise.resolve());
      } else {
        await rejectRequest(requestId, "admin123", "Declined via button");
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  };

  const getPlanRequests = async (planId: string) => {
    try {
      const q = query(
        collection(db, "fundRequest"),
        where("planId", "==", planId)
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => doc.data() as FundRequest);
      dispatch({ type: "SET_REQUESTS", payload: requests });
      return requests;
    } catch (error) {
      console.error('Error getting plan requests:', error);
      throw error;
    }
  };

  const getUserRequests = async (userId: string) => {
    try {
      const q = query(
        collection(db, "fundRequest"),
        where("requesterId", "==", userId)
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => doc.data() as FundRequest);
      dispatch({ type: "SET_REQUESTS", payload: requests });
      return requests;
    } catch (error) {
      console.error('Error getting user requests:', error);
      throw error;
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, "fundRequest", requestId));
      dispatch({ type: "DELETE_REQUEST", payload: requestId });
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
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
      deleteRequest,
      updateRequestStatus
    }}>
      {children}
    </FundRequestContext.Provider>
  );
};

export const useFundRequests = () => useContext(FundRequestContext);