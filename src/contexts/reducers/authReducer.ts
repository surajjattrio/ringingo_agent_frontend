// PROJECT IMPORTS
import { LOGIN, LOGOUT, PROCESS } from "../actions";

// TYPES
interface InitialStateProps {
  user?: any;
  isLoggedIn: boolean;
  isInitialized?: boolean;
}

interface ReducerActionProps {
  type: string;
  payload?: InitialStateProps;
}

const initialState: any = {
  user: null,
  isLoggedIn: false,
  isInitialized: false,
};

export const authReducer = (
  state = initialState,
  action: ReducerActionProps
) => {
  switch (action.type) {
    case LOGIN:
      const { user } = action.payload!;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user,
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        isInitialized: true,
        user: null,
      };
    case PROCESS:
      return {
        ...state,
        isLoggedIn: false,
        isInitialized: false,
        user: null
      };
    default:
      return {
        ...state,
      };
  }
};
