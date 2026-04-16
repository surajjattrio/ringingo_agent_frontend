"use client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// PROJECT IMPROT
import { persistor, store } from "../store";

// THIRD-PARTY IMPORT
import { ToastContainer } from "react-toastify";

/* ============================== PROVIDER WRAPPER ============================== */

const ProviderWraper = ({ children }: { children: React.ReactNode }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
                <ToastContainer />
            </PersistGate>
        </Provider>
    );
};

export default ProviderWraper;
