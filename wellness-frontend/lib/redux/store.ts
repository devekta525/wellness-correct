import { configureStore } from "@reduxjs/toolkit";
import blogsReducer from "./features/blogsSlice";
import categoryReducer from "./features/categorySlice";
import productReducer from "./features/productSlice";
import leadReducer from "./features/leadSlice";
import userReducer from "./features/userSlice";
import reviewReducer from "./features/reviewSlice";
import addressReducer from "./features/addressSlice";
import orderReducer from "./features/orderSlice";
import settingReducer from "./features/settingSlice";
import authReducer from "./features/authSlice";
import sessionReducer from "./features/sessionSlice";
import popupReducer from "./features/popupSlice";
import couponReducer from "./features/couponSlice";
import newsletterReducer from "./features/newsletterSlice";
import notesReducer from "./features/notesSlice";
import appointmentReducer from "./features/appointmentSlice";
import prescriptionReducer from "./features/prescriptionSlice";
import reportReducer from "./features/reportSlice";
import dashboardReducer from "./features/dashboardSlice";
import { appointmentCountReducer } from "./features/dashboardSlice";
import patientReducer from "./features/patientSlice";
import doctorSettingsReducer from "./features/doctorSettingsSlice";

export const store = configureStore({
  reducer: {
    blogs: blogsReducer,
    categories: categoryReducer,
    products: productReducer,
    leads: leadReducer,
    users: userReducer,
    reviews: reviewReducer,
    address: addressReducer,
    order: orderReducer,
    settings: settingReducer,
    auth: authReducer,
    session: sessionReducer,
    popups: popupReducer,
    coupons: couponReducer,
    newsletters: newsletterReducer,
    notes: notesReducer,
    appointments: appointmentReducer,
    prescriptions: prescriptionReducer,
    reports: reportReducer,
    dashboard: dashboardReducer,
    appointmentCount: appointmentCountReducer,
    patients: patientReducer,
    doctorSettings: doctorSettingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
